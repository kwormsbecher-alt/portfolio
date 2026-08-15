/* ═══════════════════════════════════════════════════════════
   main.js — Menü, Scroll-Effekte, Termin-Mail.
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* Sagt dem CSS, dass JavaScript läuft. Erst dann werden Abschnitte
   für die Einblende-Animation unsichtbar gemacht. Läuft dieses Skript
   nicht, bleibt die Seite ganz normal lesbar. */
document.documentElement.classList.add('js');


/* ───────────────────────────────────────────────────────────
   1. KONTAKT — die einzige Stelle, an der die Mailadresse steht.

   Wenn du später eine echte Adresse hast: nur EMAIL ändern.
   Jeder Termin-Knopf auf jeder Seite zieht automatisch mit.
   ─────────────────────────────────────────────────────────── */

const KONTAKT = {

  // TODO vor dem Launch ersetzen:
  EMAIL: 'platzhalter@beispiel.de',

  BETREFF: 'Anfrage Website',

  TEXT: [
    'Hallo,',
    '',
    'ich interessiere mich für eine neue Website.',
    '',
    'Mein Betrieb:',
    'Was ich vorhabe:',
    'So erreichst du mich am besten:',
    '',
    'Viele Grüße'
  ].join('\n')

};

/** Baut den fertigen mailto-Link zusammen. */
function mailtoLink() {
  return 'mailto:' + KONTAKT.EMAIL
    + '?subject=' + encodeURIComponent(KONTAKT.BETREFF)
    + '&body='    + encodeURIComponent(KONTAKT.TEXT);
}

/**
 * Trägt Adresse und Link überall dort ein, wo im HTML
 * data-mail="link" bzw. data-mail="text" steht.
 */
function kontaktEintragen() {
  document.querySelectorAll('[data-mail="link"]').forEach(function (el) {
    el.setAttribute('href', mailtoLink());
  });
  document.querySelectorAll('[data-mail="text"]').forEach(function (el) {
    el.textContent = KONTAKT.EMAIL;
  });
}


/* ───────────────────────────────────────────────────────────
   2. KOPFLEISTE — Hamburger-Menü und Schrumpfen beim Scrollen
   ─────────────────────────────────────────────────────────── */

function navAufsetzen() {
  const nav    = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!nav) return;

  /* Schatten und kleinere Höhe, sobald man scrollt */
  function scrollZustand() {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }
  scrollZustand();
  window.addEventListener('scroll', scrollZustand, { passive: true });

  if (!toggle) return;

  function menuSchliessen() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    const offen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(offen));
  });

  /* Nach einem Klick auf einen Menüpunkt zuklappen */
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', menuSchliessen);
  });

  /* Escape schließt das Menü */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      menuSchliessen();
      toggle.focus();
    }
  });

  /* Beim Wechsel auf Desktop-Breite aufräumen.
     Muss zum Umschaltpunkt in styles.css passen (dort max-width: 1040px). */
  window.matchMedia('(min-width: 1041px)').addEventListener('change', function (e) {
    if (e.matches) menuSchliessen();
  });
}


/* ───────────────────────────────────────────────────────────
   2b. KOPFLEISTE BEIM SCROLLEN

   Nach unten: die Menüpunkte fahren in den Termin-Knopf ein.
   Nach oben: sie kommen bewusst nicht sofort zurück, sondern erst,
   wenn man einen neuen Block anschneidet.
   Auf dem Handy verschwindet stattdessen das Logo und der Haus-Knopf
   unten rechts taucht auf.
   ─────────────────────────────────────────────────────────── */

