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
    const recipe = await generateRecipeWithOpenAI(ingredients, filters, env);
    
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
async function generateRecipeWithOpenAI(ingredients, filters, env) {
  const prompt = `C – CONTEXT  
Wir erstellen Rezepte für das „Ninja Heißluftfritteuse Megarezeptbuch".  
Leserin **Sabine Schröder**: deutsche Hobbyköchin, wünscht verlässliche, alltagstaugliche Rezepte.

R – ROLE  
Du bist ein deutscher Rezeptentwickler & Food-Editor (20 Jahre Erfahrung, Stil „Essen & Trinken"), Spezialist für Ninja-Heißluftfritteusen.

–––– USER INPUT ––––  
VORHANDENE ZUTATEN (Komma-getrennt):  ${ingredients}  
FILTER (Objekt):                       ${JSON.stringify(filters)}   // mealType, style, diet, time, spice, budget  
–––––––––––––––––––––––––––––––––––––––

A – ACTION (Regeln)  
1. **Nur Deutsch**.  
2. **Portionen = 4**.  
3. **Zutatenwahl**:  
   • Analysiere die vom Nutzer angegebenen Zutaten und entwickle daraus eine sinnvolle, alltagstaugliche Rezeptidee.  
   • Verwende KEINE weiteren Lebensmittel außer der festen *Basiszutatenliste*: Salz, Pfeffer, Öl, Zwiebel, Knoblauch, Brühe, getrocknete Kräuter.  
   • **WICHTIG**: Verwende KEINE Flüssigkeiten wie Brühe, Wasser, Milch etc. als Hauptzutat - sie sind nicht für die Air Fryer geeignet.
4. **Nur Ninja-Heißluftfritteuse**: JEDER Schritt muss ausschließlich in der Ninja Air Fryer durchführbar sein. Keine anderen Geräte, keine Pfannen, keine Töpfe, keine weiteren Küchenutensilien. Spare maximal beim Abwasch!  
   – Nutze die **DUAL-ZONE** sinnvoll: Falls Haupt- und Beilage getrennt gegart werden können → erkläre Zone 1 und Zone 2.  
5. Schritt-für-Schritt-Anleitung, nummeriert.  
   – Für jeden Kochschritt mit Hitze: Funktion (Air Fry | Max Crisp | Roast | Bake | Reheat | Dehydrate), Temperatur °C, Zeit Min, Zone (1 | 2 | beide).  
6. Mengenangaben: Verwende ausschließlich die in Deutschland üblichen Einheiten: Gramm (g), Kilogramm (kg), Milliliter (ml), Liter (l), Esslöffel (EL), Teelöffel (TL), Prise, Stück.  
7. Baue mind. einen **Profi-Tipp** ein.  
8. Nährwerte pro Portion: Kalorien, Eiweiß, Kohlenhydrate, Fett (Schätzung).  
9. Stil: zuverlässig, präzise, ermutigend, gelingsicher.  
10. Geschmack: deutsch-alltagstauglich, nicht exotisch.  
11. **Fokus auf Crispy/Croccante**: Erstelle Rezepte die typisch für die Air Fryer sind - knusprig, knackig, mit schöner Kruste.
12. Kann kein sinnvolles Rezept erstellt werden → antworte ausschließlich  
    \`\`\`json
    {"error":"Mit diesen Zutaten kann ich leider kein sinnvolles Rezept erstellen. Ergänze 1–2 Basiszutaten und versuche es erneut."}
    \`\`\`

F – FORMAT  
Gib ausschließlich folgendes JSON zurück:  
{
  "title":        "Rezepttitel",
  "portions":     4,
  "totalTime":    "Gesamtzeit in Minuten",
  "ingredients":  ["Zutaten mit Mengen (g, kg, ml, l, EL, TL, Prise, Stück)"],
  "instructions": [
    {
      "step":        1,
      "instruction": "Text",
      "function":    "Air Fry | Max Crisp | Roast | Bake | Reheat | Dehydrate",
      "temperature": 180,
      "time":        15,
      "zone":        "1 | 2 | beide"
    }
  ],
  "profiTip": "Praxis-Tipp",
  "nutrition": { "calories": 350, "protein": 25, "carbs": 30, "fat": 15 }
}`;

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