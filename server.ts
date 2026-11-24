import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialize Gemini client to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    return null;
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: currentKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini SDK successfully initialized.");
    } catch (e) {
      console.error("Failed to initialize Gemini SDK:", e);
    }
  }
  return aiClient;
}

// Local Fallback Database for common chemical reactions (Offline Mode)
const FALLBACK_REACTIONS: Record<string, any> = {
  "H_O": {
    canReact: true,
    equation: "2 H₂ + O₂ → 2 H₂O",
    productName: "Víz (H₂O)",
    reactionType: "Egyesülés, redoxi (égés)",
    energy: "Erősen exoterm (hőtermelő, durranógáz robbanás)",
    conditions: "Szikra, láng, magas hőmérséklet vagy katalizátor (pl. platina)",
    visualDescription: "Heves durranással vagy robbanással kísért égés, a keletkező vízgőz lecsapódik az edény falára.",
    safetyPrecautions: "Védőszemüveg, fülvédő kötelező! Csak kis mennyiségben végezhető el.",
    explanation: "A hidrogénnek 1 vegyértékelektronja van, az oxigénnek 6. Két hidrogénatom megosztja elektronjait egy oxigénatommal, így stabil kovalens kötéseket alakítanak ki, elérve a nemesgáz-szerkezetet (H: duplett, O: oktett)."
  },
  "Cl_Na": {
    canReact: true,
    equation: "2 Na + Cl₂ → 2 NaCl",
    productName: "Nátrium-klorid (konyhasó)",
    reactionType: "Egyesülés, redoxi (ionos reakció)",
    energy: "Erősen exoterm (hőtermelő)",
    conditions: "Enyhe melegítés vagy vízcsepp hozzáadása katalizátorként.",
    visualDescription: "A nátrium fém vakító sárga lánggal ég a sárgászöld klórgázban, miközben sűrű fehér füst (finom sókristályok) keletkezik.",
    safetyPrecautions: "Kihúzó fülke alatt végzendő! A klórgáz erősen mérgező, a nátrium hevesen reaktív.",
    explanation: "A nátrium könnyen leadja 1 külső elektronját (így Na⁺ ionná válik), amelyet a nagy elektronegativitású klóratom felvesz (Cl⁻ ionná alakulva). Az ellentétes töltésű ionok között erős elektrosztatikus vonzás (ionos kötés) jön létre."
  },
  "Mg_O": {
    canReact: true,
    equation: "2 Mg + O₂ → 2 MgO",
    productName: "Magnézium-oxid",
    reactionType: "Egyesülés, redoxi (égés)",
    energy: "Erősen exoterm (hőtermelő)",
    conditions: "Kezdeti láng / gyújtás szükséges.",
    visualDescription: "A magnéziumszalag vakító, intenzív fehér fénnyel ég el, miközben fehér por (magnézium-oxid) keletkezik.",
    safetyPrecautions: "Tilos közvetlenül a fénybe nézni (UV-sugárzás, látáskárosodást okozhat)! Használj sötét védőszemüveget.",
    explanation: "A magnézium leadja 2 külső vegyértékelektronját az oxigénnek, így Mg²⁺ és O²⁻ ionok keletkeznek, melyek egy stabil, magas olvadáspontú ionrácsos oxidot alkotnak."
  },
  "C_O": {
    canReact: true,
    equation: "C + O₂ → CO₂",
    productName: "Szén-dioxid",
    reactionType: "Egyesülés, redoxi (égés)",
    energy: "Exoterm (hőtermelő)",
    conditions: "Gyulladási hőmérséklet elérése.",
    visualDescription: "A szén izzik, majd tiszta oxigénben fényes lánggal ég el, miközben láthatatlan, színtelen gáz (szén-dioxid) keletkezik.",
    safetyPrecautions: "Jól szellőző helyiségben végzendő, nehogy oxigénhiány miatt mérgező szén-monoxid keletkezzen.",
    explanation: "A szénatom 4 kovalens kötést alakít ki két oxigénatommal (mindegyikkel kettős kötést), így stabil szén-dioxid molekula jön létre, ahol mindegyik atom eléri az oktett állapotot."
  },
  "Fe_O": {
    canReact: true,
    equation: "4 Fe + 3 O₂ → 2 Fe₂O₃",
    productName: "Vas(III)-oxid (rozsda)",
    reactionType: "Egyesülés, redoxi (oxidáció / korrózió)",
    energy: "Exoterm (nagyon lassú hőtermelés)",
    conditions: "Nedvesség, víz és oxigén jelenléte (vagy magas hőmérséklet a gyors égéshez).",
    visualDescription: "Nedves környezetben lassan vörösesbarna por (rozsda) vonja be a vasat. Ha vasgyapotot hevítünk oxigénben, az szikrázva, fényesen ég.",
    safetyPrecautions: "A forró szikrák ellen védőszemüveg javasolt.",
    explanation: "A vasatomok elektront adnak át az oxigénatomoknak. Nedves környezetben ez egy elektrokémiai folyamat, melynek során hidratált vas(III)-oxidok keveréke jön létre."
  },
  "Cu_S": {
    canReact: true,
    equation: "2 Cu + S → Cu₂S",
    productName: "Réz(I)-szulfid",
    reactionType: "Egyesülés, redoxi",
    energy: "Exoterm (hőtermelő)",
    conditions: "Hevítés.",
    visualDescription: "A kénporral kevert rézpor hevítés hatására izzásba jön, és a reakció az égő kikapcsolása után is önfenntartóan végigfut. Fekete szilárd anyag keletkezik.",
    safetyPrecautions: "Kihúzó fülkében végzendő! A kén-dioxid gáz képződésének lehetősége miatt irritáló lehet.",
    explanation: "A rézatomok elektront adnak át a kénatomoknak, réz-szulfidot képezve. A kén az oxigéncsoport tagjaként hasonlóan viselkedik, de kisebb elektronegativitása miatt kevésbé heves a reakció."
  }
};