function kopfleisteVerwandelnAufsetzen() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const heim = document.querySelector('.heim-knopf');
  const hero = document.getElementById('willkommen');
  const abschnitte = Array.prototype.slice.call(
    document.querySelectorAll('main section[id]')
  );

  let letzteHoehe = window.scrollY;
  let letzterBlock = 0;
  let letzterLauf = 0;
  let nachzuegler = null;

  /* Welcher Block steht gerade oben an? */
  function aktuellerBlock() {
    const grenze = nav.getBoundingClientRect().height + 8;
    let index = 0;
    abschnitte.forEach(function (abschnitt, i) {
      if (abschnitt.getBoundingClientRect().top <= grenze) index = i;
    });
    return index;
  }

  function pruefen() {
    const hoehe = window.scrollY;
    const geht_runter = hoehe > letzteHoehe;
    const block = aktuellerBlock();

    /* Landing-Bereich durch? */
    const heroDurch = hero ? hero.getBoundingClientRect().bottom <= 80 : hoehe > 400;
    nav.classList.toggle('hat-hero-verlassen', heroDurch);
    if (heim) heim.classList.toggle('ist-sichtbar', heroDurch);

    if (hoehe <= 140) {
      nav.classList.remove('ist-eingeklappt');
    } else if (geht_runter) {
      nav.classList.add('ist-eingeklappt');
    } else if (block < letzterBlock) {
      /* Beim Hochscrollen erst beim nächsten Block wieder ausfahren */
      nav.classList.remove('ist-eingeklappt');
    }

    letzterBlock = block;
    letzteHoehe = hoehe;
  }

  /* Höchstens alle 60 ms rechnen, aber am Ende einer Scroll-Bewegung
     auf jeden Fall noch einmal — sonst bliebe der Zustand hängen. */
  window.addEventListener('scroll', function () {
    const jetzt = Date.now();
    if (jetzt - letzterLauf >= 60) {
      letzterLauf = jetzt;
      pruefen();
      return;
    }
    if (nachzuegler) return;
    nachzuegler = window.setTimeout(function () {
      nachzuegler = null;
      letzterLauf = Date.now();
      pruefen();
    }, 60);
  }, { passive: true });

  pruefen();
}


/* ───────────────────────────────────────────────────────────
   3. AKTIVER MENÜPUNKT — hebt hervor, wo man gerade ist
   ─────────────────────────────────────────────────────────── */

