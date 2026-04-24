/**
 * Gold Rush Trail — text adventure / Oregon Trail style
 * Route: New York → Chagres (Panama) → across isthmus → Panama City → Pacific → San Francisco
 */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const LANGUAGE = { en: "en", es: "es" };
  let currentLanguage = LANGUAGE.en;
  const bgMusic = new Audio("assets/Oh Susana.mp3");
  const loseMusic = new Audio("assets/womp_womp.mp3");
  bgMusic.loop = true;
  bgMusic.preload = "auto";
  loseMusic.loop = false;
  loseMusic.preload = "auto";
  let musicStarted = false;
  let isMuted = false;

  const I18N = {
    en: {
      htmlLang: "en",
      pageTitle: "Gold Rush Trail — Panama Route",
      ariaGame: "Gold Rush Trail game",
      ariaScene: "Scene illustration",
      subtitle: "Panama Route Focus · 1849",
      labels: { health: "Health", rations: "Rations", gold: "Gold", morale: "Morale", leg: "Leg" },
      continueChoice: "Continue",
      muteMusic: "Mute music",
      unmuteMusic: "Unmute music",
      languageLabel: "Language",
      languageChoices: { en: "English", es: "Espanol" },
      namePlaceholder: "YOUR NAME",
      nameAria: "Prospector name",
      beginJourney: "Begin journey",
      replay: "Play again",
      retry: "Try again",
      statWords: {
        health: ["POOR", "FAIR", "GOOD", "STRONG"],
        rations: ["LOW", "ADEQUATE", "PLENTY", "FULL"],
        morale: ["LOW", "WARY", "STEADY", "HIGH"],
      },
      legs: [
        { id: "ny", name: "Departure — New York" },
        { id: "atlantic", name: "To the Isthmus" },
        { id: "chagres", name: "Chagres River" },
        { id: "isthmus", name: "Panama Trail" },
        { id: "saloon", name: "Jungle Saloons" },
        { id: "panamaCity", name: "Panama City" },
        { id: "pacific", name: "Pacific departure" },
        { id: "sf", name: "San Francisco landing" },
      ],
    },
    es: {
      htmlLang: "es",
      pageTitle: "Gold Rush Trail — Ruta de Panama",
      ariaGame: "Juego Gold Rush Trail",
      ariaScene: "Ilustracion de la escena",
      subtitle: "Enfoque Ruta de Panama · 1849",
      labels: { health: "Salud", rations: "Raciones", gold: "Oro", morale: "Animo", leg: "Tramo" },
      continueChoice: "Continuar",
      muteMusic: "Silenciar musica",
      unmuteMusic: "Activar musica",
      languageLabel: "Idioma",
      languageChoices: { en: "Ingles", es: "Espanol" },
      namePlaceholder: "TU NOMBRE",
      nameAria: "Nombre del buscador",
      beginJourney: "Comenzar viaje",
      replay: "Jugar de nuevo",
      retry: "Intentar otra vez",
      statWords: {
        health: ["MALA", "REGULAR", "BUENA", "FUERTE"],
        rations: ["BAJAS", "SUFICIENTES", "MUCHAS", "LLENAS"],
        morale: ["BAJO", "INQUIETO", "FIRME", "ALTO"],
      },
      legs: [
        { id: "ny", name: "Salida — Nueva York" },
        { id: "atlantic", name: "Hacia el istmo" },
        { id: "chagres", name: "Rio Chagres" },
        { id: "isthmus", name: "Sendero de Panama" },
        { id: "saloon", name: "Salones de selva" },
        { id: "panamaCity", name: "Ciudad de Panama" },
        { id: "pacific", name: "Salida al Pacifico" },
        { id: "sf", name: "Llegada a San Francisco" },
      ],
    },
  };

  function tr(en, es) {
    return currentLanguage === LANGUAGE.es ? es : en;
  }

  function tryStartMusic() {
    if (musicStarted) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(() => {
        musicStarted = true;
      }).catch(() => {
        // Browser blocked autoplay without user gesture; keep trying on future interactions.
      });
    } else {
      musicStarted = true;
    }
  }

  function l10n() {
    return I18N[currentLanguage];
  }

  const SCENE_ART = {
    start: { src: "assets/scene-start.png", alt: { en: "1849 New York waterfront and steamships, pixel art", es: "Puerto de Nueva York de 1849 y vapores, pixel art" } },
    ny: { src: "assets/scene-ny.png", alt: { en: "Pixel art: New York harbor, outfitting dock and paddle steamer.", es: "Pixel art: puerto de Nueva York, muelle de suministros y vapor." } },
    atlanticBoarding: { src: "assets/scene-atlantic-calm.png", alt: { en: "Pixel art: steamer at sea, smokestack and open ocean.", es: "Pixel art: vapor en alta mar, chimenea y oceano abierto." } },
    atlanticStorm: { src: "assets/scene-atlantic-storm.png", alt: { en: "Pixel art: Atlantic storm, ship in heavy seas.", es: "Pixel art: tormenta en el Atlantico, barco entre olas." } },
    atlanticCalm: { src: "assets/scene-atlantic-calm.png", alt: { en: "Pixel art: calm Atlantic crossing, steamer on gentle swells.", es: "Pixel art: cruce tranquilo del Atlantico, vapor sobre olas suaves." } },
    atlanticFever: { src: "assets/scene-atlantic-fever.png", alt: { en: "Pixel art: steamer deck, fever and night watch atmosphere.", es: "Pixel art: cubierta del vapor, fiebre y guardia nocturna." } },
    chagres: { src: "assets/scene-chagres.png", alt: { en: "Pixel art: Chagres River, dugouts and jungle banks.", es: "Pixel art: rio Chagres, canoas y orillas de selva." } },
    isthmus: { src: "assets/scene-isthmus.png", alt: { en: "Pixel art: Panama mule trail, mud and pack train.", es: "Pixel art: sendero de mulas en Panama, barro y recua." } },
    panamaJungleSaloon: { src: "assets/saloon_no_train.png", alt: { en: "Pixel art: Panama Saloon in a jungle clearing, river bungos, pack mules, and Chagres terminus signs.", es: "Pixel art: Panama Saloon en un claro de selva, bungos en el rio, mulas de carga y postes del termino del Chagres." } },
    panamaPlaza: { src: "assets/scene-panama-plaza.png", alt: { en: "Pixel art: Panama City plaza, colonial cathedral and gold-rush crowds.", es: "Pixel art: plaza de Ciudad de Panama y multitudes." } },
    pacificStorm: { src: "assets/scene-pacific-storm.png", alt: { en: "Pixel art: Pacific gale, steamer in high waves.", es: "Pixel art: vendaval del Pacifico, vapor entre olas altas." } },
    pacificCalm: { src: "assets/scene-pacific-calm.png", alt: { en: "Pixel art: long Pacific voyage, calm blue water.", es: "Pixel art: largo viaje por el Pacifico, agua azul tranquila." } },
    sf: { src: "assets/scene-sf.png", alt: { en: "Pixel art: San Francisco Bay, ships and tents on the hills.", es: "Pixel art: bahia de San Francisco, barcos y tiendas en colinas." } },
    win: { src: "assets/scene-win.png", alt: { en: "Pixel art: arrival at San Francisco, gold rush harbor.", es: "Pixel art: llegada a San Francisco, puerto de la fiebre del oro." } },
    lose: { src: "assets/scene-lose.png", alt: { en: "Pixel art: journey ended, somber trail scene.", es: "Pixel art: viaje terminado, escena sombría del camino." } },
  };

  function setSceneArt(key) {
    const img = $("sceneArt");
    if (!img) return;
    const art = SCENE_ART[key] || SCENE_ART.start;
    if (img.getAttribute("src") !== art.src) img.src = art.src;
    img.alt = art.alt[currentLanguage] || art.alt.en;
  }

  /** @type {{ health: number, rations: number, gold: number, morale: number, legIndex: number, name: string }} */
  let state = freshState("");
  let activeChoiceActions = [];

  function freshState(name) {
    return { name: name || "PROSPECTOR", health: 2, rations: 2, gold: 2, morale: 2, legIndex: 0 };
  }

  function applyFrameTranslations() {
    document.documentElement.lang = l10n().htmlLang;
    document.title = l10n().pageTitle;
    $("gameFrame").setAttribute("aria-label", l10n().ariaGame);
    $("portraitPanel").setAttribute("aria-label", l10n().ariaScene);
    $("gameSubtitle").textContent = l10n().subtitle;
    $("labelHealth").textContent = l10n().labels.health;
    $("labelRations").textContent = l10n().labels.rations;
    $("labelGold").textContent = l10n().labels.gold;
    $("labelMorale").textContent = l10n().labels.morale;
    $("labelLeg").textContent = l10n().labels.leg;
    updateAudioToggleLabel();
  }

  function updateAudioToggleLabel() {
    const btn = $("audioToggle");
    if (!btn) return;
    btn.textContent = isMuted ? "🔇" : "🔊";
    const label = isMuted ? l10n().unmuteMusic : l10n().muteMusic;
    btn.setAttribute("aria-label", label);
    btn.title = label;
    btn.setAttribute("aria-pressed", String(isMuted));
  }

  function toggleMusicMute() {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    loseMusic.muted = isMuted;
    if (!isMuted) tryStartMusic();
    updateAudioToggleLabel();
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function statWord(key, val) { const arr = l10n().statWords[key]; return arr[clamp(val, 0, arr.length - 1)]; }
  function currentLeg() { return l10n().legs[state.legIndex] || l10n().legs[0]; }

  function renderStats() {
    $("statHealth").textContent = statWord("health", state.health);
    $("statRations").textContent = statWord("rations", state.rations);
    $("statGold").textContent = String(50 + state.gold * 75) + " $";
    $("statMorale").textContent = statWord("morale", state.morale);
    $("statLeg").textContent = currentLeg().name.toUpperCase();
  }

  function setNarrative(text) { $("narrative").textContent = text; }
  function clearChoices() {
    $("choices").innerHTML = "";
    activeChoiceActions = [];
  }

  function getChoiceIndexFromKeyEvent(e) {
    if (/^[1-9]$/.test(e.key)) return Number(e.key) - 1;
    if (/^Digit[1-9]$/.test(e.code)) return Number(e.code.slice(5)) - 1;
    if (/^Numpad[1-9]$/.test(e.code)) return Number(e.code.slice(6)) - 1;
    return -1;
  }

  function onGlobalChoiceKeydown(e) {
    const idx = getChoiceIndexFromKeyEvent(e);
    if (idx < 0 || idx >= activeChoiceActions.length) return;
    const action = activeChoiceActions[idx];
    if (typeof action !== "function") return;
    e.preventDefault();
    action();
  }

  window.addEventListener("keydown", onGlobalChoiceKeydown);
  window.addEventListener("click", tryStartMusic);
  window.addEventListener("keydown", tryStartMusic);
  $("audioToggle").addEventListener("click", () => {
    toggleMusicMute();
  });

  function showContinue(next) {
    showChoices([{ label: l10n().continueChoice, action: next }]);
  }

  function showChoices(options) {
    clearChoices();
    const frag = document.createDocumentFragment();
    let resolved = false;
    activeChoiceActions = [];
    const buttons = [];

    options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "choice-btn";
      b.textContent = `${i + 1}. ${opt.label}`;
      const activate = () => {
        if (resolved) return;
        resolved = true;
        activeChoiceActions = [];
        buttons.forEach((btn) => { btn.disabled = true; });
        opt.action();
      };
      activeChoiceActions.push(activate);
      b.addEventListener("click", activate);
      buttons.push(b);
      frag.appendChild(b);
    });
    $("choices").appendChild(frag);
  }

  function adjust(d) {
    state.health = clamp(state.health + (d.health || 0), 0, 3);
    state.rations = clamp(state.rations + (d.rations || 0), 0, 3);
    state.gold = clamp(state.gold + (d.gold || 0), 0, 4);
    state.morale = clamp(state.morale + (d.morale || 0), 0, 3);
    renderStats();
  }
  function isGameOver() { return state.health <= 0; }

  function win() {
    setSceneArt("win");
    setNarrative(tr(
      `SAN FRANCISCO AT LAST.\n\nThe bay glitters; tents and shanties climb every hill. You survived the Panama route — steamers, fever country, mule trails, and the long Pacific swell.\n\nTHE DIGGINGS AWAIT, ${state.name}.`,
      `SAN FRANCISCO AL FIN.\n\nLa bahia brilla; carpas y chozas cubren cada loma. Sobreviviste la ruta de Panama: vapores, fiebre, senderos de mulas y el largo oleaje del Pacifico.\n\nLOS YACIMIENTOS TE ESPERAN, ${state.name}.`
    ));
    clearChoices();
    showChoices([{ label: l10n().replay, action: () => startScreen() }]);
  }

  function lose(reason) {
    bgMusic.pause();
    loseMusic.currentTime = 0;
    loseMusic.muted = isMuted;
    loseMusic.play().catch(() => {
      // If playback is blocked, the loss state still proceeds.
    });
    setSceneArt("lose");
    setNarrative(tr("YOUR JOURNEY ENDS.\n\n", "TU VIAJE TERMINA.\n\n") + reason);
    clearChoices();
    showChoices([{ label: l10n().retry, action: () => startScreen() }]);
  }

  function advanceLeg() { state.legIndex = clamp(state.legIndex + 1, 0, l10n().legs.length - 1); renderStats(); }

  function sceneNy() {
    setSceneArt("ny");
    setNarrative(tr(
      `NEW YORK, BRIEFLY.\n\nYou secure passage and a kit, then hurry south. In 1849, Pacific Mail steamers begin to systematize the Panama route, offering a faster connection than Cape Horn for mail, passengers, and express.\n\nWhat do you prioritize before departure?`,
      `NUEVA YORK, DE PASO.\n\nAseguras pasaje y equipo, luego corres al sur. En 1849, los vapores de Pacific Mail empiezan a sistematizar la ruta de Panama, mas rapida que Cabo de Hornos para correo, pasajeros y encomiendas.\n\nQue priorizas antes de salir?`
    ));
    showChoices([
      { label: tr("Sturdy gear & a doctor's kit (−gold, +health)", "Equipo resistente y botiquin (−oro, +salud)"), action: () => { adjust({ gold: -1, health: 1 }); afterOutfit(); } },
      { label: tr("Extra hardtack & beef (−gold, +rations)", "Mas galleta y carne salada (−oro, +raciones)"), action: () => { adjust({ gold: -1, rations: 1 }); afterOutfit(); } },
      { label: tr("Cheap passage, keep coin (+gold, riskier)", "Pasaje barato, guardar moneda (+oro, mas riesgo)"), action: () => { adjust({ gold: 1, morale: -1 }); afterOutfit(); } },
    ]);
  }

  function afterOutfit() {
    if (isGameOver()) { lose(tr("You never left the dock — illness took you before the gangplank.", "Nunca saliste del muelle: la enfermedad te vencio antes de subir.")); return; }
    setSceneArt("atlanticBoarding");
    setNarrative(tr(
      `You board a crowded steamer bound south for the CHAGRES RIVER and Aspinwall (later Colon). The air is coal smoke, salt, and rumor of berths sold and resold in Panama City.\n\nThe captain warns: rough water off the river mouth, and "Panama fever" inland.`,
      `Subes a un vapor abarrotado rumbo al RIO CHAGRES y Aspinwall (luego Colon). El aire huele a carbon, sal y rumores de pasajes revendidos en Ciudad de Panama.\n\nEl capitan advierte: mar pesado cerca de la desembocadura y "fiebre de Panama" tierra adentro.`
    ));
    clearChoices();
    advanceLeg();
    showContinue(() => sceneAtlantic());
  }

  function sceneAtlantic() {
    const roll = Math.random();
    if (roll < 0.35) {
      setSceneArt("atlanticStorm");
      setNarrative(tr("COASTAL PASSAGE SOUTH — STORM.\n\nThe steamer bucks hard off Cuba and the Caribbean, but you keep your footing and push on toward Chagres.", "TRAMO COSTERO AL SUR — TORMENTA.\n\nEl vapor se sacude con fuerza frente a Cuba y el Caribe, pero aguantas y sigues hacia Chagres."));
      adjust({ rations: -1, morale: roll < 0.15 ? -1 : 0 });
    } else if (roll < 0.6) {
      setSceneArt("atlanticCalm");
      setNarrative(tr("COASTAL PASSAGE SOUTH — CALM.\n\nA steady run through Windward waters puts you quickly at the isthmus gateway used by the U.S. Mail Steamship Company and Pacific Mail packets.", "TRAMO COSTERO AL SUR — CALMA.\n\nUna travesia estable por aguas de Barlovento te deja rapido en la puerta del istmo usada por los vapores de U.S. Mail Steamship Company y Pacific Mail."));
      adjust({ morale: 1 });
    } else {
      setSceneArt("atlanticFever");
      setNarrative(tr("COASTAL PASSAGE SOUTH — FEVER SCARE.\n\nA sickness rumor spreads through steerage before landfall near Chagres.", "TRAMO COSTERO AL SUR — ALERTA DE FIEBRE.\n\nUn rumor de enfermedad se extiende por tercera antes de tocar tierra cerca de Chagres."));
      adjust({ health: -1, morale: 1 });
    }
    if (isGameOver()) { lose(tr("Fever and dehydration — you never saw the isthmus.", "Fiebre y deshidratacion: nunca viste el istmo.")); return; }
    clearChoices();
    advanceLeg();
    showContinue(() => sceneChagres());
  }

  function sceneChagres() {
    setSceneArt("chagres");
    setNarrative(tr(
      `CHAGRES.\n\nMangrove mud, bungos, and shouting boatmen. Here the route narrows into logistics: river craft to Gorgona and Cruces, then mule transit overland.\n\nFares shift by the hour, and every traveler races for a Pacific berth.`,
      `CHAGRES.\n\nLodo de manglar, bungos y lancheros gritando. Aqui la ruta se vuelve pura logistica: embarcaciones hasta Gorgona y Cruces, luego transito en mula por tierra.\n\nLas tarifas cambian por hora y todos corren por un camarote al Pacifico.`
    ));
    showChoices([
      { label: tr("Hire a reliable boatman (−gold, safer)", "Contratar lanchero fiable (−oro, mas seguro)"), action: () => { adjust({ gold: -1, health: 1 }); chagresAfter(); } },
      { label: tr("Barter tools for passage (no gold, −morale)", "Trueque de herramientas por pasaje (sin oro, −animo)"), action: () => { adjust({ morale: -1, rations: 1 }); chagresAfter(); } },
      { label: tr("Push upriver yourself (−rations, chance)", "Remontar por cuenta propia (−raciones, azar)"), action: () => { adjust({ rations: -1 }); if (Math.random() < 0.4) adjust({ health: -1 }); chagresAfter(); } },
    ]);
  }

  function chagresAfter() {
    if (isGameOver()) { lose(tr("The river took its toll — cholera or capsizing, histories disagree.", "El rio cobro su precio: colera o naufragio, la historia no se pone de acuerdo.")); return; }
    advanceLeg();
    sceneIsthmus();
  }

  function sceneIsthmus() {
    setSceneArt("isthmus");
    setNarrative(tr(
      `PANAMA TRAIL — MULES, MUD, AND RAIN.\n\nFrom Cruces and Gorgona, twenty-odd miles feel like two hundred. Mule trains jam the trail, bridges wash out, and stories of treasure-train robberies keep parties clustered for safety.`,
      `SENDERO DE PANAMA — MULAS, BARRO Y LLUVIA.\n\nDesde Cruces y Gorgona, unas veinte millas se sienten como doscientas. Las recuas bloquean el camino, se caen puentes, y los relatos de robos a trenes de tesoro hacen que los grupos viajen juntos.`
    ));
    showChoices([
      { label: tr("Pay for mules (−gold, +health)", "Pagar por mulas (−oro, +salud)"), action: () => { adjust({ gold: -1, health: 1 }); isthmusEnd(); } },
      { label: tr("March by night to avoid heat (−health, +morale)", "Marchar de noche para evitar calor (−salud, +animo)"), action: () => { adjust({ health: -1, morale: 1 }); isthmusEnd(); } },
      { label: tr("Stick with a U.S. mail party (steady)", "Ir con una partida de correo (estable)"), action: () => { adjust({ rations: -1, morale: 1 }); isthmusEnd(); } },
    ]);
  }

  function isthmusEnd() {
    if (isGameOver()) { lose(tr("Exhaustion and fever — the Pacific was in sight, but not for you.", "Agotamiento y fiebre: el Pacifico estaba a la vista, pero no para ti.")); return; }
    advanceLeg();
    sceneJungleSaloon();
  }

  function sceneJungleSaloon() {
    setSceneArt("panamaJungleSaloon");
    setNarrative(tr(
      `PANAMA SALOON — JUNGLE DEPOT.\n\nYour party reaches a muddy clearing where a two-story shack advertises itself as the PANAMA SALOON and "GOLD RUSH DEPOT: SUPPLIES, MULES & BEDS." Posts point the way: CHAGRES RIVER TERMINUS and MULES TO PANAMA CITY. Bungos slide past on brown water; pack mules file through the trees while macaws screech overhead.\n\nInside, fiddles scrape, cards slap, and whiskey flows. Do you join the debauchery or keep your head clear for the final push?`,
      `PANAMA SALOON — DEPOSITO EN LA SELVA.\n\nTu grupo llega a un claro embarrado donde un caseron de dos pisos se anuncia como PANAMA SALOON y "DEPOSITO DE LA FIEBRE DEL ORO: SUMINISTROS, MULAS Y CAMAS." Postes indican TERMINO DEL RIO CHAGRES y MULAS A CIUDAD DE PANAMA. Los bungos pasan por aguas marrones; las mulas de carga serpentean entre los arboles mientras chillan las guacamayas arriba.\n\nAdentro suenan violines, cartas y whisky. Te unes al desenfreno o mantienes la cabeza fria para el ultimo tramo?`
    ));
    showChoices([
      {
        label: tr("Join the debauchery (chance of big swing)", "Unirse al desenfreno (posible gran cambio)"),
        action: () => {
          if (Math.random() < 0.5) {
            adjust({ morale: 1, gold: 1, rations: -1 });
            setNarrative($("narrative").textContent + tr("\n\nYour luck holds: you stumble out past the mule string, louder and lighter on food, but with a fatter purse and ready to face the plaza.", "\n\nLa suerte acompana: sales tambaleandote junto a la recua, mas animado y con menos comida, pero con la bolsa mas llena y listo para la plaza."));
          } else {
            adjust({ health: -1, morale: -1, gold: -1 });
            setNarrative($("narrative").textContent + tr("\n\nThe depot swallows your coin. A bad bottle, worse cards, and the humid yard leave you sickly while the river traffic and shouting lancheros drown out your excuses.", "\n\nEl deposito te vacia la bolsa. Mala botella, peores cartas y el patio humedo te dejan enfermizo mientras el rio y los lancheros ahogan tus excusas."));
          }
          jungleSaloonEnd();
        },
      },
      {
        label: tr("Skip it and rest quietly (+health, -morale)", "Evitarlo y descansar tranquilo (+salud, -animo)"),
        action: () => {
          adjust({ health: 1, morale: -1 });
          jungleSaloonEnd();
        },
      },
    ]);
  }

  function jungleSaloonEnd() {
    if (isGameOver()) { lose(tr("The saloon stop finished your strength before Panama City.", "La parada del saloon acabo con tus fuerzas antes de Ciudad de Panama.")); return; }
    advanceLeg();
    scenePanamaCity();
  }

  function scenePanamaCity() {
    setSceneArt("panamaPlaza");
    setNarrative(tr(
      `PANAMA CITY PLAZA.\n\nCathedral bells, brokers, muleteers, and ship agents all shout at once. Cholera bulletins hang beside berth auctions. Before the 1855 Panama Railroad, waits here could stretch for weeks, with ticket speculation rising by the day.\n\nHow do you handle the layover?`,
      `PLAZA DE CIUDAD DE PANAMA.\n\nCampanas, corredores, arrieros y agentes navieros gritan a la vez. Los avisos de colera cuelgan junto a las subastas de camarotes. Antes del Ferrocarril de Panama de 1855, las esperas aqui podian durar semanas, con especulacion de boletos cada dia.\n\nComo manejas la escala?`
    ));
    showChoices([
      { label: tr("Pay for guarded lodging (−gold, +health)", "Pagar hospedaje con guardia (−oro, +salud)"), action: () => { adjust({ gold: -1, health: 1 }); panamaCityEnd(); } },
      { label: tr("Sleep near the docks (+gold, risk illness)", "Dormir cerca del muelle (+oro, riesgo de enfermedad)"), action: () => { adjust({ gold: 1 }); if (Math.random() < 0.45) adjust({ health: -1, morale: -1 }); panamaCityEnd(); } },
      { label: tr("Take odd jobs while waiting (+gold, +rations, -morale)", "Tomar trabajos mientras esperas (+oro, +raciones, -animo)"), action: () => { adjust({ gold: 1, rations: 1, morale: -1 }); panamaCityEnd(); } },
    ]);
  }

  function panamaCityEnd() {
    if (isGameOver()) { lose(tr("Your strength failed in Panama City before you could sail north.", "Tus fuerzas fallaron en Ciudad de Panama antes de zarpar al norte.")); return; }
    advanceLeg();
    scenePacific();
  }

  function scenePacific() {
    const storm = Math.random() < 0.3;
    if (storm) {
      setSceneArt("pacificStorm");
      setNarrative(tr("PACIFIC LEG — HARD WEATHER.\n\nYou clear Panama Bay and climb the coast into a rough northbound blow. Every lost hour means more rivals in the diggings.", "TRAMO DEL PACIFICO — MAL TIEMPO.\n\nDejas la bahia de Panama y subes por la costa con un duro temporal al norte. Cada hora perdida significa mas rivales en los yacimientos."));
      adjust({ health: -1, morale: 1 });
    } else {
      setSceneArt("pacificCalm");
      setNarrative(tr("PACIFIC LEG — CLEAN RUN.\n\nAfter the isthmus gauntlet, open water feels almost easy. The fastest Pacific steamers can cover this leg in roughly twelve to fourteen days, in the wake of Pacific Mail's early SS California run.", "TRAMO DEL PACIFICO — TRAVESIA LIMPIA.\n\nDespues del istmo, el mar abierto casi se siente facil. Los vapores mas rapidos del Pacifico pueden cubrir este tramo en unas doce a catorce dias, siguiendo la estela de la temprana travesia del SS California de Pacific Mail."));
      adjust({ rations: 1 });
    }
    if (state.rations <= 0 && Math.random() < 0.5) {
      adjust({ health: -1 });
      setNarrative($("narrative").textContent + tr("\n\nRations run thin; ship's biscuit is weevily. You tighten your belt.", "\n\nLas raciones escasean; la galleta del barco tiene gorgojos. Te ajustas el cinturon."));
    }
    if (isGameOver()) { lose(tr("The long ocean crossing finished what the jungle started.", "La larga travesia oceanica termino lo que la selva habia empezado.")); return; }
    advanceLeg();
    showContinue(() => sceneSfArrival());
  }

  function sceneSfArrival() {
    if (state.legIndex < l10n().legs.length - 1) state.legIndex = l10n().legs.length - 1;
    renderStats();
    const rich = state.gold >= 3;
    setSceneArt("sf");
    setNarrative(tr(
      `SAN FRANCISCO, AT LAST.\n\nShips pack the cove. ${rich ? "You still have enough coin to start well.\n\n" : "Your purse is light after Panama tolls and berth prices.\n\n"}You crossed the corridor worked by Pacific Mail and the U.S. Mail Steamship Company, carrying mail, passengers, and Sierra gold eastward for two decades.`,
      `SAN FRANCISCO, AL FIN.\n\nLos barcos llenan la ensenada. ${rich ? "Aun tienes moneda suficiente para empezar bien.\n\n" : "Tu bolsa llega ligera tras peajes y pasajes de Panama.\n\n"}Cruzaste el corredor operado por Pacific Mail y U.S. Mail Steamship Company, que por dos decadas movio correo, pasajeros y oro de la Sierra hacia el este.`
    ));
    clearChoices();
    showContinue(() => win());
  }

  function runCurrentLeg() {
    renderStats();
    switch (currentLeg().id) {
      case "ny": sceneNy(); break;
      case "atlantic": sceneAtlantic(); break;
      case "chagres": sceneChagres(); break;
      case "isthmus": sceneIsthmus(); break;
      case "saloon": sceneJungleSaloon(); break;
      case "panamaCity": scenePanamaCity(); break;
      case "pacific": scenePacific(); break;
      case "sf": sceneSfArrival(); break;
      default: sceneNy();
    }
  }

  function startGame(name) {
    tryStartMusic();
    state = freshState(name.trim().toUpperCase() || "PROSPECTOR");
    state.legIndex = 0;
    renderStats();
    runCurrentLeg();
  }

  function startScreen() {
    state = freshState("");
    state.legIndex = 0;
    applyFrameTranslations();
    renderStats();
    setSceneArt("start");
    setNarrative(tr(
      `CHARACTER PROFILE: YOU\n\nOCCUPATION: GOLD RUSH PROSPECTOR\nROUTE: PANAMA TRANSIT TO CALIFORNIA\nDATE: 1849\n\nChoose language, enter your name (letters only, or leave blank for "PROSPECTOR"), then begin a documentary-style run through the Panama route.`,
      `PERFIL DEL PERSONAJE: TU\n\nOCUPACION: BUSCADOR DE ORO\nRUTA: TRANSITO POR PANAMA HACIA CALIFORNIA\nFECHA: 1849\n\nElige idioma, escribe tu nombre (solo letras, o deja en blanco para "PROSPECTOR"), y comienza una partida con tono documental por la ruta de Panama.`
    ));
    clearChoices();

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "10px";

    const langLabel = document.createElement("div");
    langLabel.textContent = l10n().languageLabel;
    langLabel.style.fontSize = "8px";
    const langWrap = document.createElement("div");
    langWrap.style.display = "flex";
    langWrap.style.gap = "8px";

    function makeLangBtn(langKey) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.textContent = l10n().languageChoices[langKey];
      btn.style.opacity = currentLanguage === langKey ? "1" : "0.6";
      btn.addEventListener("click", () => {
        currentLanguage = langKey;
        startScreen();
      });
      return btn;
    }
    langWrap.appendChild(makeLangBtn(LANGUAGE.en));
    langWrap.appendChild(makeLangBtn(LANGUAGE.es));

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 16;
    input.placeholder = l10n().namePlaceholder;
    input.style.fontFamily = "inherit";
    input.style.fontSize = "9px";
    input.style.padding = "10px";
    input.style.border = "3px solid #1a120c";
    input.setAttribute("aria-label", l10n().nameAria);

    const go = document.createElement("button");
    go.type = "button";
    go.className = "choice-btn";
    go.textContent = l10n().beginJourney;
    function begin() {
      const raw = input.value.replace(/[^a-zA-Z ]/g, "").slice(0, 16);
      startGame(raw);
    }
    go.addEventListener("click", begin);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); begin(); } });

    wrap.appendChild(langLabel);
    wrap.appendChild(langWrap);
    wrap.appendChild(input);
    wrap.appendChild(go);
    $("choices").appendChild(wrap);
    input.focus();
  }

  startScreen();
})();
