import { GoogleGenAI, Type } from "@google/genai";

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

const FALLBACK_REACTIONS: Record<string, Record<string, unknown>> = {
  H_O: {
    canReact: true,
    equation: "2 H₂ + O₂ → 2 H₂O",
    productName: "Víz (H₂O)",
    reactionType: "Egyesülés, redoxi (égés)",
    energy: "Erősen exoterm (hőtermelő, durranógáz robbanás)",
    conditions: "Szikra, láng, magas hőmérséklet vagy katalizátor (pl. platina)",
    visualDescription: "Heves durranással vagy robbanással kísért égés, a keletkező vízgőz lecsapódik az edény falára.",
    safetyPrecautions: "Védőszemüveg, fülvédő kötelező! Csak kis mennyiségben végezhető el.",
    explanation:
      "A hidrogénnek 1 vegyértékelektronja van, az oxigénnek 6. Két hidrogénatom megosztja elektronjait egy oxigénatommal, így stabil kovalens kötéseket alakítanak ki, elérve a nemesgáz-szerkezetet (H: duplett, O: oktett).",
  },
  Cl_Na: {
    canReact: true,
    equation: "2 Na + Cl₂ → 2 NaCl",
    productName: "Nátrium-klorid (konyhasó)",
    reactionType: "Egyesülés, redoxi (ionos reakció)",
    energy: "Erősen exoterm (hőtermelő)",
    conditions: "Enyhe melegítés vagy vízcsepp hozzáadása katalizátorként.",
    visualDescription:
      "A nátrium fém vakító sárga lánggal ég a sárgászöld klórgázban, miközben sűrű fehér füst (finom sókristályok) keletkezik.",
    safetyPrecautions: "Kihúzó fülke alatt végzendő! A klórgáz erősen mérgező, a nátrium hevesen reaktív.",
    explanation:
      "A nátrium könnyen leadja 1 külső elektronját (így Na⁺ ionná válik), amelyet a nagy elektronegativitású klóratom felvesz (Cl⁻ ionná alakulva). Az ellentétes töltésű ionok között erős elektrosztatikus vonzás (ionos kötés) jön létre.",
  },
  Mg_O: {
    canReact: true,
    equation: "2 Mg + O₂ → 2 MgO",
    productName: "Magnézium-oxid",
    reactionType: "Egyesülés, redoxi (égés)",
    energy: "Erősen exoterm (hőtermelő)",
    conditions: "Kezdeti láng / gyújtás szükséges.",
    visualDescription:
      "A magnéziumszalag vakító, intenzív fehér fénnyel ég el, miközben fehér por (magnézium-oxid) keletkezik.",
    safetyPrecautions:
      "Tilos közvetlenül a fénybe nézni (UV-sugárzás, látáskárosodást okozhat)! Használj sötét védőszemüveget.",
    explanation:
      "A magnézium leadja 2 külső vegyértékelektronját az oxigénnek, így Mg²⁺ és O²⁻ ionok keletkeznek, melyek egy stabil, magas olvadáspontú ionrácsos oxidot alkotnak.",
  },
  C_O: {
    canReact: true,
    equation: "C + O₂ → CO₂",
    productName: "Szén-dioxid",
    reactionType: "Egyesülés, redoxi (égés)",
    energy: "Exoterm (hőtermelő)",
    conditions: "Gyulladási hőmérséklet elérése.",
    visualDescription:
      "A szén izzik, majd tiszta oxigénben fényes lánggal ég el, miközben láthatatlan, színtelen gáz (szén-dioxid) keletkezik.",
    safetyPrecautions:
      "Jól szellőző helyiségben végzendő, nehogy oxigénhiány miatt mérgező szén-monoxid keletkezzen.",
    explanation:
      "A szénatom 4 kovalens kötést alakít ki két oxigénatommal (mindegyikkel kettős kötést), így stabil szén-dioxid molekula jön létre, ahol mindegyik atom eléri az oktett állapotot.",
  },
  Fe_O: {
    canReact: true,
    equation: "4 Fe + 3 O₂ → 2 Fe₂O₃",
    productName: "Vas(III)-oxid (rozsda)",
    reactionType: "Egyesülés, redoxi (oxidáció / korrózió)",
    energy: "Exoterm (nagyon lassú hőtermelés)",
    conditions: "Nedvesség, víz és oxigén jelenléte (vagy magas hőmérséklet a gyors égéshez).",
    visualDescription:
      "Nedves környezetben lassan vörösesbarna por (rozsda) vonja be a vasat. Ha vasgyapotot hevítünk oxigénben, az szikrázva, fényesen ég.",
    safetyPrecautions: "A forró szikrák ellen védőszemüveg javasolt.",
    explanation:
      "A vasatomok elektront adnak át az oxigénatomoknak. Nedves környezetben ez egy elektrokémiai folyamat, melynek során hidratált vas(III)-oxidok keveréke jön létre.",
  },
  Cu_S: {
    canReact: true,
    equation: "2 Cu + S → Cu₂S",
    productName: "Réz(I)-szulfid",
    reactionType: "Egyesülés, redoxi",
    energy: "Exoterm (hőtermelő)",
    conditions: "Hevítés.",
    visualDescription:
      "A kénporral kevert rézpor hevítés hatására izzásba jön, és a reakció az égő kikapcsolása után is önfenntartóan végigfut. Fekete szilárd anyag keletkezik.",
    safetyPrecautions:
      "Kihúzó fülkében végzendő! A kén-dioxid gáz képződésének lehetősége miatt irritáló lehet.",
    explanation:
      "A rézatomok elektront adnak át a kénatomoknak, réz-szulfidot képezve. A kén az oxigéncsoport tagjaként hasonlóan viselkedik, de kisebb elektronegativitása miatt kevésbé heves a reakció.",
  },
};

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

  const { element1, element2 } = body || {};

  if (!element1 || !element2 || !element1.symbol || !element2.symbol) {
    return res.status(400).json({ error: "Hiányzó elem adatok." });
  }

  const symbol1 = String(element1.symbol);
  const symbol2 = String(element2.symbol);
  const name1 = String(element1.name || symbol1);
  const name2 = String(element2.name || symbol2);
  const sortedKey = [symbol1, symbol2].sort().join("_");

  const nobleGases = ["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Og"];
  const isNoble1 = nobleGases.includes(symbol1);
  const isNoble2 = nobleGases.includes(symbol2);

  if (isNoble1 || isNoble2) {
    const nobleGasName = isNoble1 ? name1 : name2;
    const nobleGasSymbol = isNoble1 ? symbol1 : symbol2;
    return res.status(200).json({
      isAi: false,
      canReact: false,
      equation: "Nincs reakció",
      productName: "Nincs",
      reactionType: "Nincs",
      energy: "Nincs változás",
      conditions: "Nem lehetséges",
      visualDescription: "Semmi sem történik, a két anyag változatlanul egymás mellett marad.",
      safetyPrecautions: "Nincs szükség különleges óvintézkedésekre, mivel nem megy végbe reakció.",
      explanation: `A(z) ${nobleGasName} (${nobleGasSymbol}) nemesgáz, teljesen betöltött külső elektronhéjjal (stabil oktett vagy duplett szerkezet). Emiatt rendkívül stabil, kémiailag inert, és normál vagy aktiválási körülmények között sem lép reakcióba más elemekkel.`,
    });
  }

  const metals = [
    "alkáli fém",
    "alkáliföldfém",
    "átmenetifém",
    "lantanoida",
    "aktinoida",
    "félfém",
    "szegényfém",
    "alkálifém",
    "alkáli fémek",
    "alkáliföldfémek",
    "átmenetifémek",
    "post-transition metal",
    "transition metal",
    "alkali metal",
    "alkaline earth metal",
    "lanthanide",
    "actinide",
    "metalloid",
  ];
  const cat1 = String(element1.category || "").toLowerCase();
  const cat2 = String(element2.category || "").toLowerCase();
  const isMetal1 = metals.some((m) => cat1.includes(m) || cat1.includes("fém"));
  const isMetal2 = metals.some((m) => cat2.includes(m) || cat2.includes("fém"));

  if (isMetal1 && isMetal2) {
    return res.status(200).json({
      isAi: false,
      canReact: false,
      equation: "Nincs kémiai reakció",
      productName: "Nincs (Ötvözet képződhet)",
      reactionType: "Fizikai elegyedés",
      energy: "Nincs kémiai hőváltozás",
      conditions: "Magas hőmérséklet (összeolvasztás)",
      visualDescription:
        "Összeolvasztás után homogén szilárd oldat (ötvözet) keletkezik, de kémiai reakció és vegyületképzés nem történik.",
      safetyPrecautions:
        "A fémek olvasztása rendkívül magas hőmérsékleten történik, megfelelő védőfelszerelés, kesztyű és hőálló tégely szükséges.",
      explanation:
        "Két fématom nem lép egymással közvetlen kémiai reakcióba stabil vegyület kialakítására, mivel mindkettő kis elektronegativitású elektrondonor. Ehelyett magas hőmérsékleten összeolvasztva fémes kötéssel összetartott szilárd oldatot, azaz ötvözetet képezhetnek.",
    });
  }

  if (FALLBACK_REACTIONS[sortedKey]) {
    return res.status(200).json({
      isAi: false,
      ...FALLBACK_REACTIONS[sortedKey],
    });
  }

  const headerKeyRaw = req.headers?.["x-gemini-api-key"];
  const headerKey = Array.isArray(headerKeyRaw) ? headerKeyRaw[0] : headerKeyRaw;
  const apiKey = process.env.GEMINI_API_KEY || (headerKey ? headerKey.trim() : "");

  if (!apiKey) {
    return res.status(200).json({
      isAi: false,
      canReact: true,
      equation: `${symbol1} + ${symbol2} → [Vegyület]`,
      productName: `${name1}-${name2} vegyület`,
      reactionType: "Feltételezett egyesülés",
      energy: "Exoterm vagy endoterm",
      conditions: "Hevítés vagy katalizátor szükséges lehet",
      visualDescription: "A reakció fizikai és kémiai változásokkal, gázfejlődéssel vagy színváltozással járhat.",
      safetyPrecautions:
        "Általános laboratóriumi védőfelszerelés: szemüveg, kesztyű és jól szellőző kihúzó fülke használata javasolt.",
      explanation: `A(z) ${name1} (${symbol1}) és a(z) ${name2} (${symbol2}) elméletben képes lehet egymással reakcióba lépni. Az egyedi reakciók AI alapú elemzéséhez állítsd be a GEMINI_API_KEY változót a Vercel beállításokban, vagy adj meg saját kulcsot a bal alsó sarokban lévő 🔑 ikonnal!`,
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

    const prompt = `Te egy zseniális Kémia Professzor és egyetemi oktató vagy.
Kérlek elemezd ki a periódusos rendszer két elemének lehetséges közvetlen kémiai reakcióját:
- Elem 1: ${name1} (${symbol1}) [Rendszám: ${element1.number}, Kategória: ${element1.category}, Elektronok: ${element1.electronConfig}]
- Elem 2: ${name2} (${symbol2}) [Rendszám: ${element2.number}, Kategória: ${element2.category}, Elektronok: ${element2.electronConfig}]

Kérlek, határozd meg, hogy képesek-e közvetlenül reagálni egymással. Ha igen, add meg a pontos, rendezett kémiai egyenletet, a termék nevét, a reakció típusát, energetikai viszonyait (pl. exoterm/endoterm), a szükséges feltételeket, a kísérleti vizuális leírást, a biztonsági óvintézkedéseket, valamint egy részletes didaktikus magyarázatot arról, hogy miért és hogyan reagálnak az elektronszerkezetük alapján. Ha nem reagálnak (vagy rendkívül nehezen), magyarázd el ennek okát pontosan, és állítsd a 'canReact' értékét false-ra.

Fontos szabályok:
- Válaszolj szigorúan a megadott JSON formátumban!
- Minden magyarázat és leírás gyönyörű, didaktikus magyar nyelven történjen!
- A kémiai képletekben és egyenletben használj valódi alsó/felső indexeket (pl. H₂O, O₂, Na⁺).`;

    const models = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
    let textResult: string | undefined;
    let lastError: unknown = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
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
                explanation: {
                  type: Type.STRING,
                  description: "Részletes, diákbarát magyar magyarázat az elektronszerkezet alapján",
                },
              },
              required: [
                "canReact",
                "equation",
                "productName",
                "reactionType",
                "energy",
                "conditions",
                "visualDescription",
                "safetyPrecautions",
                "explanation",
              ],
            },
          },
        });

        if (response?.text) {
          textResult = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!textResult) {
      throw lastError || new Error("Nem érkezett szöveges válasz az AI-tól.");
    }

    const result = JSON.parse(textResult.trim());
    return res.status(200).json({
      isAi: true,
      ...result,
    });
  } catch (err: any) {
    console.error("Vercel /api/simulate-reaction error:", err);
    return res.status(200).json({
      isAi: false,
      canReact: true,
      equation: `${symbol1} + ${symbol2} → [Komplex reakció]`,
      productName: "Meghatározatlan vegyület",
      reactionType: "Egyesülés",
      energy: "Ismeretlen",
      conditions: "Hevítés szükséges lehet",
      visualDescription: "Kémiai reakció mehet végbe, de az AI válaszadás megszakadt.",
      safetyPrecautions: "Általános laboratóriumi óvintézkedések betartása szükséges.",
      explanation: `A(z) ${name1} (${symbol1}) és a(z) ${name2} (${symbol2}) közötti reakció részleteinek elemzésekor hiba történt a Gemini modellel: ${err?.message || String(err)}. Az elemek egyébként reakcióképesek lehetnek.`,
    });
  }
}
