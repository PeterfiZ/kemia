export interface ElementData {
  number: number;      // Rendszám
  symbol: string;      // Vegyjel
  name: string;        // Magyar név
  mass: number;        // Atomtömeg / Tömegszám
  period: number;      // Periódusok (1-7)
  group: number;       // Csoportok (1-18)
  row: number;         // Megjelenítési sorszám (1-10, 9-10 az f-mező)
  col: number;         // Megjelenítési oszlop (1-18)
  block: 's' | 'p' | 'd' | 'f';
  category: 'alkalifem' | 'alkalifoldfem' | 'atmenetifem' | 'lantanoida' | 'aktinoida' | 'posztatmenetifem' | 'felfem' | 'nemfem' | 'halogen' | 'nemesgaz';
  state: 'gáz' | 'folyékony' | 'szilárd' | 'mesterséges';
  valence: string;     // Jellemző vegyértékek / oxidációs számok
  electronConfig: string; // Elektronsor felbontás (pl. 1s² 2s¹)
  shells: number[];    // Elektronok héjanként pl. [2, 1]
  electronegativity: number | null; // Pauling-skála
  atomicRadius: number | null;      // pm-ben
  ionizationEnergy: number | null;  // kJ/mol
  density: number | null;           // g/cm³
  meltingPoint: number | null;      // °C-ban
  boilingPoint: number | null;      // °C-ban
  discovery: string;                // Felfedező és év, vagy származás
  uses: string;                     // Jellemző felhasználás
  fact: string;                     // Érdekesség magyarul
  chemicalReview: string;           // Didaktikai magyarázat
}

