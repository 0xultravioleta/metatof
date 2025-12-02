import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION_CUSTOM || "us-east-1"
});

// Cache for API keys
let cachedKeys = null;

async function getApiKeys() {
  if (cachedKeys) {
    return cachedKeys;
  }

  const secretName = process.env.LLM_SECRETS_NAME;
  if (!secretName) {
    throw new Error("LLM_SECRETS_NAME environment variable not set");
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(command);
    const secrets = JSON.parse(response.SecretString);

    cachedKeys = {
      anthropicKey: secrets.anthropic_api_key || null,
      openaiKey: secrets.openai_api_key || null
    };

    console.log("API keys loaded successfully");
    return cachedKeys;
  } catch (e) {
    console.error("Failed to load API keys:", e.message);
    throw new Error("Failed to load LLM API keys from Secrets Manager");
  }
}

// El prompt experto en Kabala para interpretar la vida
function buildKabalaPrompt(lifeData) {
  const { history, events, karma, finalConsciousness } = lifeData;

  // Analizar la historia de conciencia
  const avgConsciousness = history.reduce((sum, h) => sum + h.c, 0) / history.length;
  const maxConsciousness = Math.max(...history.map(h => h.c));
  const minConsciousness = Math.min(...history.map(h => h.c));

  // Clasificar eventos por como fueron vividos
  const transmutedEvents = events.filter(e => e.color === "#ffff00");
  const fallenEvents = events.filter(e => e.color === "#ff0000");
  const neutralEvents = events.filter(e => e.color === "#ffffff");

  const systemPrompt = `Eres el mejor contador de historias del mundo. Tu don es transformar datos de una vida en narrativas que conmueven el alma.

Tienes conocimiento profundo de:
- El Arbol de la Vida y como representa el viaje del alma (luz = crecimiento, sombra = pruebas)
- La Vesica Piscis como el punto de equilibrio perfecto entre opuestos
- Como cada evento de la vida es una oportunidad de aprender

TU ESTILO ES FUNDAMENTAL:
- Cuenta historias como lo haria un abuelo sabio junto al fuego
- Usa un lenguaje SIMPLE y EMOTIVO, nada rebuscado ni mistico
- Haz que el lector SIENTA la historia, no que la analice
- Los momentos de luz deben inspirar, los de sombra deben conmover
- Evita terminologia esoterica - si mencionas algo como "Tiferet", explicalo naturalmente (ej: "ese lugar del corazon donde habita la belleza")
- Cada parrafo debe enganchar al siguiente
- El final debe dejar una reflexion poderosa pero sencilla

REGLAS ABSOLUTAS:
- Escribe en espanol
- Primera persona (el alma cuenta su historia)
- Maximo 4 parrafos, cada uno con punch emocional
- NO uses palabras como: Sefira, Qliphoth, Tikun, transmutacion, encarnacion
- SI usa palabras como: luz, sombra, corazon, alma, camino, aprender, crecer, caer, levantarse`;

  const userPrompt = `Genera una narrativa biografica-espiritual basada en estos datos de una vida simulada:

## ESTADISTICAS DE CONCIENCIA
- Conciencia promedio durante la vida: ${avgConsciousness.toFixed(2)} (rango -1 a +1)
- Pico maximo de luz alcanzado: ${maxConsciousness.toFixed(2)}
- Caida mas profunda a la sombra: ${minConsciousness.toFixed(2)}
- Estado final al morir: ${finalConsciousness.toFixed(2)}
- Karma resultante para proxima vida: ${karma.toFixed(2)}

## EVENTOS TRANSMUTADOS (vividos desde la luz, conciencia > 0.3)
${transmutedEvents.length > 0
  ? transmutedEvents.map(e => `- ${e.name} (${e.age} anos) - Conciencia: ${e.consciousness.toFixed(2)}`).join('\n')
  : '- Ninguno'}

## EVENTOS CAIDOS (vividos desde la sombra, conciencia < -0.3)
${fallenEvents.length > 0
  ? fallenEvents.map(e => `- ${e.name} (${e.age} anos) - Conciencia: ${e.consciousness.toFixed(2)}`).join('\n')
  : '- Ninguno'}

## EVENTOS NEUTRALES (vividos en equilibrio)
${neutralEvents.length > 0
  ? neutralEvents.map(e => `- ${e.name} (${e.age} anos) - Conciencia: ${e.consciousness.toFixed(2)}`).join('\n')
  : '- Ninguno'}

## TRAYECTORIA DE VIDA
${describeTrajectory(history)}

---

Escribe una narrativa de 3-4 parrafos donde el alma cuenta su historia. Incluye:
1. Como comenzaron sus primeros pasos en la vida
2. Los momentos clave de luz y sombra, y que aprendio de cada uno
3. El balance final y que lleva consigo para continuar su camino

Cuenta la historia como si fueras un abuelo sabio junto al fuego. Haz que cada parrafo enganche al siguiente. El final debe dejar una reflexion poderosa pero sencilla.`;

  return { systemPrompt, userPrompt };
}

function describeTrajectory(history) {
  if (history.length < 10) return "Trayectoria corta o incompleta.";

  const segments = [];
  const segmentSize = Math.floor(history.length / 5);

  for (let i = 0; i < 5; i++) {
    const start = i * segmentSize;
    const end = Math.min((i + 1) * segmentSize, history.length);
    const segment = history.slice(start, end);
    const avgC = segment.reduce((sum, h) => sum + h.c, 0) / segment.length;

    const phase = i === 0 ? "Infancia" :
                  i === 1 ? "Juventud" :
                  i === 2 ? "Madurez temprana" :
                  i === 3 ? "Madurez plena" : "Vejez";

    const state = avgC > 0.3 ? "en la Luz" :
                  avgC < -0.3 ? "en la Sombra" : "en equilibrio";

    segments.push(`${phase}: predominantemente ${state} (${avgC.toFixed(2)})`);
  }

  return segments.join('\n');
}

async function callAnthropic(systemPrompt, userPrompt, apiKey) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(systemPrompt, userPrompt, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function handler(event) {
  console.log("Event received:", JSON.stringify(event));

  try {
    // Parse body
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body || !body.history || !body.events) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing required fields: history, events" })
      };
    }

    // Get API keys
    const keys = await getApiKeys();
    const provider = process.env.LLM_PROVIDER || "anthropic";

    // Build prompt
    const { systemPrompt, userPrompt } = buildKabalaPrompt(body);

    let story;

    if (provider === "anthropic" && keys.anthropicKey) {
      console.log("Using Anthropic Claude");
      story = await callAnthropic(systemPrompt, userPrompt, keys.anthropicKey);
    } else if (provider === "openai" && keys.openaiKey) {
      console.log("Using OpenAI GPT-4");
      story = await callOpenAI(systemPrompt, userPrompt, keys.openaiKey);
    } else if (keys.anthropicKey) {
      console.log("Fallback to Anthropic");
      story = await callAnthropic(systemPrompt, userPrompt, keys.anthropicKey);
    } else if (keys.openaiKey) {
      console.log("Fallback to OpenAI");
      story = await callOpenAI(systemPrompt, userPrompt, keys.openaiKey);
    } else {
      throw new Error("No API keys configured");
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        story,
        provider: provider,
        karma: body.karma,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
}
