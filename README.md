# Interaktív Periódusos Rendszer – Vercel Telepítési Útmutató

Modern, magyar nyelvű interaktív periódusos rendszer Bohr-atommodellel, elem-összehasonlítóval, kvízekkel, AI-alapú kémiai magyarázóval és reakciószimulátorral.

## Előkészített Vercel struktúra

- **`vercel.json`**: Vite build (`npm run build:vercel` -> `dist/`) és SPA útválasztás beállítása.
- **`api/explain.ts` és `api/simulate-reaction.ts`**: Vercel Serverless Functions a szerveroldali Gemini AI hívásokhoz.
- **`vite.config.ts`**: Gyökér útvonalra (`base: '/'`) állítva a Vercel hosztoláshoz.

## Feltöltés és telepítés Vercel-re

### 1. GitHub + Vercel (Ajánlott)
1. Töltsd fel a projektet egy GitHub repository-ba.
2. Jelentkezz be a [Vercel](https://vercel.com) felületére, majd kattints az **Add New... → Project** gombra.
3. Importáld a GitHub repository-t (a `vercel.json` automatikusan felismeri a Vite beállításokat).
4. Az **Environment Variables** résznél add hozzá a következő kulcsot, hogy az AI Mentor és a Reakciószimulátor szerveroldalon működjön:
   - Name: `GEMINI_API_KEY`
   - Value: *(a saját Google AI Studio Gemini API kulcsod)*
5. Kattints a **Deploy** gombra.

### 2. Vercel CLI segítségével
```bash
npm i -g vercel
vercel
```
Éles telepítéshez:
```bash
vercel --prod
```
Környezeti változó beállítása CLI-ből:
```bash
vercel env add GEMINI_API_KEY
```

## Helyi fejlesztés

```bash
npm install
npm run dev
```
Az alkalmazás a `http://localhost:3000` címen indul el.