// Compact raw element helper to load all 118 elements smoothly
const rawElements: Array<Partial<ElementData> & { number: number; symbol: string; name: string; mass: number }> = [
  // Period 1
  { number: 1, symbol: 'H', name: 'Hidrogén', mass: 1.008, period: 1, group: 1, row: 1, col: 1, block: 's', category: 'nemfem', state: 'gáz', valence: '1, -1', electronConfig: '1s¹', shells: [1], electronegativity: 2.20, atomicRadius: 37, ionizationEnergy: 1312, density: 0.000089, meltingPoint: -259.1, boilingPoint: -252.9, discovery: 'Henry Cavendish (1766)', uses: 'Ammóniagyártás, rakéta-üzemanyag, tiszta energiaforrás.', fact: 'A világegyetem leggyakoribb eleme; a csillagok tömegének mintegy 75%-át adja.', chemicalReview: 'Bár az 1. főcsoport élén áll, nem fém. Egyetlen elektronja van az s-pályán, ezért elektron felvételére (H⁻) és leadására (H⁺) egyaránt képes. Kétatomos gázként van jelen.' },
  { number: 2, symbol: 'He', name: 'Hélium', mass: 4.0026, period: 1, group: 18, row: 1, col: 18, block: 'p', category: 'nemesgaz', state: 'gáz', valence: '0', electronConfig: '1s²', shells: [2], electronegativity: null, atomicRadius: 31, ionizationEnergy: 2372, density: 0.000178, meltingPoint: -272.2, boilingPoint: -268.9, discovery: 'Pierre Janssen, Norman Lockyer (1868)', uses: 'Léggömbök, MRI gépek hűtése (folyékonyan), védőgáz.', fact: 'A Nap színképében fedezték fel először egy teljes napfogyatkozás során.', chemicalReview: 'Legkisebb nemesgáz. Az 1s alhéja teljesen betöltött (duplett), ezért rendkívül stabil shellt formál, amellyel nem képez semmilyen stabil kémiai kötést.' },

  // Period 2
  { number: 3, symbol: 'Li', name: 'Lítium', mass: 6.94, period: 2, group: 1, row: 2, col: 1, block: 's', category: 'alkalifem', state: 'szilárd', valence: '1', electronConfig: '[He] 2s¹', shells: [2, 1], electronegativity: 0.98, atomicRadius: 152, ionizationEnergy: 520, density: 0.534, meltingPoint: 180.5, boilingPoint: 1342, discovery: 'Johan August Arfwedson (1817)', uses: 'Akkumulátorok (telefonok, laptopok, autók), gyógyszerek.', fact: 'A legkisebb sűrűségű szilárd elem, úszik a petrolátumon.', chemicalReview: 'Igen könnyen leadja egyetlen vegyértékelektronját, egyszeresen pozitív lítiumiont (Li⁺) képezve. Vízzel találkozva tüzet vagy reakciót és LiOH-t ad.' },
  { number: 4, symbol: 'Be', name: 'Berillium', mass: 9.0122, period: 2, group: 2, row: 2, col: 2, block: 's', category: 'alkalifoldfem', state: 'szilárd', valence: '2', electronConfig: '[He] 2s²', shells: [2, 2], electronegativity: 1.57, atomicRadius: 112, ionizationEnergy: 900, density: 1.85, meltingPoint: 1287, boilingPoint: 2469, discovery: 'Louis Nicolas Vauquelin (1798)', uses: 'Röntgen-csövek ablakai, repülőipari ötvözetek.', fact: 'Por formájában belélegezve súlyos tüdőbetegséget okoz.', chemicalReview: 'Bár alkáliföldfém, kis mérete miatt a berillium hajlamos kovalens jellegű kötéseket kialakítani. Amfoter jellegű: savakban és erős lúgokban is oldódik.' },
  { number: 5, symbol: 'B', name: 'Bór', mass: 10.81, period: 2, group: 13, row: 2, col: 13, block: 'p', category: 'felfem', state: 'szilárd', valence: '3', electronConfig: '[He] 2s² 2p¹', shells: [2, 3], electronegativity: 2.04, atomicRadius: 88, ionizationEnergy: 801, density: 2.34, meltingPoint: 2076, boilingPoint: 3927, discovery: 'Gay-Lussac, Thénard (1808)', uses: 'Boroszilikát jénai üvegek, mosószerek, növényi tápanyag.', fact: 'A bór-nitrid kristályszemcséi szinte a gyémánt keménységével vetekednek.', chemicalReview: 'A bór egy elektronhiányos félfém. 3 vegyértékelektronja van, ezért olyan molekulákat képez (pl. BF₃), amelyek könnyen fogadnak szabad elektronpárt koordinatív kötéshez.' },
  { number: 6, symbol: 'C', name: 'Szén', mass: 12.011, period: 2, group: 14, row: 2, col: 14, block: 'p', category: 'nemfem', state: 'szilárd', valence: '4, 2', electronConfig: '[He] 2s² 2p²', shells: [2, 4], electronegativity: 2.55, atomicRadius: 77, ionizationEnergy: 1086, density: 2.26, meltingPoint: 3550, boilingPoint: 4827, discovery: 'Ókor', uses: 'Üzemanyagok, acélgyártás, nanotechnológia (grafén, nanocsövek), ékszerek.', fact: 'A szerves élet és a gyémánt alapja is egyben.', chemicalReview: 'Négy vegyértékelektronja révén stabil egyszeres, kettős vagy hármas kovalens szén-szén kötéseket tud kialakítani (lánc- és gyűrűképzés), ami alapozza a szerves kémiát.' },
  { number: 7, symbol: 'N', name: 'Nitrogén', mass: 14.007, period: 2, group: 15, row: 2, col: 15, block: 'p', category: 'nemfem', state: 'gáz', valence: '3, 5, -3', electronConfig: '[He] 2s² 2p³', shells: [2, 5], electronegativity: 3.04, atomicRadius: 70, ionizationEnergy: 1402, density: 0.00125, meltingPoint: -210, boilingPoint: -195.8, discovery: 'Daniel Rutherford (1772)', uses: 'Műtrágyák, folyékony nitrogénes fagyasztás, robbanóanyagok.', fact: 'A Föld légkörének mintegy 78%-át alkotja.', chemicalReview: 'A nitrogéngázban (N₂) rendkívül erős háromszoros kovalens kötés van. Emiatt közönséges körülmények közt inert, és nehezen bírható reakcióra.' },
  { number: 8, symbol: 'O', name: 'Oxigén', mass: 15.999, period: 2, group: 16, row: 2, col: 16, block: 'p', category: 'nemfem', state: 'gáz', valence: '2, -2', electronConfig: '[He] 2s² 2p⁴', shells: [2, 6], electronegativity: 3.44, atomicRadius: 66, ionizationEnergy: 1314, density: 0.00143, meltingPoint: -218.8, boilingPoint: -183, discovery: 'Scheele, Priestley (1774)', uses: 'Légzés tamogatása, fémek hegesztése, oxidálószer.', fact: 'A folyékony oxigén kékes színű és vonzzák a mágneses terek.', chemicalReview: 'Rendkívül elektronegatív és reakcióképes nemfém. Szinte minden elemmel oxidot képez exoterm égés közben. Oxidációs foka vegyületeiben a leggyakrabban -2.' },
  { number: 9, symbol: 'F', name: 'Fluor', mass: 18.998, period: 2, group: 17, row: 2, col: 17, block: 'p', category: 'halogen', state: 'gáz', valence: '-1', electronConfig: '[He] 2s² 2p⁵', shells: [2, 7], electronegativity: 3.98, atomicRadius: 64, ionizationEnergy: 1681, density: 0.0017, meltingPoint: -219.6, boilingPoint: -188.1, discovery: 'Henri Moissan (1886)', uses: 'Teflonbevonat, fogkrém, urándúsítás.', fact: 'A periódusos rendszer legharapósabb eleme, szinte minden anyagra lángra lobbant.', chemicalReview: 'A legnagyobb elektronegativitású elem. Mindig -1-es oxidációs állapotú, rendkívül agresszív oxidálószer, mert azonnal magához ragad 1 elektront.' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, period: 2, group: 18, row: 2, col: 18, block: 'p', category: 'nemesgaz', state: 'gáz', valence: '0', electronConfig: '[He] 2s² 2p⁶', shells: [2, 8], electronegativity: null, atomicRadius: 38, ionizationEnergy: 2081, density: 0.0009, meltingPoint: -248.6, boilingPoint: -246.1, discovery: 'Ramsay, Travers (1898)', uses: 'Neoncsövek, piros reklámfények, lézerek.', fact: 'A neontöltésű kisülési cső gyönyörű skarlátvörös-narancs fényt ad.', chemicalReview: 'Oktett külső elektronhéja (2s² 2p⁶) miatt tökéletesen kémiailag közömbös, nincsenek stabil vegyületei kémiai kötésekkel.' },

  // Period 3
  { number: 11, symbol: 'Na', name: 'Nátrium', mass: 22.99, period: 3, group: 1, row: 3, col: 1, block: 's', category: 'alkalifem', state: 'szilárd', valence: '1', electronConfig: '[Ne] 3s¹', shells: [2, 8, 1], electronegativity: 0.93, atomicRadius: 186, ionizationEnergy: 496, density: 0.971, meltingPoint: 97.8, boilingPoint: 883, discovery: 'Humphry Davy (1807)', uses: 'Konyhasó (NaCl), nátrium lámpák, vegyipari szintézisek.', fact: 'Késsel vágható puha ezüstös fém, mely vízzel robbanásszerűen lúgot ad.', chemicalReview: 'Egyetlen 3s¹ elektronját rendkívül csekély munkával leadja Na⁺ iont képezve. Sóiban az ionos rács és vonzó elektrosztatikus kölcsönhatás dominál.' },
  { number: 12, symbol: 'Mg', name: 'Magnézium', mass: 24.305, period: 3, group: 2, row: 3, col: 2, block: 's', category: 'alkalifoldfem', state: 'szilárd', valence: '2', electronConfig: '[Ne] 3s²', shells: [2, 8, 2], electronegativity: 1.31, atomicRadius: 160, ionizationEnergy: 738, density: 1.738, meltingPoint: 650, boilingPoint: 1090, discovery: 'Joseph Black (1755)', uses: 'Könnyűfém ötvözetek, vakupor, klorofill magja, étrendkiegészítők.', fact: 'Levegőn égve vakító fehér fénnyel világít, ami a magnézium-oxid por képződését kíséri.', chemicalReview: 'Fémes elem, amelynek két s vegyértékelektronja leválva Mg²⁺ képletekhez vezet. A klorofill molekula központi elemeként kulcsfontosságú a földi életben.' },
  { number: 13, symbol: 'Al', name: 'Alumínium', mass: 26.982, period: 3, group: 13, row: 3, col: 13, block: 'p', category: 'posztatmenetifem', state: 'szilárd', valence: '3', electronConfig: '[Ne] 3s² 3p¹', shells: [2, 8, 3], electronegativity: 1.61, atomicRadius: 143, ionizationEnergy: 578, density: 2.7, meltingPoint: 660.3, boilingPoint: 2519, discovery: 'Hans Christian Ørsted (1825)', uses: 'Konzervdobozok, fóliák, repülőgép vázak, vezetékek.', fact: 'A földkéreg leggyakoribb féme, régen az aranynál is értékesebb volt.', chemicalReview: 'Bár hevesen reagálna oxigénnel, a felületén másodpercek alatt képződő rendkívül stabil Al₂O₃ réteg passziválja és védi meg a mélyebb korróziótól.' },
  { number: 14, symbol: 'Si', name: 'Szilícium', mass: 28.085, period: 3, group: 14, row: 3, col: 14, block: 'p', category: 'felfem', state: 'szilárd', valence: '4, -4', electronConfig: '[Ne] 3s² 3p²', shells: [2, 8, 4], electronegativity: 1.90, atomicRadius: 118, ionizationEnergy: 787, density: 2.329, meltingPoint: 1414, boilingPoint: 3265, discovery: 'Berzelius (1823)', uses: 'Félvezetők, processzorok, napelemek, jénai üveg, szilikon.', fact: 'A földkéreg több mint negyedét alkotja különféle szilikát ásványok formájában.', chemicalReview: 'Gyémántrácsos félvezető elem. Szerkezetileg rokon a szénnel, de nagyobb atomsugara miatt nem képes stabil sokszoros kovalens kötések kialakítására.' },
  { number: 15, symbol: 'P', name: 'Foszfor', mass: 30.974, period: 3, group: 15, row: 3, col: 15, block: 'p', category: 'nemfem', state: 'szilárd', valence: '3, 5, -3', electronConfig: '[Ne] 3s² 3p³', shells: [2, 8, 5], electronegativity: 2.19, atomicRadius: 110, ionizationEnergy: 1012, density: 1.82, meltingPoint: 44.1, boilingPoint: 280.5, discovery: 'Hennig Brand (1669)', uses: 'Gyufafejek, műtrágyák, növényvédők, ATP, DNS foszfátcsoport.', fact: 'A sötétben világító fehérfoszfort vizeletből vonta ki először egy alkimista.', chemicalReview: 'Több allotrópja van. A fehérfoszfor (P₄) molekularácsos és rendkívül gyúlékony, míg a vörösfoszfor amorf makromolekula és teljesen veszélytelen.' },
  { number: 16, symbol: 'S', name: 'Kén', mass: 32.06, period: 3, group: 16, row: 3, col: 16, block: 'p', category: 'nemfem', state: 'szilárd', valence: '2, 4, 6, -2', electronConfig: '[Ne] 3s² 3p⁴', shells: [2, 8, 6], electronegativity: 2.58, atomicRadius: 102, ionizationEnergy: 1000, density: 2.07, meltingPoint: 115.2, boilingPoint: 444.6, discovery: 'Ókor', uses: 'Kénsavgyártás, gyógyszerek, gumivulkanizálás, puskapor.', fact: 'Maga a tiszta kén szagtalan, de kénhidrogénje záptojásszagú.', chemicalReview: 'A sárga porban S₈ gyűrűk vannak kovalens kötéssel. Változatos oxidációs számú (-2-től +6-ig), a d-pályák bevonásával túllépheti az oktett szabályt (pl. SF₆).' },
  { number: 17, symbol: 'Cl', name: 'Klór', mass: 35.45, period: 3, group: 17, row: 3, col: 17, block: 'p', category: 'halogen', state: 'gáz', valence: '1, 3, 5, 7, -1', electronConfig: '[Ne] 3s² 3p⁵', shells: [2, 8, 7], electronegativity: 3.16, atomicRadius: 99, ionizationEnergy: 1251, density: 0.0032, meltingPoint: -101.5, boilingPoint: -34.04, discovery: 'Scheele (1774)', uses: 'Vízfertőtlenítés, sósav, PVC, konyhasó.', fact: 'Zöldessárga fojtó gáz, amelyet katonai vegyi fegyverként is bevetettek.', chemicalReview: 'Halogénként egy elektront nyelve stabil kloridionná (Cl⁻) redukálódik. Erős oxidálószer, a fémekkel közvetlenül reagál sókat adva.' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, period: 3, group: 18, row: 3, col: 18, block: 'p', category: 'nemesgaz', state: 'gáz', valence: '0', electronConfig: '[Ne] 3s² 3p⁶', shells: [2, 8, 8], electronegativity: null, atomicRadius: 71, ionizationEnergy: 1521, density: 0.00178, meltingPoint: -189.3, boilingPoint: -185.8, discovery: 'Rayleigh, Ramsay (1894)', uses: 'Izzók töltése, műtárgyak védelme az oxidációtól, hegesztés.', fact: 'A kilehelt levegőnkben több argon van, mint szén-dioxid.', chemicalReview: 'A 3s² 3p⁶ teljesen betöltött héj miatt tökéletesen inert gáz. Leginkább védőgázként alkalmazzák kényes kohászati hegesztési folyamatoknál.' },

  // Period 4
  { number: 19, symbol: 'K', name: 'Kálium', mass: 39.098, period: 4, group: 1, row: 4, col: 1, block: 's', category: 'alkalifem', state: 'szilárd', valence: '1', electronConfig: '[Ar] 4s¹', shells: [2, 8, 8, 1], electronegativity: 0.82, atomicRadius: 227, ionizationEnergy: 419, density: 0.862, meltingPoint: 63.5, boilingPoint: 759, discovery: 'Humphry Davy (1807)', uses: 'Műtrágyák, enzimek, idegpályák működése, szappan.', fact: 'Enyhén rádioaktív, a banán emiatt bocsát ki minimális sugárzást.', chemicalReview: 'A nátriumnál is reakcióképesebb, s-elektronja lazábban kötődik. Vízzel azonnali lila lángú égéssel lép reakcióba.' },
  { number: 20, symbol: 'Ca', name: 'Kalcium', mass: 40.078, period: 4, group: 2, row: 4, col: 2, block: 's', category: 'alkalifoldfem', state: 'szilárd', valence: '2', electronConfig: '[Ar] 4s²', shells: [2, 8, 8, 2], electronegativity: 1.00, atomicRadius: 197, ionizationEnergy: 590, density: 1.54, meltingPoint: 842, boilingPoint: 1484, discovery: 'Humphry Davy (1808)', uses: 'Csontok építése, mész, gipsz, cementgyártás.', fact: 'Az emberi test leggyakoribb féme, átlagosan egy kilogramm van bennünk.', chemicalReview: 'Két s-vegyértékelektronját könnyen elveszíti Ca²⁺ kationná válva. Vízzel lassan, hidrogént fejlesztve reagál.' },
  { number: 21, symbol: 'Sc', name: 'Szkandium', mass: 44.956, period: 4, group: 3, row: 4, col: 3, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '3', electronConfig: '[Ar] 3d¹ 4s²', shells: [2, 8, 9, 2], electronegativity: 1.36, atomicRadius: 162, ionizationEnergy: 633, density: 2.989, meltingPoint: 1541, boilingPoint: 2830, discovery: 'Lars Fredrik Nilson (1879)', uses: 'Sportötvözetek szilárdítása, prémium világítás.', fact: 'Mengyelejev eka-bór néven sikeresen megjósolta a felfedezése előtt.', chemicalReview: 'Az első d-átmenetifém. Átmeneti jellegű, de kémiailag leggyakrabban 3+ oxidációs állapotot vesz fel, mint a lantanidák.' },
  { number: 22, symbol: 'Ti', name: 'Titán', mass: 47.867, period: 4, group: 4, row: 4, col: 4, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '4, 3', electronConfig: '[Ar] 3d² 4s²', shells: [2, 8, 10, 2], electronegativity: 1.54, atomicRadius: 147, ionizationEnergy: 658, density: 4.54, meltingPoint: 1668, boilingPoint: 3287, discovery: 'William Gregor (1791)', uses: 'Fogászati és csont implantátumok, repülőgépek, fehér TiO₂ festék.', fact: 'Rendkívül erős és könnyű fém, amit a test nem vet el magától.', chemicalReview: 'Hihetetlenül korrózióálló a felületén másodpercek alatt képződő zárt és ellenálló titán-dioxid rétegnek köszönhetően.' },
  { number: 23, symbol: 'V', name: 'Vanádium', mass: 50.942, period: 4, group: 5, row: 4, col: 5, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '5, 4, 3, 2', electronConfig: '[Ar] 3d³ 4s²', shells: [2, 8, 11, 2], electronegativity: 1.63, atomicRadius: 134, ionizationEnergy: 650, density: 6.11, meltingPoint: 1910, boilingPoint: 3407, discovery: 'del Río (1801)', uses: 'Szerszámacél erősítő, kénsavgyártás katalizátora (V₂O₅).', fact: 'Látványos ion-színei miatt Vanadis skandináv szépségistennőről nevezték el.', chemicalReview: 'A különböző oxidációs számai (+2 lila, +3 zöld, +4 kék, +5 sárga) látványos példái az átmenetifém ionok színességének.' },
  { number: 24, symbol: 'Cr', name: 'Króm', mass: 51.996, period: 4, group: 6, row: 4, col: 6, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '3, 6, 2', electronConfig: '[Ar] 3d⁵ 4s¹', shells: [2, 8, 13, 1], electronegativity: 1.66, atomicRadius: 128, ionizationEnergy: 653, density: 7.15, meltingPoint: 1907, boilingPoint: 2671, discovery: 'Klaproth, Vauquelin (1797)', uses: 'Autók tuning krómozása, rozsdamentes acél.', fact: 'A rubin vörösét a korund rácsába épülő króm-szennyezés adja.', chemicalReview: 'Elektronszerkezetében félig betöltött d-héj dominál (3d⁵ 4s¹). A króm(III) fontos nyomelem, míg a króm(VI) rákkeltő méreg.' },
  { number: 25, symbol: 'Mn', name: 'Mangán', mass: 54.938, period: 4, group: 7, row: 4, col: 7, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2, 4, 7, 3', electronConfig: '[Ar] 3d⁵ 4s²', shells: [2, 8, 13, 2], electronegativity: 1.55, atomicRadius: 127, ionizationEnergy: 717, density: 7.21, meltingPoint: 1246, boilingPoint: 2061, discovery: 'Johan Gottlieb Gahn (1774)', uses: 'Acél ötvözete, permangán fertőtlenítés, elemek.', fact: 'A lila permanganát (hipermangán) glizololdattal spontaneously tüzet fog.', chemicalReview: 'Rengeteg oxidációs fokot vesz fel (+2-től +7-ig). Leginkább lila permanganátionként (MnO₄⁻) ismert nagyszerű oxidáló hatásáról.' },
  { number: 26, symbol: 'Fe', name: 'Vas', mass: 55.845, period: 4, group: 8, row: 4, col: 8, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2, 3', electronConfig: '[Ar] 3d⁶ 4s²', shells: [2, 8, 14, 2], electronegativity: 1.83, atomicRadius: 126, ionizationEnergy: 762, density: 7.874, meltingPoint: 1538, boilingPoint: 2862, discovery: 'Ókor', uses: 'Acélszerkezetek, hidak, mágnesek, hemoglobin oxigénszállítója.', fact: 'A földmag legfőbb alkotója, mágnesességet biztosít bolygónknak.', chemicalReview: 'Két legfőbb ionja a zöldes vas(II) és sárgásbarna vas(III). Párás levegőn laza, töredező barnásvörös rozsdaréteggé oxidálódik.' },
  { number: 27, symbol: 'Co', name: 'Kobalt', mass: 58.933, period: 4, group: 9, row: 4, col: 9, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2, 3', electronConfig: '[Ar] 3d⁷ 4s²', shells: [2, 8, 15, 2], electronegativity: 1.88, atomicRadius: 125, ionizationEnergy: 760, density: 8.9, meltingPoint: 1495, boilingPoint: 2927, discovery: 'Georg Brandt (1735)', uses: 'Akkuk katódjai, mágnesek, kobaltkék üvegfestékek, B12 vitamin.', fact: 'Német bányamanókról (Kobold) nevezték el a nehezen olvasztható érc miatt.', chemicalReview: 'Komplex vegyületek formájában vizes közegben a kobalt(II) hidratáltságtól függően kék és rózsaszín közt váltja a színét (időjelzőkben alkalmazva).' },
  { number: 28, symbol: 'Ni', name: 'Nikkel', mass: 58.693, period: 4, group: 10, row: 4, col: 10, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2, 3', electronConfig: '[Ar] 3d⁸ 4s²', shells: [2, 8, 16, 2], electronegativity: 1.91, atomicRadius: 124, ionizationEnergy: 737, density: 8.908, meltingPoint: 1455, boilingPoint: 2913, discovery: 'Cronstedt (1751)', uses: 'Pénzérmék verése, rozsdamentes acélbevonatok, akkuk.', fact: 'Gyakori fémallergia forrása, olcsó ékszerekből bőrre oldódva viszketést okoz.', chemicalReview: 'A nikkel(II)-ionok gyönyörű smaragdzöld színűek vizes oldatban. Kitűnő hidrogénező katalizátorként működik a margaringyártásban.' },
  { number: 29, symbol: 'Cu', name: 'Réz', mass: 63.546, period: 4, group: 11, row: 4, col: 11, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2, 1', electronConfig: '[Ar] 3d¹⁰ 4s¹', shells: [2, 8, 18, 1], electronegativity: 1.90, atomicRadius: 128, ionizationEnergy: 745, density: 8.96, meltingPoint: 1084.6, boilingPoint: 2562, discovery: 'Ókor', uses: 'Vezetékek (remek vezető), vízcsövek, sárgaréz és bronz ötvözetek.', fact: 'Az arany mellett az egyetlen fém, amely nem szürke vagy ezüstös alapszínű.', chemicalReview: 'Nem-nemes fém tulajdonságokat mutat. Sósav egyedül oxidálószer hiányában nem oldja, de forró tömény kénsav vagy salétromsav könnyen felszámolja.' },
  { number: 30, symbol: 'Zn', name: 'Cink', mass: 65.38, period: 4, group: 12, row: 4, col: 12, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2', electronConfig: '[Ar] 3d¹⁰ 4s²', shells: [2, 8, 18, 2], electronegativity: 1.65, atomicRadius: 134, ionizationEnergy: 906, density: 7.14, meltingPoint: 419.5, boilingPoint: 907, discovery: 'Ismeretlen / 1746', uses: 'Vas horganyzása (rozsdavédelem), sárgaréz, kenőcsök.', fact: 'Az amerikai egycentes érmék leginkább cinkből állnak rézbevonattal.', chemicalReview: 'Amfoter jellegű nehézfém: savak mellett tömény nátrium-hidroxid lúgban is hidrogénfejlődés kíséretében oldódik, cinkát komplexet adva.' },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: 69.723, period: 4, group: 13, row: 4, col: 13, block: 'p', category: 'posztatmenetifem', state: 'szilárd', valence: '3', electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', shells: [2, 8, 18, 3], electronegativity: 1.81, atomicRadius: 135, ionizationEnergy: 579, density: 5.91, meltingPoint: 29.76, boilingPoint: 2204, discovery: 'Boisbaudran (1875)', uses: 'Félvezetők, LED-ek (GaAs), magas lázmérők.', fact: 'Kézben tartva testmelegtől látványosan ezüstösen megolvad.', chemicalReview: 'Alumíniumrokonságban álló háromvegyértékű elem. Olvadáspontja alacsony, ám forráspontja rendkívül nagy, folyékony tartománya igen széles.' },
  { number: 32, symbol: 'Ge', name: 'Germánium', mass: 72.63, period: 4, group: 14, row: 4, col: 14, block: 'p', category: 'felfem', state: 'szilárd', valence: '4, 2', electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', shells: [2, 8, 18, 4], electronegativity: 2.01, atomicRadius: 122, ionizationEnergy: 762, density: 5.323, meltingPoint: 938.3, boilingPoint: 2833, discovery: 'Clemens Winkler (1886)', uses: 'Optikai kábelek, éjjellátó infravörös lencsék.', fact: 'Minden korai tranzisztor germániumból épült fel, mielőtt a szilícium átvette a helyét.', chemicalReview: 'Kékesfehér félfém, szilícium- és szénanalóg kovalens ráccsal. Csak forró salétromsav vagy királyvíz bírja lassan kikezdeni.' },
  { number: 33, symbol: 'As', name: 'Arzén', mass: 74.922, period: 4, group: 15, row: 4, col: 15, block: 'p', category: 'felfem', state: 'szilárd', valence: '3, 5, -3', electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', shells: [2, 8, 18, 5], electronegativity: 2.18, atomicRadius: 120, ionizationEnergy: 947, density: 5.727, meltingPoint: 817, boilingPoint: 614, discovery: 'Albertus Magnus (1250)', uses: 'Szennyező adalékanyag az elektronikában, régi kártevők mérgei.', fact: 'Napóleon tapétájának zöld arzénfestékéből kipárolgó gőzök is hozzájárulhattak halálához.', chemicalReview: 'Hevítés hatására közvetlenül gázzá alakul (szublimáció). Oxidja az arzenik (As₂O₃) híresen mérgező, gátolja a sejtlégzést.' },
  { number: 34, symbol: 'Se', name: 'Szelén', mass: 78.971, period: 4, group: 16, row: 4, col: 16, block: 'p', category: 'nemfem', state: 'szilárd', valence: '2, 4, 6, -2', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', shells: [2, 8, 18, 6], electronegativity: 2.55, atomicRadius: 116, ionizationEnergy: 941, density: 4.81, meltingPoint: 221, boilingPoint: 685, discovery: 'Berzelius (1817)', uses: 'Fénymásoló hengerek, napelemek, vörös jénai üvegek.', fact: 'A szelén elektromos vezetése fény hatására bámulatos mértékben megugrik.', chemicalReview: 'Kénnel rokon nemfém. Bár kis mennyiségben alapvető vörösvértest-védő nyomelem, túladagolása csontbántalmat s hajhullást eredményez.' },
  { number: 35, symbol: 'Br', name: 'Bróm', mass: 79.904, period: 4, group: 17, row: 4, col: 17, block: 'p', category: 'halogen', state: 'folyékony', valence: '1, 3, 5, -1', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', shells: [2, 8, 18, 7], electronegativity: 2.96, atomicRadius: 114, ionizationEnergy: 1140, density: 3.102, meltingPoint: -7.2, boilingPoint: 58.8, discovery: 'Antoine Balard (1826)', uses: 'Műanyagok égésgátló adalékai, orvosi bromid szerek, fotópapírok.', fact: 'Egyetlen nemfém gáz/folyadék csoport, ami szobahőmérsékleten cseppfolyós.', chemicalReview: 'Fojtogató szagú vörösesbarna folyadék. Heves reakciót ad a fémekkel, oxidációs foka legstabilabban -1 bromidionként.' },
  { number: 36, symbol: 'Kr', name: 'Kripton', mass: 83.798, period: 4, group: 18, row: 4, col: 18, block: 'p', category: 'nemesgaz', state: 'gáz', valence: '0, 2', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', shells: [2, 8, 18, 8], electronegativity: 3.00, atomicRadius: 88, ionizationEnergy: 1351, density: 0.00373, meltingPoint: -157.4, boilingPoint: -153.2, discovery: 'Ramsay, Travers (1898)', uses: 'Reptéri villanófények, prémium ablak hőszigetelés.', fact: 'Ritkasága miatt nyerte a rejtőzködő görög kriptosz szóból a nevét.', chemicalReview: 'Nehezebb szerves nemesgáz, amely fluorral különlegesen instabil kripton-difluorid (KrF₂) szerkezetet képes adni.' },

  // Period 5
  { number: 37, symbol: 'Rb', name: 'Rubídium', mass: 85.468, period: 5, group: 1, row: 5, col: 1, block: 's', category: 'alkalifem', state: 'szilárd', valence: '1', electronConfig: '[Kr] 5s¹', shells: [2, 8, 18, 8, 1], electronegativity: 0.82, atomicRadius: 248, ionizationEnergy: 403, density: 1.532, meltingPoint: 39.3, boilingPoint: 688, discovery: 'Bunsen, Kirchhoff (1861)', uses: 'Atomórák, infravörös fotocellák.', fact: 'Egy meleg nyári délutánon simán cseppfolyóssá olvad a tárolójában.', chemicalReview: 'Rendkívül elektropozitív alkalifém, levegőn spontán meggyullad, jégen is robban.' },
  { number: 38, symbol: 'Sr', name: 'Stroncium', mass: 87.62, period: 5, group: 2, row: 5, col: 2, block: 's', category: 'alkalifoldfem', state: 'szilárd', valence: '2', electronConfig: '[Kr] 5s²', shells: [2, 8, 18, 8, 2], electronegativity: 0.95, atomicRadius: 215, ionizationEnergy: 549, density: 2.64, meltingPoint: 777, boilingPoint: 1382, discovery: 'Adair Crawford (1790)', uses: 'Piros színű tűzijátékok, mágneses keverők.', fact: 'Levegőn pirosas vörös helyett sárgássá oxidálódik másodpercek alatt.', chemicalReview: 'Ionos karakterű fém, vízben stroncium-hidroxiddá sűrűsödik hidrogén keletkezése mellett.' },
  { number: 39, symbol: 'Y', name: 'Ittrium', mass: 88.906, period: 5, group: 3, row: 5, col: 3, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '3', electronConfig: '[Kr] 4d¹ 5s²', shells: [2, 8, 18, 9, 2], electronegativity: 1.22, atomicRadius: 180, ionizationEnergy: 600, density: 4.472, meltingPoint: 1526, boilingPoint: 3336, discovery: 'Johan Gadolin (1794)', uses: 'YAG lézerek, szupervezető kerámiák (YBCO), színes TV képernyők.', fact: 'Nevét a svéd Ytterby bányáról kapta, ahonnan sok fura ásvány származott.', chemicalReview: 'Gyenge átmenetifém tulajdonságokat mutat, de 3+ ionos állapota és reakciói miatt a ritkaföldfémek rokona.' },
  { number: 40, symbol: 'Zr', name: 'Cirkónium', mass: 91.224, period: 5, group: 4, row: 5, col: 4, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '4', electronConfig: '[Kr] 4d² 5s²', shells: [2, 8, 18, 10, 2], electronegativity: 1.33, atomicRadius: 160, ionizationEnergy: 640, density: 6.52, meltingPoint: 1855, boilingPoint: 4409, discovery: 'Klaproth (1789)', uses: 'Nukleáris szabályozó rudak tokja, cirkónium porcelán fogpótlások.', fact: 'Dioxidja, a cirkónia, fénylő olcsó gyűrűk mesterséges gyémántpótlása.', chemicalReview: 'Finom filmrétegű passziváció védi a savaktól és lúgoktól, kiváló korrózióállósága az atomerőművekben is bizonyított.' },
  { number: 41, symbol: 'Nb', name: 'Nióbium', mass: 92.906, period: 5, group: 5, row: 5, col: 5, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '5', electronConfig: '[Kr] 4d⁴ 5s¹', shells: [2, 8, 18, 12, 1], electronegativity: 1.6, atomicRadius: 146, ionizationEnergy: 652, density: 8.57, meltingPoint: 2477, boilingPoint: 4744, discovery: 'Hatchett (1801)', uses: 'Szupervezető mágnesek, magas hőmérsékletű turbinák ötvözetei.', fact: 'A mitológiai Tantalusz lányáról, Niobéról nevezték el, mert mindig tantállal közös.', chemicalReview: 'Fémes elektromos vezető, abszolút nulla környékén ideális ellenállásmentes szupervezető.' },
  { number: 42, symbol: 'Mo', name: 'Molibdén', mass: 95.95, period: 5, group: 6, row: 5, col: 6, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '6, 4', electronConfig: '[Kr] 4d⁵ 5s¹', shells: [2, 8, 18, 13, 1], electronegativity: 2.16, atomicRadius: 139, ionizationEnergy: 684, density: 10.28, meltingPoint: 2623, boilingPoint: 4639, discovery: 'Scheele (1778)', uses: 'Nagykeménységű acélok, kenőzsírok adaléka (MoS₂).', fact: 'Nélkülözhetetlen nyomelem az ammóniát bontó földi baktériumok számára.', chemicalReview: 'Rendkívül nehezen olvadó ezüstös átmenetifém, kiterjedt kovalens koordinatív komplexeket hoz létre.' },
  { number: 46, symbol: 'Pd', name: 'Palládium', mass: 106.42, period: 5, group: 10, row: 5, col: 10, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2, 4', electronConfig: '[Kr] 4d¹⁰', shells: [2, 8, 18, 18], electronegativity: 2.20, atomicRadius: 137, ionizationEnergy: 804, density: 12.02, meltingPoint: 1555, boilingPoint: 2963, discovery: 'Wollaston (1803)', uses: 'Kipufogógáz-katalizátorok, fehérarany ékszer.', fact: 'Képes saját térfogatának akár 900-szorosát sűríteni hidrogéngázból.', chemicalReview: 'A platinafémek legkönnyebb tagja. Teli d¹⁰ héjjal rendelkezik, sósav oxidáció és levegő sűrű hatásának ellenáll.' },
  { number: 47, symbol: 'Ag', name: 'Ezüst', mass: 107.87, period: 5, group: 11, row: 5, col: 11, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '1', electronConfig: '[Kr] 4d¹⁰ 5s¹', shells: [2, 8, 18, 18, 1], electronegativity: 1.93, atomicRadius: 144, ionizationEnergy: 731, density: 10.49, meltingPoint: 961.8, boilingPoint: 2162, discovery: 'Ókor', uses: 'Remek elektromos vezetékek, ezüsttükrök, antibakteriális krémek.', fact: 'A legkiválóbb elektromos és hővezető képességgel rendelkező fém.', chemicalReview: 'Fél-nemesfém. Levegőn kénhidrogéntől fekete ezüst-szulfid (Ag₂S) fátyol vonja be. Szinte csak +1 ionos kationokat ad.' },
  { number: 48, symbol: 'Cd', name: 'Kadmium', mass: 112.41, period: 5, group: 12, row: 5, col: 12, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '2', electronConfig: '[Kr] 4d¹⁰ 5s²', shells: [2, 8, 18, 18, 2], electronegativity: 1.69, atomicRadius: 151, ionizationEnergy: 868, density: 8.65, meltingPoint: 321.1, boilingPoint: 767, discovery: 'Stromeyer (1817)', uses: 'Ni-Cd akkumulátorok, nukleáris szabályozó rudak.', fact: 'Igen agresszív sejtméreg, mely vesekárosodást és csonttörést idéz elő.', chemicalReview: 'A cink nehezebb kísérője, sárga színű kadmium-szulfid (CdS) fénylő pigmentként volt elterjedt.' },
  { number: 50, symbol: 'Sn', name: 'Ón', mass: 118.71, period: 5, group: 14, row: 5, col: 14, block: 'p', category: 'posztatmenetifem', state: 'szilárd', valence: '4, 2', electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', shells: [2, 8, 18, 18, 4], electronegativity: 1.96, atomicRadius: 140, ionizationEnergy: 709, density: 7.31, meltingPoint: 231.9, boilingPoint: 2602, discovery: 'Ókor', uses: 'Forrasztófém áramkörökhöz, konzervdoboz belső védőfóliája.', fact: 'Extrém hidegben szürke porrá omlik szét rácscserével (ónpestis).', chemicalReview: 'Stabil fém, de +2-es (redukáló) ón(II)- és stabilabb +4-es ón(IV)- állapotú formákat képez.' },
  { number: 53, symbol: 'I', name: 'Jód', mass: 126.9, period: 5, group: 17, row: 5, col: 17, block: 'p', category: 'halogen', state: 'szilárd', valence: '1, 5, 7, -1', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', shells: [2, 8, 18, 18, 7], electronegativity: 2.66, atomicRadius: 133, ionizationEnergy: 1008, density: 4.93, meltingPoint: 113.7, boilingPoint: 184.3, discovery: 'Courtois (1811)', uses: 'Pajzsmirigy jódpótlás, fertőtlenítő Betadine oldatok.', fact: 'Langyos melegre lilás gőzzel, cseppfolyósodás nélkül szublimál.', chemicalReview: 'A legkörnyezetbarátabb, legkevésbé agresszív halogén. Keményítővel látványos mély kék színreakciót produkál.' },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, period: 5, group: 18, row: 5, col: 18, block: 'p', category: 'nemesgaz', state: 'gáz', valence: '0, 2, 4, 6, 8', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', shells: [2, 8, 18, 18, 8], electronegativity: 2.60, atomicRadius: 108, ionizationEnergy: 1170, density: 0.00589, meltingPoint: -111.8, boilingPoint: -108.0, discovery: 'Ramsay, Travers (1898)', uses: 'Gépkocsi fényszórók, altató gázok, ionhajtómű gáz.', fact: 'Elsőként róla mutatták ki, hogy fluorral képes igazi kovalens vegyületeket adni.', chemicalReview: 'Tágas atomsugara folytán a nemesgázok közt leginkább hajlamos d-pályái oxidálására oxigénnel és fluorral.' },

  // Period 6
  { number: 55, symbol: 'Cs', name: 'Cézium', mass: 132.91, period: 6, group: 1, row: 6, col: 1, block: 's', category: 'alkalifem', state: 'szilárd', valence: '1', electronConfig: '[Xe] 6s¹', shells: [2, 8, 18, 18, 8, 1], electronegativity: 0.79, atomicRadius: 265, ionizationEnergy: 376, density: 1.93, meltingPoint: 28.44, boilingPoint: 671, discovery: 'Bunsen, Kirchhoff (1860)', uses: 'Atomórák legfőbb frekvenciája (1 másodperc definíciója).', fact: 'Az 1 másodperc hossza a cézium-133 atom rezgésének számlálásával dől el.', chemicalReview: 'A legkisebb ionizációs energiájú stabil fém. Rendkívül hevesen, azonnali robbanással reagál vízzel.' },
  { number: 56, symbol: 'Ba', name: 'Bárium', mass: 137.33, period: 6, group: 2, row: 6, col: 2, block: 's', category: 'alkalifoldfem', state: 'szilárd', valence: '2', electronConfig: '[Xe] 6s²', shells: [2, 8, 18, 18, 8, 2], electronegativity: 0.89, atomicRadius: 222, ionizationEnergy: 503, density: 3.51, meltingPoint: 727, boilingPoint: 1897, discovery: 'Davy (1808)', uses: 'Röntgendiagnosztika teakontrasztja (BaSO₄), zöld rakétafény.', fact: 'Sói erősen mérgezőek, de a BaSO₄ annyira oldhatatlan gipsz, hogy büntetlenül lenyelhető.', chemicalReview: 'Nagyon aktív alkáliföldfém. Levegőn hevítve képes bárium-peroxidot (BaO₂) hozni létre kiváló oxidálószerként.' },
  { number: 57, symbol: 'La', name: 'Lantán', mass: 138.91, period: 6, group: 3, row: 9, col: 4, block: 'f', category: 'lantanoida', state: 'szilárd', valence: '3', electronConfig: '[Xe] 5d¹ 6s²', shells: [2, 8, 18, 18, 9, 2], electronegativity: 1.10, atomicRadius: 187, ionizationEnergy: 538, density: 6.16, meltingPoint: 920, boilingPoint: 3464, discovery: 'Mosander (1839)', uses: 'Fényképezőgépek lencséinek üvegtörés javítására, akkuk.', fact: 'A ritkaföldfém lantanidák csoportjának első és névadó tagja.', chemicalReview: 'A lantán-összehúzódás indítóeleme, kémiailag tiszta 3+ töltésű ionokat képez.' },

  // Heavy select elements
  { number: 78, symbol: 'Pt', name: 'Platina', mass: 195.08, period: 6, group: 10, row: 6, col: 10, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '4, 2', electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', shells: [2, 8, 18, 32, 17, 1], electronegativity: 2.28, atomicRadius: 139, ionizationEnergy: 870, density: 21.45, meltingPoint: 1768.3, boilingPoint: 3825, discovery: 'Ulloa (1735)', uses: 'Katalizátorok autókban, ciszplatin daganatgyógyszer, laboratóriumi tégelyek.', fact: 'Csak forró tömény sósav s salétromsav elegyében, azaz királyvízben oldódik.', chemicalReview: 'Rendkívül szívós nemesfém, d-elektronjai védenek minden nem kívánt külső kémiai elektronátadástól.' },
  { number: 79, symbol: 'Au', name: 'Arany', mass: 196.97, period: 6, group: 11, row: 6, col: 11, block: 'd', category: 'atmenetifem', state: 'szilárd', valence: '3, 1', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', shells: [2, 8, 18, 32, 18, 1], electronegativity: 2.54, atomicRadius: 144, ionizationEnergy: 890, density: 19.3, meltingPoint: 1064.2, boilingPoint: 2856, discovery: 'Ókor', uses: 'Pénzügyi fedezet, ékszerek, korróziómentes számítógépcsatlakozók.', fact: '1 gramm tiszta aranyból akár 3 kilométer hosszú hajszálvékony huzal sodorható.', chemicalReview: 'A legstabilabb, legkevésbé reakcióképes fémünk. Vegyületeit lúgos fázisban leginkább d-komplexként tartja fenn.' },
  { number: 80, symbol: 'Hg', name: 'Higany', mass: 200.59, period: 6, group: 12, row: 6, col: 12, block: 'd', category: 'atmenetifem', state: 'folyékony', valence: '2, 1', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', shells: [2, 8, 18, 32, 18, 2], electronegativity: 2.00, atomicRadius: 151, ionizationEnergy: 1007, density: 13.534, meltingPoint: -38.83, boilingPoint: 356.7, discovery: 'Ókor', uses: 'Lázmérők, amalgám tömések, energiatakarékos izzók.', fact: 'Különleges folyékony fém, gőzei erősen roncsolják a központi idegrendszert.', chemicalReview: 'Zárt és relavisztikusan stabilizált 6s² alhéja miatt nemesgáz-szerűen gyenge fémes kötést tud fenntartani, ezért folyékony.' },
  { number: 82, symbol: 'Pb', name: 'Ólom', mass: 207.2, period: 6, group: 14, row: 6, col: 14, block: 'p', category: 'posztatmenetifem', state: 'szilárd', valence: '2, 4', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', shells: [2, 8, 18, 32, 18, 4], electronegativity: 2.33, atomicRadius: 175, ionizationEnergy: 716, density: 11.34, meltingPoint: 327.46, boilingPoint: 1749, discovery: 'Ókor', uses: 'Autóakkumulátorok, nukleáris sugárzásvédelem nehéz köpenye.', fact: 'A rádioaktív bomlási sorok döntő részben csendes stabil ólommá bomlanak le végül.', chemicalReview: 'Mérgező nehézfém, gátolja a hemoglobin képződését. Passziválódik, így híg kénsavban lassan, nehezen oldódik.' },
  { number: 83, symbol: 'Bi', name: 'Bizmut', mass: 208.98, period: 6, group: 15, row: 6, col: 15, block: 'p', category: 'posztatmenetifem', state: 'szilárd', valence: '3, 5', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', shells: [2, 8, 18, 32, 18, 5], electronegativity: 2.02, atomicRadius: 150, ionizationEnergy: 703, density: 9.78, meltingPoint: 271.5, boilingPoint: 1564, discovery: 'C. Geoffroy (1753)', uses: 'Tűzvédelmi olvadó biztosítékok, gyógyszerhatóanyagok.', fact: 'Kristályai látványos szivárványos színben pompázó lépcsős alakzatokban nőnek.', chemicalReview: 'A legkevésbé toxikus nehézfém. A legerősebb diamágneses fémek egyike, taszítja a mágneses tereket.' },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: 222, period: 6, group: 18, row: 6, col: 18, block: 'p', category: 'nemesgaz', state: 'gáz', valence: '0', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', shells: [2, 8, 18, 32, 18, 8], electronegativity: 2.2, atomicRadius: 120, ionizationEnergy: 1037, density: 0.00973, meltingPoint: -71, boilingPoint: -61.7, discovery: 'Rutherford (1900)', uses: 'Radiológiai daganatkezelések.', fact: 'Zárt pincékben felgyülemlő radioaktív gáz, mely növeli a tüdőrák veszélyét.', chemicalReview: 'Radioaktív nehéz nemesgáz, bomlása során rákkeltő alfa-sugárzó leányelemek keletkeznek.' },

  // Period 7
  { number: 88, symbol: 'Ra', name: 'Rádium', mass: 226, period: 7, group: 2, row: 7, col: 2, block: 's', category: 'alkalifoldfem', state: 'szilárd', valence: '2', electronConfig: '[Rn] 7s²', shells: [2, 8, 18, 32, 18, 8, 2], electronegativity: 0.9, atomicRadius: 215, ionizationEnergy: 509, density: 5.5, meltingPoint: 700, boilingPoint: 1737, discovery: 'M. Curie, P. Curie (1898)', uses: 'Rákgyógyítás, sötétben fluoreszkáló számlapok korábban.', fact: 'Marie Curie jegyzetfüzetei még ma is sugároznak, ólomdobozban pihennek.', chemicalReview: 'A legnehezebb radioaktív alkáliföldfém, fénylő bomlási hőt termel önmagából.' },
  { number: 92, symbol: 'U', name: 'Urán', mass: 238.03, period: 7, group: 3, row: 10, col: 7, block: 'f', category: 'aktinoida', state: 'szilárd', valence: '6, 5, 4, 3', electronConfig: '[Rn] 5f³ 6d¹ 7s²', shells: [2, 8, 18, 32, 21, 9, 2], electronegativity: 1.38, atomicRadius: 138, ionizationEnergy: 598, density: 18.95, meltingPoint: 1132.2, boilingPoint: 4131, discovery: 'Klaproth (1789)', uses: 'Atomerőművek hasadóanyaga, sugárvédő köpeny nehezékként.', fact: '1 gramm urán hasadása annyi energiát áraszt, mint 20 tonna prémium szén elégetése.', chemicalReview: 'Nehéz, radioaktív aktinoida. Vizes fázisban a sárgás színű uranil-ionként (UO₂²⁺) van jelen leginkább.' },
  { number: 111, symbol: 'Rg', name: 'Röntgénium', mass: 282, period: 7, group: 11, row: 7, col: 11, block: 'd', category: 'atmenetifem', state: 'mesterséges', valence: '3', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s¹', shells: [2, 8, 18, 32, 32, 17, 1], electronegativity: null, atomicRadius: null, ionizationEnergy: null, density: null, meltingPoint: null, boilingPoint: null, discovery: 'GSI (1994)', uses: 'Tudományos kutatás.', fact: 'Röntgen fizikus tiszteletére keresztelt mesterséges szupernehéz atommag.', chemicalReview: 'Instabil transzurán elem, mely ezredmásodpercekig él, mielőtt alfa-bomlást végezne.' }
];

// Complete 118 list catalog with names and positions, filled dynamically for missing elements
const completeListMetadata: Array<{ num: number; sym: string; name: string; mass: number; cat: ElementData['category']; state: ElementData['state']; blk: ElementData['block'] }> = [
  { num: 1, sym: 'H', name: 'Hidrogén', mass: 1.008, cat: 'nemfem', state: 'gáz', blk: 's' },
  { num: 2, sym: 'He', name: 'Hélium', mass: 4.003, cat: 'nemesgaz', state: 'gáz', blk: 'p' },
  { num: 3, sym: 'Li', name: 'Lítium', mass: 6.941, cat: 'alkalifem', state: 'szilárd', blk: 's' },
  { num: 4, sym: 'Be', name: 'Berillium', mass: 9.012, cat: 'alkalifoldfem', state: 'szilárd', blk: 's' },
  { num: 5, sym: 'B', name: 'Bór', mass: 10.81, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 6, sym: 'C', name: 'Szén', mass: 12.01, cat: 'nemfem', state: 'szilárd', blk: 'p' },
  { num: 7, sym: 'N', name: 'Nitrogén', mass: 14.01, cat: 'nemfem', state: 'gáz', blk: 'p' },
  { num: 8, sym: 'O', name: 'Oxigén', mass: 16.00, cat: 'nemfem', state: 'gáz', blk: 'p' },
  { num: 9, sym: 'F', name: 'Fluor', mass: 19.00, cat: 'halogen', state: 'gáz', blk: 'p' },
  { num: 10, sym: 'Ne', name: 'Neon', mass: 20.18, cat: 'nemesgaz', state: 'gáz', blk: 'p' },
  { num: 11, sym: 'Na', name: 'Nátrium', mass: 22.99, cat: 'alkalifem', state: 'szilárd', blk: 's' },
  { num: 12, sym: 'Mg', name: 'Magnézium', mass: 24.31, cat: 'alkalifoldfem', state: 'szilárd', blk: 's' },
  { num: 13, sym: 'Al', name: 'Alumínium', mass: 26.98, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 14, sym: 'Si', name: 'Szilícium', mass: 28.09, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 15, sym: 'P', name: 'Foszfor', mass: 30.97, cat: 'nemfem', state: 'szilárd', blk: 'p' },
  { num: 16, sym: 'S', name: 'Kén', mass: 32.07, cat: 'nemfem', state: 'szilárd', blk: 'p' },
  { num: 17, sym: 'Cl', name: 'Klór', mass: 35.45, cat: 'halogen', state: 'gáz', blk: 'p' },
  { num: 18, sym: 'Ar', name: 'Argon', mass: 39.95, cat: 'nemesgaz', state: 'gáz', blk: 'p' },
  { num: 19, sym: 'K', name: 'Kálium', mass: 39.10, cat: 'alkalifem', state: 'szilárd', blk: 's' },
  { num: 20, sym: 'Ca', name: 'Kalcium', mass: 40.08, cat: 'alkalifoldfem', state: 'szilárd', blk: 's' },
  { num: 21, sym: 'Sc', name: 'Szkandium', mass: 44.96, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 22, sym: 'Ti', name: 'Titán', mass: 47.87, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 23, sym: 'V', name: 'Vanádium', mass: 50.94, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 24, sym: 'Cr', name: 'Króm', mass: 52.00, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 25, sym: 'Mn', name: 'Mangán', mass: 54.94, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 26, sym: 'Fe', name: 'Vas', mass: 55.85, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 27, sym: 'Co', name: 'Kobalt', mass: 58.93, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 28, sym: 'Ni', name: 'Nikkel', mass: 58.69, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 29, sym: 'Cu', name: 'Réz', mass: 63.55, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 30, sym: 'Zn', name: 'Cink', mass: 65.38, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 31, sym: 'Ga', name: 'Gallium', mass: 69.72, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 32, sym: 'Ge', name: 'Germánium', mass: 72.63, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 33, sym: 'As', name: 'Arzén', mass: 74.92, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 34, sym: 'Se', name: 'Szelén', mass: 78.97, cat: 'nemfem', state: 'szilárd', blk: 'p' },
  { num: 35, sym: 'Br', name: 'Bróm', mass: 79.90, cat: 'halogen', state: 'folyékony', blk: 'p' },
  { num: 36, sym: 'Kr', name: 'Kripton', mass: 83.80, cat: 'nemesgaz', state: 'gáz', blk: 'p' },
  { num: 37, sym: 'Rb', name: 'Rubídium', mass: 85.47, cat: 'alkalifem', state: 'szilárd', blk: 's' },
  { num: 38, sym: 'Sr', name: 'Stroncium', mass: 87.62, cat: 'alkalifoldfem', state: 'szilárd', blk: 's' },
  { num: 39, sym: 'Y', name: 'Ittrium', mass: 88.91, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 40, sym: 'Zr', name: 'Cirkónium', mass: 91.22, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 41, sym: 'Nb', name: 'Nióbium', mass: 92.91, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 42, sym: 'Mo', name: 'Molibdén', mass: 95.95, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 43, sym: 'Tc', name: 'Technécium', mass: 98, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 44, sym: 'Ru', name: 'Ruténium', mass: 101.07, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 45, sym: 'Rh', name: 'Ródium', mass: 102.91, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 46, sym: 'Pd', name: 'Palládium', mass: 106.42, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 47, sym: 'Ag', name: 'Ezüst', mass: 107.87, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 48, sym: 'Cd', name: 'Kadmium', mass: 112.41, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 49, sym: 'In', name: 'Indium', mass: 114.82, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 50, sym: 'Sn', name: 'Ón', mass: 118.71, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 51, sym: 'Sb', name: 'Antimon', mass: 121.76, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 52, sym: 'Te', name: 'Tellúr', mass: 127.6, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 53, sym: 'I', name: 'Jód', mass: 126.9, cat: 'halogen', state: 'szilárd', blk: 'p' },
  { num: 54, sym: 'Xe', name: 'Xenon', mass: 131.29, cat: 'nemesgaz', state: 'gáz', blk: 'p' },
  { num: 55, sym: 'Cs', name: 'Cézium', mass: 132.91, cat: 'alkalifem', state: 'szilárd', blk: 's' },
  { num: 56, sym: 'Ba', name: 'Bárium', mass: 137.33, cat: 'alkalifoldfem', state: 'szilárd', blk: 's' },
  
  // Lanthanides (57-71)
  { num: 57, sym: 'La', name: 'Lantán', mass: 138.91, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 58, sym: 'Ce', name: 'Cérium', mass: 140.12, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 59, sym: 'Pr', name: 'Prazeodímium', mass: 140.91, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 60, sym: 'Nd', name: 'Neodímium', mass: 144.24, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 61, sym: 'Pm', name: 'PromComponentium', mass: 145, cat: 'lantanoida', state: 'mesterséges', blk: 'f' },
  { num: 62, sym: 'Sm', name: 'Szamárium', mass: 150.36, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 63, sym: 'Eu', name: 'Európium', mass: 151.96, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 64, sym: 'Gd', name: 'Gadolínium', mass: 157.25, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 65, sym: 'Tb', name: 'Terbium', mass: 158.93, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 66, sym: 'Dy', name: 'Diszprózium', mass: 162.5, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 67, sym: 'Ho', name: 'Holmium', mass: 164.93, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 68, sym: 'Er', name: 'Erbium', mass: 167.26, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 69, sym: 'Tm', name: 'Túlium', mass: 168.93, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 70, sym: 'Yb', name: 'Itterbium', mass: 173.05, cat: 'lantanoida', state: 'szilárd', blk: 'f' },
  { num: 71, sym: 'Lu', name: 'Lutécium', mass: 174.97, cat: 'lantanoida', state: 'szilárd', blk: 'f' },

  // Period 6 Transition continue
  { num: 72, sym: 'Hf', name: 'Hafnium', mass: 178.49, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 73, sym: 'Ta', name: 'Tantál', mass: 180.95, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 74, sym: 'W', name: 'Volfrám', mass: 183.84, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 75, sym: 'Re', name: 'Rénium', mass: 186.21, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 76, sym: 'Os', name: 'Ozmímium', mass: 190.23, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 77, sym: 'Ir', name: 'Irídium', mass: 192.22, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 78, sym: 'Pt', name: 'Platina', mass: 195.08, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 79, sym: 'Au', name: 'Arany', mass: 196.97, cat: 'atmenetifem', state: 'szilárd', blk: 'd' },
  { num: 80, sym: 'Hg', name: 'Higany', mass: 200.59, cat: 'atmenetifem', state: 'folyékony', blk: 'd' },
  { num: 81, sym: 'Tl', name: 'Tallium', mass: 204.38, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 82, sym: 'Pb', name: 'Ólom', mass: 207.2, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 83, sym: 'Bi', name: 'Bizmut', mass: 208.98, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 84, sym: 'Po', name: 'Polónium', mass: 209, cat: 'posztatmenetifem', state: 'szilárd', blk: 'p' },
  { num: 85, sym: 'At', name: 'Asztat', mass: 210, cat: 'felfem', state: 'szilárd', blk: 'p' },
  { num: 86, sym: 'Rn', name: 'Radon', mass: 222, cat: 'nemesgaz', state: 'gáz', blk: 'p' },

  // Period 7
  { num: 87, sym: 'Fr', name: 'Francium', mass: 223, cat: 'alkalifem', state: 'szilárd', blk: 's' },
  { num: 88, sym: 'Ra', name: 'Rádium', mass: 226, cat: 'alkalifoldfem', state: 'szilárd', blk: 's' },

  // Actinides (89-103)
  { num: 89, sym: 'Ac', name: 'Aktínium', mass: 227, cat: 'aktinoida', state: 'szilárd', blk: 'f' },
  { num: 90, sym: 'Th', name: 'Tórium', mass: 232.04, cat: 'aktinoida', state: 'szilárd', blk: 'f' },
  { num: 91, sym: 'Pa', name: 'Protaktínium', mass: 231.04, cat: 'aktinoida', state: 'szilárd', blk: 'f' },
  { num: 92, sym: 'U', name: 'Urán', mass: 238.03, cat: 'aktinoida', state: 'szilárd', blk: 'f' },
  { num: 93, sym: 'Np', name: 'Neptúnium', mass: 237, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 94, sym: 'Pu', name: 'Plutónium', mass: 244, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 95, sym: 'Am', name: 'Amerícium', mass: 243, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 96, sym: 'Cm', name: 'Kúrium', mass: 247, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 97, sym: 'Bk', name: 'Berkélium', mass: 247, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 98, sym: 'Cf', name: 'Kalifornium', mass: 251, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 99, sym: 'Es', name: 'Einsteinium', mass: 252, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 100, sym: 'Fm', name: 'Fermium', mass: 257, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 101, sym: 'Md', name: 'Mendeléveium', mass: 258, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 102, sym: 'No', name: 'Nobélium', mass: 259, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },
  { num: 103, sym: 'Lr', name: 'Laurencium', mass: 262, cat: 'aktinoida', state: 'mesterséges', blk: 'f' },

  // Period 7 Transacty continuation
  { num: 104, sym: 'Rf', name: 'Raderfordium', mass: 267, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 105, sym: 'Db', name: 'Dubnium', mass: 268, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 106, sym: 'Sg', name: 'Sziborgium', mass: 271, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 107, sym: 'Bh', name: 'Bohrium', mass: 270, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 108, sym: 'Hs', name: 'Hasszium', mass: 277, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 109, sym: 'Mt', name: 'Meitnérium', mass: 278, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 110, sym: 'Ds', name: 'Darmstadtium', mass: 281, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 111, sym: 'Rg', name: 'Röntgénium', mass: 282, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 112, sym: 'Cn', name: 'Kopernícium', mass: 285, cat: 'atmenetifem', state: 'mesterséges', blk: 'd' },
  { num: 113, sym: 'Nh', name: 'Nihónium', mass: 286, cat: 'posztatmenetifem', state: 'mesterséges', blk: 'p' },
  { num: 114, sym: 'Fl', name: 'Fleróvium', mass: 289, cat: 'posztatmenetifem', state: 'mesterséges', blk: 'p' },
  { num: 115, sym: 'Mc', name: 'Moszkóvium', mass: 290, cat: 'posztatmenetifem', state: 'mesterséges', blk: 'p' },
  { num: 116, sym: 'Lv', name: 'Livermórium', mass: 293, cat: 'posztatmenetifem', state: 'mesterséges', blk: 'p' },
  { num: 117, sym: 'Ts', name: 'Tenesszium', mass: 294, cat: 'halogen', state: 'mesterséges', blk: 'p' },
  { num: 118, sym: 'Og', name: 'Oganesszon', mass: 294, cat: 'nemesgaz', state: 'mesterséges', blk: 'p' }
];

// Reconstruct the full table elements list by marrying detailed records and defaults
export const getElements = (): ElementData[] => {
  return completeListMetadata.map(meta => {
    // Find rich details if defined
    const rich = rawElements.find(raw => raw.number === meta.num);
    
    // Determine grid coordinates (Period is 1-7. Group is 1-18)
    const num = meta.num;
    let computedRow = 0;
    let computedCol = 0;

    // Grid coordinates
    if (num === 1) { computedRow = 1; computedCol = 1; }
    else if (num === 2) { computedRow = 1; computedCol = 18; }
    // Period 2: 3-4 (Col 1-2), 5-10 (Col 13-18)
    else if (num >= 3 && num <= 4) { computedRow = 2; computedCol = num - 2; }
    else if (num >= 5 && num <= 10) { computedRow = 2; computedCol = num - 5 + 13; }
    // Period 3: 11-12 (Col 1-2), 13-18 (Col 13-18)
    else if (num >= 11 && num <= 12) { computedRow = 3; computedCol = num - 10; }
    else if (num >= 13 && num <= 18) { computedRow = 3; computedCol = num - 13 + 13; }
    // Period 4: 19-36
    else if (num >= 19 && num <= 36) { computedRow = 4; computedCol = num - 18; }
    // Period 5: 37-54
    else if (num >= 37 && num <= 54) { computedRow = 5; computedCol = num - 36; }
    // Period 6 (Lanthanides split)
    else if (num >= 55 && num <= 56) { computedRow = 6; computedCol = num - 54; }
    else if (num >= 57 && num <= 71) { computedRow = 9; computedCol = num - 57 + 4; } // Lanthanide Row
    else if (num >= 72 && num <= 86) { computedRow = 6; computedCol = num - 72 + 4; }
    // Period 7 (Actinides split)
    else if (num >= 87 && num <= 88) { computedRow = 7; computedCol = num - 86; }
    else if (num >= 89 && num <= 103) { computedRow = 10; computedCol = num - 89 + 4; } // Actinide Row
    else if (num >= 104 && num <= 118) { computedRow = 7; computedCol = num - 104 + 4; }

    const periodVal = (num >= 57 && num <= 71) ? 6 : (num >= 89 && num <= 103) ? 7 : (computedRow <= 7 ? computedRow : (computedRow === 9 ? 6 : 7));
    const groupVal = (num >= 57 && num <= 71) ? 3 : (num >= 89 && num <= 103) ? 3 : computedCol;

    // Electron shells fallback generator based on period
    const generateShells = (n: number): number[] => {
      // Very basic approximation for synthetic elements
      if (n === 118) return [2, 8, 18, 32, 32, 18, 8];
      const s: number[] = [];
      let remaining = n;
      const limits = [2, 8, 18, 32, 32, 18, 8];
      for (const limit of limits) {
        if (remaining > limit) {
          s.push(limit);
          remaining -= limit;
        } else {
          s.push(remaining);
          break;
        }
      }
      return s;
    };

    return {
      number: num,
      symbol: meta.sym,
      name: meta.name,
      mass: meta.mass,
      period: periodVal,
      group: groupVal,
      row: computedRow,
      col: computedCol,
      block: meta.blk,
      category: meta.cat,
      state: meta.state,
      
      // Fallbacks from rich details
      valence: rich?.valence || 'Változó',
      electronConfig: rich?.electronConfig || `${meta.blk}-pályák`,
      shells: rich?.shells || generateShells(num),
      electronegativity: rich?.electronegativity !== undefined ? rich.electronegativity : null,
      atomicRadius: rich?.atomicRadius !== undefined ? rich.atomicRadius : null,
      ionizationEnergy: rich?.ionizationEnergy !== undefined ? rich.ionizationEnergy : null,
      density: rich?.density !== undefined ? rich.density : null,
      meltingPoint: rich?.meltingPoint !== undefined ? rich.meltingPoint : null,
      boilingPoint: rich?.boilingPoint !== undefined ? rich.boilingPoint : null,
      discovery: rich?.discovery || 'Ismeretlen / Mesterséges',
      uses: rich?.uses || 'Kizárólag tudományos kutatási célokra, instabil mag.',
      fact: rich?.fact || 'Rendkívül instabil, laboratóriumban előállított mesterséges elem.',
      chemicalReview: rich?.chemicalReview || `A szupernehéz ${meta.name} a periódusos rendszer végén található. Rendkívül rövid felezési ideje miatt kémiai tulajdonságait csak elméleti modellekkel lehet előrejelezni.`
    };
  });
};

export const ELEMENTS = getElements();
