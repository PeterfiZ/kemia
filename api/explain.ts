import { GoogleGenAI } from "@google/genai";

interface VercelReq {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
}

async function generateExplanation(ai: GoogleGenAI, prompt: string): Promise<string> {
  const models = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
  let lastError: unknown = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 800));
        }
      }
    }
  }
  throw lastError || new Error("Minden AI próbálkozás sikertelen volt.");
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Csak POST kérés támogatott." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Érvénytelen JSON törzs." });
    }
  }

  const { number, symbol, name, category, electronConfig, period, group, chemicalReview } = body || {};

  if (!name || !symbol) {
    return res.status(400).json({ error: "Hiányzó elem adatok." });
  }

  const headerKeyRaw = req.headers?.["x-gemini-api-key"];
  const headerKey = Array.isArray(headerKeyRaw) ? headerKeyRaw[0] : headerKeyRaw;
  const apiKey = process.env.GEMINI_API_KEY || (headerKey ? headerKey.trim() : "");

  if (!apiKey) {
    return res.status(200).json({
      isAi: false,
      text: `### 🏫 Helyi Kémia Tanár (Offline Mód)\n\n**A(z) ${name} (${symbol}) kémiai és fizikai tulajdonságainak didaktikus magyarázata:**\n\n- **Rendszám:** ${number}\n- **Helye a periódusos rendszerben:** ${period}. periódus, ${group}. csoport (${category})\n- **Elektronkonfiguráció:** \`${electronConfig}\`\n\n#### Miért viselkedik így a(z) ${name}?\n${chemicalReview}\n\n#### 💡 Tanulási Tipp:\nJegyezd meg a(z) **${symbol}** vegyjelet, a(z) **${number}**-es rendszámot, s hogy az elektronszerkezet alapján hányadik héjon találhatóak a vegyértékelektronjai. Ez meghatározza a reakcióit!\n\n_Szeretnél mélyebb AI magyarázatot? Állítsd be a \`GEMINI_API_KEY\` változót a Vercel projektben, vagy add meg a saját kulcsodat a bal alsó sarokban lévő 🔑 (Kulcs) ikonnal!_`,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `Te egy barátságos, kiváló és nagy tudású Kémia Professzor és Tanár vagy. 
Kérlek magyarázd el didaktikusan, diákok számára könnyen érthetően, de tudományosan pontosan a(z) ${name} (${symbol}) nevű elem kémiai sajátosságait!

Íme néhány alapvető adat segítségként:
- Rendszám: ${number}
- Periódus: ${period}, Csoport: ${group}
- Kategória: ${category}
- Elektronkonfiguráció: ${electronConfig}
- Alapvető kémiai leírás: ${chemicalReview}

Kérlek térj ki a következőkre a magyarázatodban:
1. **Atomi felépítés és Helyzet**: Hogyan határozza meg a periódusos rendszerben betöltött helye és a külső vegyértékhéj szerkezete a viselkedését?
2. **Reaktivitás és Kötések**: Milyen elemekkel lép szívesen reakcióba, és milyen típusú kötéseket (kovalens, ionos, fémes) alakít ki? Adj néhány konkrét példát hétköznapi vegyületeire is!
3. **Különlegességek**: Említs valami izgalmas kémiai kísérletet vagy jelenséget, ami ehhez az elemhez kapcsolódik.
4. **🧠 Memóriatrükk / Tanulási Segédlet**: Adj egy könnyű tippet vagy asszociációt, amivel a diákok azonnal megjegyezhetik az elemet és a tulajdonságait!

Válaszolj gyönyörű, strukturált magyar nyelven. Használj gazdag Markdown formázást: címsorokat (###), vastag betűket, felsorolásokat és kódblokkokat a képletekhez!`;

    const explanationText = await generateExplanation(ai, prompt);

    return res.status(200).json({
      isAi: true,
      text: explanationText,
    });
  } catch (err: any) {
    console.error("Vercel /api/explain Gemini error:", err);
    return res.status(200).json({
      isAi: false,
      text: `### ⚠️ Hiba történt az AI magyarázat generálásakor\n\nA szerver nem tudott kommunikálni a Gemini modellel. Íme a helyi magyarázat helyette:\n\n**A(z) ${name} (${symbol}):**\n\n${chemicalReview}\n\n_Hiba oka: ${err?.message || String(err)}_`,
    });
  }
}
