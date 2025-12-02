# Metatof Infrastructure

Terraform configuration for the Life Story Generator API.

## State Management

Terraform state is stored remotely in S3 with DynamoDB locking:
- **S3 Bucket**: `metatof-terraform-state-518898403364`
- **DynamoDB Table**: `metatof-terraform-locks`
- **State Key**: `metatof/terraform.tfstate`

This ensures team collaboration and prevents state corruption.

## Resources Created

- **Secrets Manager**: Single secret for both Anthropic and OpenAI API keys
- **Lambda Function**: Node.js 20.x function to generate life stories
- **API Gateway (HTTP)**: REST endpoint for the frontend
- **CloudWatch Log Group**: Lambda logs with 14-day retention
- **IAM Role & Policy**: Lambda execution permissions

All resources are tagged with:
- `Project`: metatof
- `Environment`: prod (configurable)
- `ManagedBy`: terraform
- `Application`: life-story-generator

## Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.0
- Node.js >= 18 (for Lambda dependencies)

## Setup

1. Install Lambda dependencies:
```bash
cd ../lambda
npm install
cd ../terraform
```

2. Initialize Terraform (downloads providers and configures S3 backend):
```bash
terraform init
```

3. Deploy infrastructure:
```bash
terraform apply
```

4. After deployment, store your API keys (single secret with both keys):
```bash
aws secretsmanager put-secret-value \
  --secret-id metatof-prod-llm-api-keys \
  --secret-string '{"anthropic_api_key":"YOUR_ANTHROPIC_KEY","openai_api_key":"YOUR_OPENAI_KEY"}'
```

5. Update the frontend environment:
Create a `.env` file in the project root:
```
VITE_LIFE_STORY_API=https://your-api-endpoint/generate-story
```

## Configuration

### LLM Provider Selection

Set the `llm_provider` variable to choose the default LLM:
```bash
terraform apply -var="llm_provider=openai"  # or "anthropic" (default)
```

### Environment

Default is `prod`. Change for different environments:
```bash
terraform apply -var="environment=dev"
```

### Region

Default is `us-east-1`. Change with:
```bash
terraform apply -var="aws_region=eu-west-1"
```

## Outputs

After `terraform apply`, you'll see:
- `api_endpoint`: The API Gateway URL for the frontend
- `llm_secret_name`: Secret name to store your API keys
- `secret_setup_command`: Ready-to-use command to store keys

## Destroy

```bash
terraform destroy
```

## Cost Optimization

- Uses a single Secrets Manager secret for both API keys ($0.40/month instead of $0.80)
- CloudWatch logs auto-expire after 14 days
- Lambda only runs on-demand (pay per invocation)