function aktivenMenuepunktVerfolgen() {
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const zuordnung = new Map();
  links.forEach(function (link) {
    const ziel = document.querySelector(link.getAttribute('href'));
    if (ziel) zuordnung.set(ziel, link);
  });

  const beobachter = new IntersectionObserver(function (eintraege) {
    eintraege.forEach(function (eintrag) {
      if (!eintrag.isIntersecting) return;
      links.forEach(function (l) { l.classList.remove('is-active'); });
      const link = zuordnung.get(eintrag.target);
      if (link) link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  zuordnung.forEach(function (_link, ziel) { beobachter.observe(ziel); });
}


/* ───────────────────────────────────────────────────────────
   4. EINBLENDEN BEIM SCROLLEN
   ─────────────────────────────────────────────────────────── */

function einblendenAufsetzen() {
  const elemente = document.querySelectorAll('.reveal');
  if (!elemente.length) return;

  const ruhigerModus = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (ruhigerModus || !('IntersectionObserver' in window)) {
    elemente.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const beobachter = new IntersectionObserver(function (eintraege, selbst) {
    eintraege.forEach(function (eintrag) {
      if (!eintrag.isIntersecting) return;
      eintrag.target.classList.add('is-visible');
      selbst.unobserve(eintrag.target);   /* einmal reicht */
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elemente.forEach(function (el) { beobachter.observe(el); });

  /* Notbremse: Sollte der Beobachter aus irgendeinem Grund nicht
     auslösen, wird nach 2 Sekunden trotzdem alles sichtbar.
     Lieber ohne Animation als eine leere Seite. */
  window.setTimeout(function () {
    elemente.forEach(function (el) { el.classList.add('is-visible'); });
  }, 2000);
}


/* ───────────────────────────────────────────────────────────
   4b. AUSWAHLGALERIE — links wählen, rechts das Detailfenster

   Aufgebaut als echte Reiter. Maus, Tastatur und Screenreader
   funktionieren damit gleichermaßen: Pfeiltasten blättern durch,
   Pos1 und Ende springen an den Anfang bzw. ans Ende.
   ─────────────────────────────────────────────────────────── */

function auswahlAufsetzen() {
  document.querySelectorAll('[role="tablist"]').forEach(function (liste) {

    const knoepfe = Array.prototype.slice.call(
      liste.querySelectorAll('[role="tab"]')
    );
    if (!knoepfe.length) return;

    /* Unter 940px erscheint das Detail als Pop-up-Fenster über der
       Seite — kein neuer Tab. <dialog> bringt Escape-Taste und
       Tastaturfalle schon mit. Kann der Browser das nicht, fällt es
       auf das alte Hinscrollen zurück. */
    const fenster = document.querySelector('.auswahl-fenster');
    const alsFenster = window.matchMedia('(max-width: 939px)');
    const kannFenster = !!(fenster && typeof fenster.showModal === 'function');

    if (fenster) {
      const zuKnopf = fenster.querySelector('[data-fenster-zu]');
      if (zuKnopf) zuKnopf.addEventListener('click', function () { fenster.close(); });

      /* Klick auf den abgedunkelten Rand schließt ebenfalls */
      fenster.addEventListener('click', function (e) {
        if (e.target === fenster) fenster.close();
      });

      /* Wird das Fenster zur Desktop-Breite hin überflüssig, zu damit */
      alsFenster.addEventListener('change', function (e) {
        if (!e.matches && fenster.open) fenster.close();
      });
    }

    function waehlen(knopf, fokussieren, hinscrollen) {
      let aktivesFeld = null;

      knoepfe.forEach(function (k) {
        const gewaehlt = (k === knopf);
        k.setAttribute('aria-selected', String(gewaehlt));
        /* Nur der gewählte Reiter ist mit Tab erreichbar — innerhalb
           der Gruppe blättert man mit den Pfeiltasten. */
        k.tabIndex = gewaehlt ? 0 : -1;

        const feld = document.getElementById(k.getAttribute('aria-controls'));
        if (!feld) return;
        feld.classList.toggle('is-aktiv', gewaehlt);
        feld.hidden = !gewaehlt;
        if (gewaehlt) aktivesFeld = feld;
      });

      if (fokussieren) knopf.focus();

      /* Auf schmalen Schirmen aufklappen: als Fenster, wenn der Browser
         <dialog> kann — sonst zum Detail hinscrollen. Ohne beides tippt
         man auf einen Reiter und sieht scheinbar nichts passieren, weil
         das Detail unter allen vier Reitern außerhalb des Bildes liegt. */
      if (!hinscrollen || !aktivesFeld || !alsFenster.matches) return;

      if (kannFenster) {
        if (!fenster.open) {
          try { fenster.showModal(); } catch (mist) { /* dann eben nicht */ }
        }
        return;
      }

      const kopf = document.querySelector('.nav');
      const abstand = (kopf ? kopf.getBoundingClientRect().height : 0) + 16;
      const ziel = aktivesFeld.getBoundingClientRect().top + window.scrollY - abstand;
      const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: ziel, behavior: ruhig ? 'auto' : 'smooth' });
    }

    knoepfe.forEach(function (knopf) {
      knopf.addEventListener('click', function () { waehlen(knopf, false, true); });
    });

    liste.addEventListener('keydown', function (e) {
      const jetzt = knoepfe.indexOf(document.activeElement);
      if (jetzt === -1) return;

      let ziel = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') ziel = (jetzt + 1) % knoepfe.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ziel = (jetzt - 1 + knoepfe.length) % knoepfe.length;
      else if (e.key === 'Home') ziel = 0;
      else if (e.key === 'End')  ziel = knoepfe.length - 1;
      else return;

      e.preventDefault();
      waehlen(knoepfe[ziel], true);
    });

  });
}


/* ───────────────────────────────────────────────────────────
   4bb. MEMORY

   Fünf Paare, zehn Karten — genauso viele Felder wie das Spielfeld
   hat. Die ganze Seite wird weiß, übrig bleiben nur die Karten.
   Gestartet wird durch Schütteln eines Bausteins (siehe unten) oder
   über den Knopf unter dem Spielfeld.
   ─────────────────────────────────────────────────────────── */

/* Wird beim Start gesetzt und vom Spielfeld aus aufgerufen. */
let memoryStarten = null;

function memoryAufsetzen() {
  const fenster = document.querySelector('.memory');
  if (!fenster || typeof fenster.showModal !== 'function') return null;

  const brett    = fenster.querySelector('[data-memory-brett]');
  const anzeige  = fenster.querySelector('[data-memory-punkte]');
  const fertig   = fenster.querySelector('[data-memory-fertig]');
  const zuKnopf  = fenster.querySelector('[data-memory-zu]');
  if (!brett || !anzeige) return null;

  /* Platzhalter — später gegen Symbole aus Kevins Welt tauschen. */
  const MOTIVE = ['🕐', '👥', '📅', '📍', '⭐'];

  let offen = [];
  let gefunden = 0;
  let sperre = false;
  let merkeScroll = 0;

  function mischen(liste) {
    const kopie = liste.slice();
    for (let i = kopie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const zwischen = kopie[i]; kopie[i] = kopie[j]; kopie[j] = zwischen;
    }
    return kopie;
  }

  function bauen() {
    brett.innerHTML = '';
    offen = [];
    gefunden = 0;
    sperre = false;
    anzeige.textContent = '0';
    if (fertig) fertig.hidden = true;

    mischen(MOTIVE.concat(MOTIVE)).forEach(function (motiv, i) {
      const karte = document.createElement('button');
      karte.type = 'button';
      karte.className = 'memory-karte';
      karte.dataset.motiv = motiv;
      karte.setAttribute('aria-label', 'Karte ' + (i + 1) + ', verdeckt');
      karte.innerHTML =
        '<span class="memory-innen">' +
          '<span class="memory-seite memory-ruecken" aria-hidden="true"></span>' +
          '<span class="memory-seite memory-vorne" aria-hidden="true">' + motiv + '</span>' +
        '</span>';
      karte.addEventListener('click', function () { aufdecken(karte); });
      brett.appendChild(karte);
    });
  }

  function aufdecken(karte) {
    if (sperre) return;
    if (karte.classList.contains('ist-offen')) return;
    if (karte.classList.contains('ist-weg')) return;

    karte.classList.add('ist-offen');
    karte.setAttribute('aria-label', 'Karte zeigt ' + karte.dataset.motiv);
    offen.push(karte);
    if (offen.length < 2) return;

    sperre = true;
    const erste = offen[0];
    const zweite = offen[1];

    if (erste.dataset.motiv === zweite.dataset.motiv) {
      window.setTimeout(function () {
        erste.classList.add('ist-weg');
        zweite.classList.add('ist-weg');
        erste.disabled = true;
        zweite.disabled = true;
        gefunden += 1;
        anzeige.textContent = String(gefunden);
        offen = [];
        sperre = false;
        if (gefunden === MOTIVE.length) gewonnen();
      }, 480);
    } else {
      window.setTimeout(function () {
        erste.classList.remove('ist-offen');
        zweite.classList.remove('ist-offen');
        erste.setAttribute('aria-label', 'Karte, verdeckt');
        zweite.setAttribute('aria-label', 'Karte, verdeckt');
        offen = [];
        sperre = false;
      }, 850);
    }
  }

  function gewonnen() {
    if (fertig) fertig.hidden = false;
    window.setTimeout(function () {
      if (fenster.open) fenster.close();
    }, 1700);
  }

  /* Zurück an die Stelle, an der man vorher war */
  fenster.addEventListener('close', function () {
    window.scrollTo({ top: merkeScroll, behavior: 'instant' });
  });
  if (zuKnopf) {
    zuKnopf.addEventListener('click', function () {
      if (fenster.open) fenster.close();
    });
  }

  /* Nur in der Web-Ansicht. Auf dem Handy wäre das Brett winzig und
     das Schütteln würde sich mit dem Scrollen in die Quere kommen.
     Der Wert muss zu ".nur-web" in styles.css passen. */
  const nurWeb = window.matchMedia('(min-width: 1041px)');

  return function starten() {
    if (!nurWeb.matches) return;
    if (fenster.open) return;
    merkeScroll = window.scrollY;
    bauen();
    try { fenster.showModal(); } catch (fehler) { /* dann eben nicht */ }
  };
}


/* ───────────────────────────────────────────────────────────
   4c. SPIELFELD — die Bausteine lassen sich herumschieben

   Der Kniff: Erst wird das ganz normale Raster ausgemessen, dann
   werden die Kacheln genau an dieser Stelle festgenagelt. Das Bild
   bleibt dadurch exakt gleich, die Kacheln sind aber ab jetzt frei
   beweglich — und bei einer Größenänderung wird neu gerechnet.

   Nur ab 720 px Breite. Auf dem Handy füllt eine Kachel die ganze
   Breite; würde man dort ziehen können, käme man nicht mehr am
   Abschnitt vorbei zum Weiterscrollen.
   ─────────────────────────────────────────────────────────── */

function spielfeldAufsetzen() {
  const feld = document.querySelector('.spielfeld');
  if (!feld) return;

  const liste  = feld.querySelector('.bausteine');
  const karten = Array.prototype.slice.call(feld.querySelectorAll('.baustein'));
  const luecke = feld.querySelector('.luecke');
  if (!liste || !karten.length) return;

  /* Alle Felder des Rasters — die Steine plus das eine freie. */
  const felder = karten.concat(luecke ? [luecke] : []);

  let obenauf = 10;

  /* Wie lange man auf dem Handy draufbleiben muss, damit aus dem
     Berühren ein Ziehen wird. Darunter bleibt es ein Wischen und die
     Seite scrollt ganz normal weiter. */
  const HALTEDAUER = 260;
  const WACKELWEG  = 12;

  /* Die Plätze aus dem ursprünglichen Raster und wer gerade wo liegt */
  let plaetze = [];
  const platzVon = new Map();

  function zurueckInsRaster() {
    feld.classList.remove('ist-spielbar');
    liste.style.height = '';
    felder.forEach(function (k) {
      k.style.left = ''; k.style.top = '';
      k.style.width = ''; k.style.height = ''; k.style.zIndex = '';
    });
  }

  function setzen(element, platzIndex, mitGleiten) {
    const p = plaetze[platzIndex];
    if (!p) return;
    if (mitGleiten) {
      element.classList.add('rastet-ein');
      window.setTimeout(function () { element.classList.remove('rastet-ein'); }, 420);
    }
    element.style.width  = p.breite + 'px';
    element.style.height = p.hoehe  + 'px';
    element.style.left   = p.x + 'px';
    element.style.top    = p.y + 'px';
  }

  /* Die gestrichelte Markierung wandert auf das Feld, das gerade
     niemand belegt — so sieht man immer, wohin man schieben kann. */
  function lueckeNachziehen(mitGleiten) {
    if (!luecke) return;
    const belegt = new Set();
    platzVon.forEach(function (index) { belegt.add(index); });
    for (let i = 0; i < plaetze.length; i++) {
      if (!belegt.has(i)) { setzen(luecke, i, mitGleiten); return; }
    }
  }

  function anordnen(zweiterVersuch) {
    /* Übergänge stilllegen, sonst werden Zwischenwerte abgelesen */
    feld.classList.add('misst');
    felder.forEach(function (k) { k.classList.remove('rastet-ein'); });

    zurueckInsRaster();
    plaetze = [];
    platzVon.clear();

    /* Maße aus dem normalen Raster ablesen. Die Höhe kommt mit, weil
       Rasterzellen sich auf Zeilenhöhe strecken — ohne sie würden die
       Kacheln beim Festnageln zusammenschnurren. */
    const rahmen = liste.getBoundingClientRect();
    plaetze = felder.map(function (k) {
      const r = k.getBoundingClientRect();
      return { x: r.left - rahmen.left, y: r.top - rahmen.top, breite: r.width, hoehe: r.height };
    });
    const gesamthoehe = liste.offsetHeight;

    /* Notbremse: Passt irgendein Feld rechnerisch nicht in den Rahmen,
       wurde mitten in einer Größenänderung gemessen. Dann einmal auf
       das nächste Bild warten und neu rechnen. */
    const passtNicht = plaetze.some(function (p) {
      return p.x + p.breite > rahmen.width + 2;
    });
    if (passtNicht && !zweiterVersuch) {
      feld.classList.remove('misst');
      window.requestAnimationFrame(function () { anordnen(true); });
      return;
    }

    liste.style.height = gesamthoehe + 'px';
    feld.classList.add('ist-spielbar');
    karten.forEach(function (k, i) {
      platzVon.set(k, i);
      setzen(k, i, false);
    });
    lueckeNachziehen(false);

    /* Erst im nächsten Bild wieder freigeben, damit das Setzen oben
       nicht doch noch animiert wird. */
    window.requestAnimationFrame(function () { feld.classList.remove('misst'); });
  }

  /* Nächstgelegenes Feld. Alle Steine sind gleich groß, also passt
     jeder auf jedes Feld — es gelten für alle dieselben Regeln. */
  function naechstesFeld(karte) {
    const eigener = plaetze[platzVon.get(karte)];
    if (!eigener) return null;

    const mx = (parseFloat(karte.style.left) || 0) + eigener.breite / 2;
    const my = (parseFloat(karte.style.top)  || 0) + eigener.hoehe  / 2;

    let besterIndex = platzVon.get(karte);
    let kuerzeste = Infinity;
    plaetze.forEach(function (p, i) {
      const dx = (p.x + p.breite / 2) - mx;
      const dy = (p.y + p.hoehe  / 2) - my;
      const abstand = dx * dx + dy * dy;
      if (abstand < kuerzeste) { kuerzeste = abstand; besterIndex = i; }
    });
    return besterIndex;
  }

  function einrasten(karte) {
    const von = platzVon.get(karte);
    const nach = naechstesFeld(karte);
    if (nach === null || nach === von) { setzen(karte, von, true); return; }

    /* Liegt dort ein Stein, tauschen die beiden. Ist das Feld die
       Lücke, rutscht der Stein einfach hinein und die Lücke wandert
       auf den frei gewordenen Platz. */
    let andere = null;
    platzVon.forEach(function (index, k) { if (index === nach) andere = k; });

    platzVon.set(karte, nach);
    setzen(karte, nach, true);

    if (andere) {
      platzVon.set(andere, von);
      setzen(andere, von, true);
    }
    lueckeNachziehen(true);
  }

  function ziehenAufsetzen(karte) {
    let greifX = 0, greifY = 0;
    let startX = 0, startY = 0;
    let aktiv = false;
    let halteUhr = null;

    /* Schütteln erkennen: Richtungswechsel nach links und rechts
       zählen. Sieben Wechsel dicht hintereinander starten Memory.
       Normales Verschieben hat höchstens ein bis zwei Wechsel. */
    let letzteX = 0, richtung = 0, wechsel = 0, letzterWechsel = 0;

    function schuettelnPruefen(e) {
      const dx = e.clientX - letzteX;
      if (Math.abs(dx) < 6) return false;

      const neueRichtung = dx > 0 ? 1 : -1;
      if (richtung !== 0 && neueRichtung !== richtung) {
        const jetzt = Date.now();
        if (jetzt - letzterWechsel > 900) wechsel = 0;   /* zu lange her */
        wechsel += 1;
        letzterWechsel = jetzt;
        karte.classList.toggle('wackelt', wechsel >= 3);

        if (wechsel >= 7 && typeof memoryStarten === 'function') {
          wechsel = 0;
          karte.classList.remove('wackelt');
          return true;
        }
      }
      richtung = neueRichtung;
      letzteX = e.clientX;
      return false;
    }

    function uhrStoppen() {
      if (halteUhr) { window.clearTimeout(halteUhr); halteUhr = null; }
      karte.classList.remove('wird-scharf');
    }

    function anheben(zeigerId) {
      uhrStoppen();
      aktiv = true;
      obenauf += 1;
      karte.style.zIndex = String(obenauf);
      karte.classList.add('wird-gezogen');
      /* Ohne Einfangen würde die Karte am Zeiger kleben bleiben,
         sobald man ihn zu schnell aus der Kachel herauszieht.
         Verweigert der Browser es, ziehen wir trotzdem weiter. */
      try { karte.setPointerCapture(zeigerId); } catch (fehler) { /* egal */ }
    }

    karte.addEventListener('pointerdown', function (e) {
      if (!feld.classList.contains('ist-spielbar')) return;
      if (e.button > 0) return;                     /* nur linke Maustaste */

      const r = karte.getBoundingClientRect();      /* vor dem Anheben messen */
      greifX = e.clientX - r.left;
      greifY = e.clientY - r.top;
      startX = e.clientX;
      startY = e.clientY;
      letzteX = e.clientX;
      richtung = 0;
      wechsel = 0;

      if (e.pointerType === 'touch') {
        /* Mit dem Finger erst nach kurzem Halten. Wischt jemand nur
           schnell durch, bleibt es beim normalen Scrollen. */
        karte.classList.add('wird-scharf');
        halteUhr = window.setTimeout(function () {
          anheben(e.pointerId);
          if (navigator.vibrate) navigator.vibrate(10);
        }, HALTEDAUER);
      } else {
        anheben(e.pointerId);
        e.preventDefault();
      }
    });

    /* Solange gezogen wird, darf der Browser nicht mitscrollen.
       Muss passive:false sein, sonst wird preventDefault ignoriert. */
    karte.addEventListener('touchmove', function (e) {
      if (aktiv) e.preventDefault();
    }, { passive: false });

    karte.addEventListener('pointermove', function (e) {
      if (!aktiv) {
        /* Noch in der Wartezeit: Bewegt sich der Finger, war es ein
           Wischen — dann Ziehen abblasen und weiterscrollen lassen. */
        if (halteUhr &&
            (Math.abs(e.clientX - startX) > WACKELWEG ||
             Math.abs(e.clientY - startY) > WACKELWEG)) {
          uhrStoppen();
        }
        return;
      }

      /* Genug geschüttelt? Dann Ziehen sauber beenden und Memory
         starten — sonst klebte die Karte am Zeiger. */
      if (schuettelnPruefen(e)) {
        aktiv = false;
        karte.classList.remove('wird-gezogen');
        try {
          if (karte.hasPointerCapture(e.pointerId)) karte.releasePointerCapture(e.pointerId);
        } catch (fehler) { /* egal */ }
        einrasten(karte);
        memoryStarten();
        return;
      }

      const rahmen = liste.getBoundingClientRect();
      let x = e.clientX - rahmen.left - greifX;
      let y = e.clientY - rahmen.top  - greifY;

      /* im Rahmen bleiben */
      x = Math.max(0, Math.min(x, rahmen.width  - karte.offsetWidth));
      y = Math.max(0, Math.min(y, rahmen.height - karte.offsetHeight));

      karte.style.left = x + 'px';
      karte.style.top  = y + 'px';
    });

    function loslassen(e) {
      uhrStoppen();
      karte.classList.remove('wackelt');
      wechsel = 0;
      if (!aktiv) return;
      aktiv = false;
      karte.classList.remove('wird-gezogen');
      try {
        if (karte.hasPointerCapture(e.pointerId)) karte.releasePointerCapture(e.pointerId);
      } catch (fehler) { /* egal */ }
      einrasten(karte);
    }
    karte.addEventListener('pointerup', loslassen);
    karte.addEventListener('pointercancel', loslassen);
  }

  karten.forEach(ziehenAufsetzen);

  const aufraeumKnopf = document.querySelector('[data-spielfeld-reset]');
  if (aufraeumKnopf) aufraeumKnopf.addEventListener('click', function () { anordnen(); });

  /* Ohne Maus kann man nicht schütteln — deshalb auch ein Knopf. */
  const memoryKnopf = document.querySelector('[data-memory-start]');
  if (memoryKnopf) {
    memoryKnopf.addEventListener('click', function () {
      if (typeof memoryStarten === 'function') memoryStarten();
    });
  }

  /* Neu ausrichten, sobald der Rahmen seine Breite ändert — beim
     Drehen des Geräts, beim Ziehen am Fenster, beim Wechsel der
     Spaltenzahl. Nur die Breite zählt: die Höhe setzen wir selbst,
     die dürfte sich sonst gegenseitig hochschaukeln. */
  let wartend;
  let letzteBreite = 0;

  function neuRechnenSpaeter() {
    window.clearTimeout(wartend);
    wartend = window.setTimeout(anordnen, 180);
  }

  if (typeof ResizeObserver === 'function') {
    letzteBreite = Math.round(feld.getBoundingClientRect().width);
    new ResizeObserver(function (eintraege) {
      const breite = Math.round(eintraege[0].contentRect.width);
      if (Math.abs(breite - letzteBreite) < 2) return;
      letzteBreite = breite;
      neuRechnenSpaeter();
    }).observe(feld);
  }
  window.addEventListener('resize', neuRechnenSpaeter);

  /* Erst rechnen, wenn Schriften geladen sind — sonst stimmen die
     abgelesenen Höhen nicht und die Kacheln überlappen. */
  if (document.readyState === 'complete') anordnen();
  else window.addEventListener('load', anordnen);
}


/* ───────────────────────────────────────────────────────────
   5. BILDFLÄCHEN — Hinweis ausblenden, sobald ein Bild drin ist
   ─────────────────────────────────────────────────────────── */

function bildflaechenPruefen() {
  document.querySelectorAll('.image-slot').forEach(function (slot) {
    const bild = slot.querySelector('img[src]');
    if (bild && bild.getAttribute('src')) slot.classList.add('has-image');
  });
}


/* ───────────────────────────────────────────────────────────
   6. JAHRESZAHL in der Fußzeile
   ─────────────────────────────────────────────────────────── */

function jahrEintragen() {
  document.querySelectorAll('[data-jahr]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
}


/* ───────────────────────────────────────────────────────────
   START
   ─────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  kontaktEintragen();
  navAufsetzen();
  kopfleisteVerwandelnAufsetzen();
  aktivenMenuepunktVerfolgen();
  auswahlAufsetzen();
  memoryStarten = memoryAufsetzen();   /* muss vor dem Spielfeld stehen */
  spielfeldAufsetzen();
  einblendenAufsetzen();
  bildflaechenPruefen();
  jahrEintragen();
});
