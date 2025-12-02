terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket         = "metatof-terraform-state-518898403364"
    key            = "metatof/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "metatof-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Application = "life-story-generator"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "metatof"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "llm_provider" {
  description = "LLM provider to use: anthropic or openai"
  type        = string
  default     = "anthropic"
  validation {
    condition     = contains(["anthropic", "openai"], var.llm_provider)
    error_message = "llm_provider must be either 'anthropic' or 'openai'"
  }
}

locals {
  resource_prefix = "${var.project_name}-${var.environment}"
}

# Single Secret for both API Keys (JSON format)
resource "aws_secretsmanager_secret" "llm_api_keys" {
  name                    = "${local.resource_prefix}-llm-api-keys"
  description             = "API Keys for LLM providers (Anthropic and OpenAI)"
  recovery_window_in_days = 0 # Immediate deletion for dev

  tags = {
    Name = "${local.resource_prefix}-llm-api-keys"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${local.resource_prefix}-life-story-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.resource_prefix}-life-story-lambda-role"
  }
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${local.resource_prefix}-life-story-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          aws_secretsmanager_secret.llm_api_keys.arn
        ]
      }
    ]
  })
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${local.resource_prefix}-life-story-generator"
  retention_in_days = 14

  tags = {
    Name = "${local.resource_prefix}-life-story-logs"
  }
}

# Lambda Function
resource "aws_lambda_function" "life_story" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${local.resource_prefix}-life-story-generator"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 60
  memory_size      = 512

  environment {
    variables = {
      LLM_PROVIDER      = var.llm_provider
      LLM_SECRETS_NAME  = aws_secretsmanager_secret.llm_api_keys.name
      AWS_REGION_CUSTOM = var.aws_region
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs,
    aws_iam_role_policy.lambda_policy
  ]

  tags = {
    Name = "${local.resource_prefix}-life-story-generator"
  }
}

# Package Lambda code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda"
  output_path = "${path.module}/lambda.zip"
}

# API Gateway REST API
resource "aws_apigatewayv2_api" "life_story_api" {
  name          = "${local.resource_prefix}-life-story-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }

  tags = {
    Name = "${local.resource_prefix}-life-story-api"
  }
}

# API Gateway Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.life_story_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.life_story.invoke_arn
  payload_format_version = "2.0"
}

# API Gateway Route
resource "aws_apigatewayv2_route" "generate_story" {
  api_id    = aws_apigatewayv2_api.life_story_api.id
  route_key = "POST /generate-story"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.life_story_api.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Name = "${local.resource_prefix}-life-story-api-stage"
  }
}

# Lambda Permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.life_story.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.life_story_api.execution_arn}/*/*"
}

# Outputs
output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = "${aws_apigatewayv2_api.life_story_api.api_endpoint}/generate-story"
}

output "llm_secret_arn" {
  description = "ARN of LLM API keys secret"
  value       = aws_secretsmanager_secret.llm_api_keys.arn
}

output "llm_secret_name" {
  description = "Name of LLM API keys secret (use this to store your keys)"
  value       = aws_secretsmanager_secret.llm_api_keys.name
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.life_story.function_name
}

output "secret_setup_command" {
  description = "Command to store your API keys"
  value       = <<-EOT
    aws secretsmanager put-secret-value \
      --secret-id ${aws_secretsmanager_secret.llm_api_keys.name} \
      --secret-string '{"anthropic_api_key":"YOUR_ANTHROPIC_KEY","openai_api_key":"YOUR_OPENAI_KEY"}'
  EOT
}