async function generateExplanation(ai: GoogleGenAI, prompt: string): Promise<string> {
  const models = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] Magyarázat generálása a(z) ${model} modellel (kísérlet: ${attempt}/2)...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        if (response && response.text) {
          console.log(`[AI] Sikeres generálás a(z) ${model} modellel.`);
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI WARN] Hiba a(z) ${model} modellel (kísérlet: ${attempt}/2):`, err.message || err);
        if (attempt < 2) {
          // Backoff before retry
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
  }
  throw lastError || new Error("Minden próbálkozás sikertelen volt.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for didactic Gemini explanation
  app.post("/api/explain", async (req, res) => {
    const { number, symbol, name, category, electronConfig, period, group, chemicalReview } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ error: "Hiányzó elem adatok." });
    }

    const ai = getGemini();

    if (!ai) {
      // Graceful offline template fallback
      return res.json({
        isAi: false,
        text: `### 🏫 Helyi Kémia Tanár (Offline Mód)\n\n**A(z) ${name} (${symbol}) kémiai és fizikai tulajdonságainak didaktikus magyarázata:**\n\n- **Rendszám:** ${number}\n- **Helye a periódusos rendszerben:** ${period}. periódus, ${group}. csoport (${category})\n- **Elektronkonfiguráció:** \`${electronConfig}\`\n\n#### Miért viselkedik így a(z) ${name}?\n${chemicalReview}\n\n#### 💡 Tanulási Tipp:\nJegyezd meg a(z) **${symbol}** vegyjelet, a(z) **${number}**-es rendszámot, s hogy az elektronszerkezet alapján hányadik héjon találhatóak a vegyértékelektronjai. Ez meghatározza a reakcióit!\n\n_Szeretnél mélyebb és interaktívabb magyarázatot? Állíts be egy érvényes Gemini API kulcsot a titkok (Secrets) menüpontban a jobb felső sarokban!_`
      });
    }

    try {
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

      return res.json({
        isAi: true,
        text: explanationText
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.json({
        isAi: false,
        text: `### ⚠️ Hiba történt az AI magyarázat generálásakor\n\nA szerver nem tudott kommunikálni a Gemini modellel. Íme a helyi magyarázat helyette:\n\n**A(z) ${name} (${symbol}):**\n\n${chemicalReview}\n\n_Hiba oka: ${err.message || err}_`
      });
    }
  });

  // API endpoint for chemical reaction simulation
  app.post("/api/simulate-reaction", async (req, res) => {
    const { element1, element2 } = req.body;

    if (!element1 || !element2) {
      return res.status(400).json({ error: "Hiányzó elem adatok." });
    }

    const symbol1 = element1.symbol;
    const symbol2 = element2.symbol;
    const name1 = element1.name;
    const name2 = element2.name;

    // Helper to sort alphabetically for fallback lookup
    const sortedKey = [symbol1, symbol2].sort().join("_");

    // Check noble gases
    const nobleGases = ["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"];
    const isNoble1 = nobleGases.includes(symbol1);
    const isNoble2 = nobleGases.includes(symbol2);

    if (isNoble1 || isNoble2) {
      const nobleGasName = isNoble1 ? name1 : name2;
      const nobleGasSymbol = isNoble1 ? symbol1 : symbol2;
      return res.json({
        isAi: false,
        canReact: false,
        equation: "Nincs reakció",
        productName: "Nincs",
        reactionType: "Nincs",
        energy: "Nincs változás",
        conditions: "Nem lehetséges",
        visualDescription: "Semmi sem történik, a két anyag változatlanul egymás mellett marad.",
        safetyPrecautions: "Nincs szükség különleges óvintézkedésekre, mivel nem megy végbe reakció.",
        explanation: `A(z) ${nobleGasName} (${nobleGasSymbol}) nemesgáz, teljesen betöltött külső elektronhéjjal (stabil oktett vagy duplett szerkezet). Emiatt rendkívül stabil, kémiailag inert, és normál vagy aktiválási körülmények között sem lép reakcióba más elemekkel.`
      });
    }

    // Check two metals
    const metals = ["alkáli fém", "alkáliföldfém", "átmenetifém", "lantanoida", "aktinoida", "félfém", "szegényfém", "alkálifém", "alkáli fémek", "alkáliföldfémek", "átmenetifémek", "post-transition metal", "transition metal", "alkali metal", "alkaline earth metal", "lanthanide", "actinide", "metalloid"];
    const cat1 = (element1.category || "").toLowerCase();
    const cat2 = (element2.category || "").toLowerCase();
    const isMetal1 = metals.some(m => cat1.includes(m) || cat1.includes("fém"));
    const isMetal2 = metals.some(m => cat2.includes(m) || cat2.includes("fém"));

    if (isMetal1 && isMetal2) {
      return res.json({
        isAi: false,
        canReact: false,
        equation: "Nincs kémiai reakció",
        productName: "Nincs (Ötvözet képződhet)",
        reactionType: "Fizikai elegyedés",
        energy: "Nincs kémiai hőváltozás",
        conditions: "Magas hőmérséklet (összeolvasztás)",
        visualDescription: "Összeolvasztás után homogén szilárd oldat (ötvözet) keletkezik, de kémiai reakció és vegyületképzés nem történik.",
        safetyPrecautions: "A fémek olvasztása rendkívül magas hőmérsékleten történik, megfelelő védőfelszerelés, kesztyű és hőálló tégely szükséges.",
        explanation: "Két fématom nem lép egymással közvetlen kémiai reakcióba stabil vegyület kialakítására, mivel mindkettő kis elektronegativitású elektrondonor. Ehelyett magas hőmérsékleten összeolvasztva fémes kötéssel összetartott szilárd oldatot, azaz ötvözetet képezhetnek."
      });
    }

    // Check custom offline database
    if (FALLBACK_REACTIONS[sortedKey]) {
      return res.json({
        isAi: false,
        ...FALLBACK_REACTIONS[sortedKey]
      });
    }

    // AI Prediction
    const ai = getGemini();
    if (!ai) {
      // Local fallback for any other elements if offline
      return res.json({
        isAi: false,
        canReact: true,
        equation: `${symbol1} + ${symbol2} → [Vegyület]`,
        productName: `${name1}-${name2} vegyület`,
        reactionType: "Feltételezett egyesülés",
        energy: "Exoterm vagy endoterm",
        conditions: "Hevítés vagy katalizátor szükséges lehet",
        visualDescription: "A reakció fizikai és kémiai változásokkal, gázfejlődéssel vagy színváltozással járhat.",
        safetyPrecautions: "Általános laboratóriumi védőfelszerelés: szemüveg, kesztyű és jól szellőző kihúzó fülke használata javasolt.",
        explanation: `A(z) ${name1} (${symbol1}) és a(z) ${name2} (${symbol2}) elméletben képes lehet egymással reakcióba lépni. Az elemek pontos reakciójának elemzéséhez és tudományos leírásához online AI-kapcsolat szükséges. Állíts be egy érvényes Gemini API kulcsot a titkok (Secrets) menüpontban!`
      });
    }

    try {
      const prompt = `Te egy zseniális Kémia Professzor és egyetemi oktató vagy.
Kérlek elemezd ki a periódusos rendszer két elemének lehetséges közvetlen kémiai reakcióját:
- Elem 1: ${name1} (${symbol1}) [Rendszám: ${element1.number}, Kategória: ${element1.category}, Elektronok: ${element1.electronConfig}]
- Elem 2: ${name2} (${symbol2}) [Rendszám: ${element2.number}, Kategória: ${element2.category}, Elektronok: ${element2.electronConfig}]

Kérlek, határozd meg, hogy képesek-e közvetlenül reagálni egymással. Ha igen, add meg a pontos, rendezett kémiai egyenletet, a termék nevét, a reakció típusát, energetikai viszonyait (pl. exoterm/endoterm), a szükséges feltételeket, a kísérleti vizuális leírást, a biztonsági óvintézkedéseket, valamint egy részletes didaktikus magyarázatot arról, hogy miért és hogyan reagálnak az elektronszerkezetük alapján. Ha nem reagálnak (vagy rendkívül nehezen), magyarázd el ennek okát pontosan, és állítsd a 'canReact' értékét false-ra.

Fontos szabályok:
- Válaszolj szigorúan a megadott JSON formátumban!
- Minden magyarázat és leírás gyönyörű, didaktikus magyar nyelven történjen!
- A kémiai képletekben és egyenletben használj valódi alsó/felső indexeket (pl. H₂O, O₂, Na⁺).`;

      console.log(`[AI-REACTION] Reakció szimulálása: ${symbol1} + ${symbol2}`);
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              canReact: { type: Type.BOOLEAN, description: "Képesek-e közvetlenül reakcióba lépni" },
              equation: { type: Type.STRING, description: "Rendezett kémiai egyenlet, pl.: 2H₂ + O₂ → 2H₂O" },
              productName: { type: Type.STRING, description: "A keletkező termék(ek) neve magyarul" },
              reactionType: { type: Type.STRING, description: "A reakció típusa (pl. redoxi egyesülés, égés, stb.)" },
              energy: { type: Type.STRING, description: "Energetikai viszonyok (pl. Exoterm, robbanásszerű)" },
              conditions: { type: Type.STRING, description: "Reakció feltételei (pl. hevítés, szikra)" },
              visualDescription: { type: Type.STRING, description: "Vizuális kísérleti leírás, mi látható" },
              safetyPrecautions: { type: Type.STRING, description: "Biztonsági óvintézkedések, veszélyek" },
              explanation: { type: Type.STRING, description: "Részletes, diákbarát magyar magyarázat az elektronszerkezet alapján" }
            },
            required: ["canReact", "equation", "productName", "reactionType", "energy", "conditions", "visualDescription", "safetyPrecautions", "explanation"]
          }
        }
      });

      if (response && response.text) {
        const result = JSON.parse(response.text.trim());
        return res.json({
          isAi: true,
          ...result
        });
      } else {
        throw new Error("Nem érkezett szöveges válasz az AI-tól.");
      }
    } catch (err: any) {
      console.error("Gemini reaction simulation error:", err);
      return res.json({
        isAi: false,
        canReact: true,
        equation: `${symbol1} + ${symbol2} → [Komplex reakció]`,
        productName: "Meghatlan vegyület",
        reactionType: "Egyesülés",
        energy: "Ismeretlen",
        conditions: "Hevítés szükséges lehet",
        visualDescription: "Kémiai reakció mehet végbe, de az AI válaszadás megszakadt.",
        safetyPrecautions: "Általános laboratóriumi óvintézkedések betartása szükséges.",
        explanation: `A(z) ${name1} (${symbol1}) és a(z) ${name2} (${symbol2}) közötti reakció részleteinek elemzésekor hiba történt a Gemini modellel: ${err.message || err}. Az elemek egyébként reakcióképesek lehetnek.`
      });
    }
  });

  // Integrate Vite for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SZERVER] Az Interaktív Periódusos Rendszer fut a http://localhost:${PORT} címen`);
  });
}

startServer();
