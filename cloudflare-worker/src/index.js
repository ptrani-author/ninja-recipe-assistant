// Cloudflare Worker per Ninja Recipe Assistant
// Gestisce le richieste API e il rate limiting

export default {
  async fetch(request, env, ctx) {
    // Abilita CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Gestione delle route
    if (path === '/api/generate-recipe' && request.method === 'POST') {
      return handleGenerateRecipe(request, env);
    }

    if (path === '/api/test-rate-limit') {
      if (request.method === 'GET') {
        return handleGetRateLimitStatus(request, env);
      } else if (request.method === 'DELETE') {
        return handleResetRateLimit(request, env);
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

// Rate limiting con Cloudflare KV
async function checkRateLimit(ip, env) {
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = 3 * 60 * 60 * 1000; // 3 ore
  const maxRequests = 10;

  try {
    const current = await env.RATE_LIMITS.get(key, { type: 'json' });
    
    if (!current) {
      // Prima richiesta
      const newEntry = {
        requests: 1,
        firstRequest: now,
        lastRequest: now
      };
      await env.RATE_LIMITS.put(key, JSON.stringify(newEntry), { expirationTtl: windowMs / 1000 });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    // Controlla se la finestra è scaduta
    if (now - current.firstRequest > windowMs) {
      const newEntry = {
        requests: 1,
        firstRequest: now,
        lastRequest: now
      };
      await env.RATE_LIMITS.put(key, JSON.stringify(newEntry), { expirationTtl: windowMs / 1000 });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    // Controlla se ha superato il limite
    if (current.requests >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: current.firstRequest + windowMs 
      };
    }

    // Incrementa il contatore
    current.requests++;
    current.lastRequest = now;
    await env.RATE_LIMITS.put(key, JSON.stringify(current), { expirationTtl: windowMs / 1000 });

    return { 
      allowed: true, 
      remaining: maxRequests - current.requests, 
      resetTime: current.firstRequest + windowMs 
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
}

// Ottiene l'IP del client
function getClientIP(request) {
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  const xRealIP = request.headers.get('X-Real-IP');
  
  return cfConnectingIP || xForwardedFor?.split(',')[0] || xRealIP || 'unknown';
}

// Gestisce la generazione delle ricette
async function handleGenerateRecipe(request, env) {
  try {
    const ip = getClientIP(request);
    
    // Controlla rate limit
    const rateLimit = await checkRateLimit(ip, env);
    
    if (!rateLimit.allowed) {
      const resetTime = new Date(rateLimit.resetTime).toLocaleString('de-DE');
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. You can make ${rateLimit.remaining} more requests. Limit resets at ${resetTime}.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Ottieni i dati dalla richiesta
    const { ingredients, filters } = await request.json();
    
    if (!ingredients) {
      return new Response(
        JSON.stringify({ error: 'Ingredients are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Chiamata a OpenAI
    const recipe = await generateRecipeWithOpenAI(ingredients, filters);
    
    return new Response(
      JSON.stringify(recipe),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      }
    );
    
  } catch (error) {
    console.error('Error generating recipe:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Genera la ricetta con OpenAI
async function generateRecipeWithOpenAI(ingredients, filters) {
  const prompt = `C – CONTEXT
Wir entwickeln Rezepte für das „Ninja Heißluftfritteuse Megarezeptbuch". Ziel: das zuverlässigste Air‑Fryer‑Kochbuch für unsere Buyer‑Persona **„Sabine Schröder"** – deutsche Hobbyköchin, praktisch, braucht alltagstaugliche, gelingsichere Rezepte auf Deutsch mit Zutaten aus Rewe/Edeka/Aldi/Lidl.

R – ROLE
Du bist ein erfahrener deutscher **Rezeptentwickler & Food‑Editor** (20 Jahre, Stil wie „Essen & Trinken"). Präzise, ermutigend, expertenhaft, Spezialist für gutbürgerliche Küche in modernen Geräten.

––––––––––––––––––––––––––––––––––––
[START USER INPUT]
ZUTATEN: ${ingredients}
FILTERN: ${JSON.stringify(filters)}
––––––––––––––––––––––––––––––––––––

A – ACTION (Regeln für jede Rezept‑Generierung)
1. Sprache **ausschließlich Deutsch**.
2. Portionsgröße fest = **4**.
3. Verwende **nur** die genannten Zutaten + Basiszutatenliste: Salz, Pfeffer, Öl, Zwiebel, Knoblauch, Brühe, getrocknete Kräuter.
4. **Nur Ninja‑Heißluftfritteuse** verwenden. Wenn die Zutaten es erlauben und sinnvoll ist, nutze die **DUAL‑ZONE‑Funktion** (getrennte Körbe) und erkläre klar, was in Zone 1 und Zone 2 passiert.
5. Schritt‑für‑Schritt‑Anleitung, nummeriert. – Für jeden relevanten Schritt: Funktion (Air Fry, Max Crisp, Roast …), Temperatur °C, Zeit Min.
6. Baue mindestens einen **„Profi‑Tipp"** ein, der typische Fehler vermeidet (Extra‑Knusprigkeit, Rauch reduzieren …).
7. Schätze Nährwerte **pro Portion**: Kalorien, Eiweiß, Kohlenhydrate, Fett.
8. Stil: zuverlässig, ermutigend, präzise (gelingsicher).
9. Geschmack: alltagstauglich deutsch, nicht zu exotisch.
10. Wenn keine sinnvolle/sichere Rezeptidee möglich → antworte **nur** mit \`\`\`json {"error":"Mit diesen Zutaten kann ich leider kein sinnvolles Rezept erstellen. Ergänze 1–2 Basiszutaten und versuche es erneut."} \`\`\`

F – FORMAT
Antworte ausschließlich als gültiges JSON nach diesem Schema:
\`\`\`json
{
  "title": "Rezepttitel",
  "portions": 4,
  "totalTime": "Gesamtzeit in Minuten",
  "ingredients": ["Liste der Zutaten"],
  "instructions": [
    {
      "step": 1,
      "instruction": "Anweisung",
      "function": "Air Fry | Max Crisp | Roast | Bake | Reheat | Dehydrate",
      "temperature": 180,
      "time": 15,
      "zone": "1 | 2 | beide"
    }
  ],
  "profiTip": "Praktischer Tipp",
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 30,
    "fat": 15
  }
}
\`\`\`
Keine zusätzlichen Felder, kein Fließtext außerhalb des JSON!`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Gestisce lo status del rate limit
async function handleGetRateLimitStatus(request, env) {
  const ip = getClientIP(request);
  const key = `rate_limit:${ip}`;
  
  try {
    const current = await env.RATE_LIMITS.get(key, { type: 'json' });
    const maxRequests = 10;
    
    if (!current) {
      return new Response(
        JSON.stringify({
          ip,
          status: {
            requests: 0,
            remaining: maxRequests,
            firstRequest: null,
            lastRequest: null
          },
          message: 'Rate limit test endpoint'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ip,
        status: {
          requests: current.requests,
          remaining: maxRequests - current.requests,
          firstRequest: new Date(current.firstRequest).toLocaleString('de-DE'),
          lastRequest: new Date(current.lastRequest).toLocaleString('de-DE'),
          resetTime: new Date(current.firstRequest + (3 * 60 * 60 * 1000)).toLocaleString('de-DE')
        },
        message: 'Rate limit test endpoint'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get rate limit status' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// Resetta il rate limit
async function handleResetRateLimit(request, env) {
  const ip = getClientIP(request);
  const key = `rate_limit:${ip}`;
  
  try {
    await env.RATE_LIMITS.delete(key);
    return new Response(
      JSON.stringify({
        ip,
        message: 'Rate limit reset for this IP'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to reset rate limit' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 