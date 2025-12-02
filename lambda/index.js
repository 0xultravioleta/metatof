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
- MAXIMO 4 PARRAFOS (230 palabras total maximo)
- Cada parrafo debe ser conciso y poetico
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

Escribe una narrativa de 4 PARRAFOS (maximo 230 palabras en total).

Parrafo 1: Como comenzo el viaje y los primeros desafios.
Parrafo 2: Los momentos de luz que iluminaron el camino.
Parrafo 3: Las sombras que probaron el alma.
Parrafo 4: La leccion final y lo que se lleva al partir.

Se poetico pero conciso. Cada palabra debe tener peso.`;

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
      max_tokens: 700,
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
      max_tokens: 700,
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

// Event generation prompt
function buildEventGenerationPrompt(karma) {
  const systemPrompt = `Eres un disenador de destinos. Tu trabajo es crear los eventos que marcaran una vida humana COHERENTE.

REGLA CRITICA DE COHERENCIA:
Los eventos deben tener SENTIDO NARRATIVO. Cada evento afecta los siguientes:
- Si hay "Divorcio" a los 40, NO puede haber "Bodas de Oro" a los 70
- Si hay "Muerte de Conyuge" a los 60, NO puede haber eventos de pareja despues
- Si hay "Bancarrota" a los 45, los eventos siguientes deben reflejar pobreza o recuperacion
- Si hay "Enfermedad Terminal" no puede haber "Curacion Milagrosa" despues a menos que sea dharmic
- Los hijos solo pueden nacer si hubo matrimonio o relacion antes
- "Boda de Hijo" solo si antes hubo "Nacimiento de Hijo"

El karma de la vida anterior determina la proporcion:
- Karma negativo (< -0.2): Mas pruebas duras, vida dificil
- Karma positivo (> 0.2): Mas bendiciones, vida afortunada
- Karma neutro: Balance de luz y sombra

REGLAS:
- Genera 18-22 eventos coherentes entre si
- Cada evento: nombre corto (max 4 palabras), edad (4-95), tipo (standard/karmic/dharmic)
- PIENSA EN LA HISTORIA COMPLETA antes de generar
- Los eventos deben formar una narrativa logica
- En espanol, concretos y evocadores

FORMATO JSON:
[{"name": "Evento", "age": 25, "type": "standard"}]`;

  const karmaDescription = karma < -0.2 ? "negativo (vida dificil)" :
                           karma > 0.2 ? "positivo (vida afortunada)" :
                           "neutro (vida balanceada)";

  const userPrompt = `Karma heredado: ${karma.toFixed(2)} (${karmaDescription}).

IMPORTANTE: Genera una vida COHERENTE donde cada evento tenga consecuencias logicas en los siguientes.

Ejemplo de MALA coherencia (NO HACER):
- Muerte de Conyuge (60) -> Bodas de Oro (70) [IMPOSIBLE]
- Bancarrota (45) -> Compra de Mansion (50) [INCOHERENTE]

Ejemplo de BUENA coherencia:
- Matrimonio (28) -> Nacimiento Hijo (32) -> Boda de Hijo (58)
- Divorcio (40) -> Soledad (45) -> Nuevo Amor (52)
- Bancarrota (45) -> Trabajo Humilde (48) -> Recuperacion Lenta (55)

Responde SOLO con el JSON array.`;

  return { systemPrompt, userPrompt };
}

async function generateLifeEvents(karma, apiKey, provider) {
  const { systemPrompt, userPrompt } = buildEventGenerationPrompt(karma);

  let response;
  if (provider === "anthropic") {
    response = await callAnthropic(systemPrompt, userPrompt, apiKey);
  } else {
    response = await callOpenAI(systemPrompt, userPrompt, apiKey);
  }

  // Parse JSON from response
  try {
    // Extract JSON array from response (handle markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    const events = JSON.parse(jsonStr);

    // Add universal events and convert to expected format
    const universalEvents = [
      { t: 0.00, name: "Nacimiento", age: 0, type: "universal" },
      { t: 0.18, name: "Mayoria de Edad", age: 18, type: "universal" },
      { t: 0.99, name: "Muerte Fisica", age: 99, type: "universal" }
    ];

    const formattedEvents = events.map(e => ({
      t: e.age / 100,
      name: e.name,
      age: e.age,
      type: e.type
    }));

    // Combine and sort by age
    const allEvents = [...universalEvents, ...formattedEvents];
    allEvents.sort((a, b) => a.t - b.t);

    return allEvents;
  } catch (e) {
    console.error("Failed to parse events JSON:", e, "Response:", response);
    throw new Error("Failed to parse generated events");
  }
}

export async function handler(event) {
  console.log("Event received:", JSON.stringify(event));

  // Determine which endpoint was called
  const path = event.rawPath || event.path || "";
  const isEventGeneration = path.includes("generate-events");

  try {
    // Parse body
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Get API keys
    const keys = await getApiKeys();
    const provider = process.env.LLM_PROVIDER || "anthropic";

    // Determine which API key to use
    let apiKey;
    let actualProvider;
    if (provider === "anthropic" && keys.anthropicKey) {
      apiKey = keys.anthropicKey;
      actualProvider = "anthropic";
    } else if (provider === "openai" && keys.openaiKey) {
      apiKey = keys.openaiKey;
      actualProvider = "openai";
    } else if (keys.anthropicKey) {
      apiKey = keys.anthropicKey;
      actualProvider = "anthropic";
    } else if (keys.openaiKey) {
      apiKey = keys.openaiKey;
      actualProvider = "openai";
    } else {
      throw new Error("No API keys configured");
    }

    console.log(`Using provider: ${actualProvider}, endpoint: ${isEventGeneration ? 'generate-events' : 'generate-story'}`);

    // Route to appropriate handler
    if (isEventGeneration) {
      // EVENT GENERATION ENDPOINT
      const karma = body?.karma ?? 0;
      console.log("Generating life events for karma:", karma);

      const events = await generateLifeEvents(karma, apiKey, actualProvider);

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          events,
          karma,
          provider: actualProvider,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      // STORY GENERATION ENDPOINT
      if (!body || !body.history || !body.events) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing required fields: history, events" })
        };
      }

      const { systemPrompt, userPrompt } = buildKabalaPrompt(body);
      let story;

      if (actualProvider === "anthropic") {
        story = await callAnthropic(systemPrompt, userPrompt, apiKey);
      } else {
        story = await callOpenAI(systemPrompt, userPrompt, apiKey);
      }

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          story,
          provider: actualProvider,
          karma: body.karma,
          timestamp: new Date().toISOString()
        })
      };
    }

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
