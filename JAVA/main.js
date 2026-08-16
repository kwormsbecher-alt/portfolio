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
     Muss zum Umschaltpunkt in styles.css passen (dort max-width: 1139px). */
  window.matchMedia('(min-width: 1140px)').addEventListener('change', function (e) {
    if (e.matches) menuSchliessen();
  });
}


/* ───────────────────────────────────────────────────────────
   2a. UNTERMENÜ

   Nach dem üblichen Muster für Navigations-Aufklapper gebaut: der
   Auslöser ist ein Knopf mit aria-expanded, kein Link. Am Rechner
   reicht Darüberfahren, mit der Tastatur geht es über Pfeiltasten,
   Escape schließt und springt zurück auf den Knopf. Auf dem Handy
   klappt es eingerückt im Menü auf.
   ─────────────────────────────────────────────────────────── */

function aufklapperAufsetzen() {
  const gruppen = document.querySelectorAll('.nav-gruppe');
  if (!gruppen.length) return;

  /* Muss zum Umschaltpunkt in styles.css passen (dort 1140px). */
  const alsPopup = window.matchMedia('(min-width: 1140px)');

  gruppen.forEach(function (gruppe) {
    const knopf = gruppe.querySelector('.nav-aufklapp');
    const feld  = gruppe.querySelector('.nav-untermenue');
    if (!knopf || !feld) return;

    let schliessUhr = null;

    /* Das seitliche Klappmenü geht nach rechts auf. Nach links wäre
       zwar mehr Platz, dort steht aber die Überschrift — die wollen
       wir nicht zudecken. Passt es rechts nicht mehr ins Bild, legen
       wir es unter den Auslöser statt es umzudrehen.
       Nur für Klappmenüs, die in einem Untermenü hängen: steht eins
       direkt in der Leiste, klappt es ohnehin nach unten auf.
       Gemessen wird erst nach dem Einblenden — ein verstecktes
       Element hat keine Maße. */
    const haengtImUntermenue = feld.classList.contains('nav-flyout') &&
      !!(feld.parentElement && feld.parentElement.closest('.nav-untermenue'));

    function seiteWaehlen() {
      if (!haengtImUntermenue || !alsPopup.matches) return;
      feld.classList.remove('faellt-nach-unten');
      const kasten = feld.getBoundingClientRect();
      if (kasten.right > window.innerWidth - 8) {
        feld.classList.add('faellt-nach-unten');
      }
    }

    function oeffnen() {
      window.clearTimeout(schliessUhr);
      feld.hidden = false;
      knopf.setAttribute('aria-expanded', 'true');
      seiteWaehlen();
    }
    function schliessen() {
      window.clearTimeout(schliessUhr);
      feld.hidden = true;
      knopf.setAttribute('aria-expanded', 'false');

      /* Tiefere Menüs mit zuklappen. Sonst stehen sie beim nächsten
         Öffnen schon aufgeklappt da, obwohl niemand danach gefragt hat. */
      feld.querySelectorAll('.nav-aufklapp[aria-expanded="true"]').forEach(function (tief) {
        tief.setAttribute('aria-expanded', 'false');
        const tiefesFeld = document.getElementById(tief.getAttribute('aria-controls'));
        if (tiefesFeld) {
          tiefesFeld.hidden = true;
          tiefesFeld.classList.remove('faellt-nach-unten');
        }
      });
    }

    knopf.addEventListener('click', function () {
      if (feld.hidden) oeffnen(); else schliessen();
    });

    /* Klick auf einen Eintrag klappt zu. Führt der Link auf eine andere
       Seite, spielt das keine Rolle — bleibt man aber auf dieser
       (z. B. #zahnmedizin auf der Portfolio-Seite), stünde das Menü
       sonst offen über dem Ergebnis. */
    feld.addEventListener('click', function (e) {
      if (e.target.closest('a')) schliessen();
    });

    /* Maus: aufklappen beim Darüberfahren. Beim Verlassen mit kurzer
       Verzögerung, damit man die Strecke zum Untermenü schafft. */
    gruppe.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch' || !alsPopup.matches) return;
      oeffnen();
    });
    gruppe.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch' || !alsPopup.matches) return;
      schliessUhr = window.setTimeout(schliessen, 220);
    });

    gruppe.addEventListener('keydown', function (e) {
      /* Nur die eigenen Einträge — nicht die einer tiefer liegenden
         Gruppe, sonst blättern die Pfeiltasten in ein zugeklapptes
         Klappmenü hinein. */
      const eintraege = Array.prototype.slice.call(feld.querySelectorAll('a'))
        .filter(function (a) { return a.closest('.nav-gruppe') === gruppe; });
      const jetzt = eintraege.indexOf(document.activeElement);

      if (e.key === 'Escape' && !feld.hidden) {
        e.stopPropagation();            /* nicht auch das Hauptmenü zu */
        schliessen();
        knopf.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (feld.hidden) oeffnen();
        (eintraege[jetzt + 1] || eintraege[0]).focus();
        return;
      }
      if (e.key === 'ArrowUp' && !feld.hidden) {
        e.preventDefault();
        if (jetzt <= 0) knopf.focus(); else eintraege[jetzt - 1].focus();
      }
    });

    /* Fokus raus oder Klick daneben — beides schließt */
    gruppe.addEventListener('focusout', function (e) {
      if (!gruppe.contains(e.relatedTarget)) schliessen();
    });
    document.addEventListener('click', function (e) {
      if (!gruppe.contains(e.target)) schliessen();
    });

    /* Beim Wechsel zwischen Handy- und Rechner-Ansicht aufräumen */
    alsPopup.addEventListener('change', schliessen);
  });
}


/* ───────────────────────────────────────────────────────────
   2a-2. DER ZEIGER ALS LICHT IM KLAPPMENÜ

   Im Klappmenü liegen die Einträge blass da. Wo der Zeiger gerade
   steht, werden sie hell — dasselbe Prinzip wie bei der Leiste, nur
   senkrecht statt waagerecht. Das CSS rechnet aus --naehe (0 bis 1)
   die Deckkraft; hier wird nur der Abstand gemessen.

   Ohne Maus passiert hier nichts: Finger und Tastatur bekommen über
   CSS ohnehin die volle Deckkraft.
   ─────────────────────────────────────────────────────────── */

function flyoutLichtAufsetzen() {
  const menues = document.querySelectorAll('.nav-flyout');
  if (!menues.length) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const REICHWEITE = 86;          /* Pixel, ab da ist ein Eintrag dunkel */

  menues.forEach(function (menue) {
    const zeilen = menue.querySelectorAll('a, .nav-leer, .nav-spalte-titel');
    if (!zeilen.length) return;

    function setzen(wert) {
      zeilen.forEach(function (z) { z.style.setProperty('--naehe', wert); });
    }

    menue.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      zeilen.forEach(function (z) {
        const kasten = z.getBoundingClientRect();
        const abstand = Math.abs(e.clientY - (kasten.top + kasten.height / 2));
        const naehe = Math.max(0, 1 - abstand / REICHWEITE);
        z.style.setProperty('--naehe', naehe.toFixed(3));
      });
    });

    /* Zeiger weg — alles wieder zurücktreten lassen */
    menue.addEventListener('pointerleave', function () { setzen('0'); });

    /* Und beim Zuklappen zurücksetzen, damit der nächste Besuch
       nicht mit einem hellen Streifen von letztem Mal anfängt. */
    const knopf = menue.parentElement &&
                  menue.parentElement.querySelector('.nav-aufklapp');
    if (knopf) {
      new MutationObserver(function () {
        if (knopf.getAttribute('aria-expanded') !== 'true') setzen('0');
      }).observe(knopf, { attributes: true, attributeFilter: ['aria-expanded'] });
    }
  });
}


/* ───────────────────────────────────────────────────────────
   2a-3. FACHRICHTUNG FILTERN (Portfolio-Seite)

   Ein Fach anklicken heißt: nur dieses Fach zeigen, sonst nichts.
   "Alle Bereiche" holt alles zurück.

   Gesteuert wird über die Adresse (#zahnmedizin), damit dasselbe aus
   drei Richtungen funktioniert: die Knöpfe hier, das Klappmenü oben
   auf dieser Seite, und ein Link von der Startseite. Außerdem lässt
   sich ein Fach so verschicken und der Zurück-Knopf tut das Richtige.

   Ohne JavaScript passiert nichts — dann bleiben es Sprunglinks und
   es ist weiterhin alles zu sehen. Das ist der ehrlichere Rückfall.
   ─────────────────────────────────────────────────────────── */

function fachFilterAufsetzen() {
  const leiste  = document.querySelector('.fach-chips');
  const bloecke = document.querySelectorAll('.fach-block');
  if (!leiste || !bloecke.length) return;

  const knoepfe = leiste.querySelectorAll('a[data-fach]');
  const lage    = document.querySelector('[data-fach-lage]');

  function gibtEs(fach) {
    return Array.prototype.some.call(bloecke, function (b) { return b.id === fach; });
  }

  function anwenden(fach) {
    /* Alles, was wir nicht kennen, zeigt lieber alles als nichts. */
    if (fach !== 'alle' && !gibtEs(fach)) fach = 'alle';

    let name = '';
    bloecke.forEach(function (block) {
      const zeigen = (fach === 'alle') || (block.id === fach);
      block.hidden = !zeigen;
      if (block.id === fach) {
        const ueberschrift = block.querySelector('h2');
        name = ueberschrift ? ueberschrift.childNodes[0].textContent.trim() : fach;
      }
    });

    knoepfe.forEach(function (k) {
      const aktiv = k.dataset.fach === fach;
      k.classList.toggle('is-active', aktiv);
      if (aktiv) k.setAttribute('aria-current', 'true');
      else k.removeAttribute('aria-current');
    });

    if (lage) {
      lage.textContent = fach === 'alle'
        ? 'Alle Fachrichtungen werden angezeigt.'
        : 'Gefiltert: nur ' + name + '.';
    }
    return fach;
  }

  function ausAdresse() {
    const roh = decodeURIComponent(window.location.hash.replace('#', '')).trim();
    return roh || 'alle';
  }

  /* Nach dem Filtern zurück zur Knopfleiste: sonst steht man
     mitten im Nichts, wenn der vorherige Block länger war als der
     neue — und man sieht nicht, dass gefiltert ist. */
  function zurLeiste() {
    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    leiste.scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
  }

  leiste.addEventListener('click', function (e) {
    const knopf = e.target.closest('a[data-fach]');
    if (!knopf) return;
    e.preventDefault();

    const fach = knopf.dataset.fach;
    /* Gleicher Wert löst kein hashchange aus — also selbst anwenden. */
    if (ausAdresse() === fach) { anwenden(fach); zurLeiste(); return; }
    window.location.hash = fach;      /* hashchange erledigt den Rest */
  });

  window.addEventListener('hashchange', function () {
    anwenden(ausAdresse());
    zurLeiste();
  });

  /* Beim Laden: filtern, aber nicht ungefragt scrollen. Kommt jemand
     mit einem Fach in der Adresse an, soll er es allerdings sehen. */
  const start = anwenden(ausAdresse());
  if (start !== 'alle') {
    window.requestAnimationFrame(function () {
      leiste.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }
}


/* ───────────────────────────────────────────────────────────
   2b. KOPFLEISTE BEIM SCROLLEN

   Ab dem Ende des Landing-Bereichs tritt die Leiste zurück: klar zu
   sehen bleiben nur der Punkt, auf dem man steht, und wie weit man
   gekommen ist. Fährt die Maus darüber, hellen sich die Punkte in
   ihrer Nähe auf — wie ein Scanner.
   Gleichzeitig taucht der Haus-Knopf auf, weil das Logo dann
   weggescrollt ist.
   ─────────────────────────────────────────────────────────── */

function kopfleisteVerwandelnAufsetzen() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const heim  = document.querySelector('.heim-knopf');
  const hero  = document.getElementById('willkommen');
  const insel = nav.querySelector('.nav-links');

  const logo = document.querySelector('.logo-band');

  /* Für die Markierung: alle Abschnitts-Links, auch die im Untermenü.
     Das Häuschen bleibt außen vor — es zeigt keinen Abschnitt an,
     sondern führt nach oben, und würde sonst kurz schwarz markiert. */
  const punkte = Array.prototype.slice
    .call(nav.querySelectorAll('.nav-links a[href^="#"]'))
    .filter(function (a) {
      return !a.classList.contains('btn') && !a.classList.contains('nav-heim');
    })
    .map(function (a) { return { knopf: a, ziel: document.querySelector(a.getAttribute('href')) }; })
    .filter(function (p) { return p.ziel; });

  /* Für Scanner und Dimmen: nur was in der Leiste wirklich zu sehen
     ist — ein zugeklapptes Untermenü hat keine Position. */
  const sichtbare = Array.prototype.slice.call(
    nav.querySelectorAll('.nav-links > a:not(.btn), .nav-links .nav-aufklapp')
  );

  const gruppen = Array.prototype.slice.call(nav.querySelectorAll('.nav-gruppe'));

  let letzterLauf = 0;
  let nachzuegler = null;

  /* Genau die Höhe, auf der ein angeklickter Abschnitt andockt —
     abgelesen aus scroll-padding-top, damit Klick und Markierung
     nicht auseinanderlaufen können. Vorher stand hier die Höhe der
     Kopfleiste, und weil der Anker tiefer lag als diese Grenze, wurde
     der geklickte Punkt erst verspätet schwarz. */
  function ankerHoehe() {
    const wert = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
    return isNaN(wert) ? 8 : wert;
  }

  function pruefen() {
    const grenze = ankerHoehe() + 6;

    /* Landing-Bereich durch? */
    const heroDurch = hero
      ? hero.getBoundingClientRect().bottom <= 80
      : window.scrollY > 400;

    nav.classList.toggle('ist-gedimmt', heroDurch);
    if (heim) heim.classList.toggle('ist-sichtbar', heroDurch);

    /* Das Häuschen oben übernimmt genau dann, wenn das Logo aus dem
       Bild gescrollt ist — nicht erst am Ende des Landing-Bereichs. */
    const logoWeg = logo ? logo.getBoundingClientRect().bottom <= 0 : window.scrollY > 80;
    nav.classList.toggle('hat-logo-verlassen', logoWeg);

    /* Was man schon gesehen hat, bleibt etwas präsenter — und der
       zuletzt erreichte Abschnitt ist der, auf dem man steht. */
    let aktiv = null;
    punkte.forEach(function (p) {
      const vorbei = p.ziel.getBoundingClientRect().top <= grenze;
      p.knopf.classList.toggle('ist-vorbei', vorbei);
      if (vorbei) aktiv = p;
    });
    punkte.forEach(function (p) {
      p.knopf.classList.toggle('is-active', p === aktiv);
    });

    /* Steckt der aktive Punkt in einem zugeklappten Untermenü, würde
       man die Markierung nicht sehen — dann erbt sie der Knopf. */
    gruppen.forEach(function (gruppe) {
      const knopf = gruppe.querySelector('.nav-aufklapp');
      if (!knopf) return;
      knopf.classList.toggle('is-active',  !!gruppe.querySelector('.nav-untermenue a.is-active'));
      knopf.classList.toggle('ist-vorbei', !!gruppe.querySelector('.nav-untermenue a.ist-vorbei'));
    });
  }

  /* Der Scanner: je näher der Zeiger, desto klarer der Punkt. */
  if (insel) {
    insel.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      sichtbare.forEach(function (el) {
        const kasten = el.getBoundingClientRect();
        const abstand = Math.abs(e.clientX - (kasten.left + kasten.width / 2));
        const naehe = Math.max(0, 1 - abstand / 200);
        el.style.setProperty('--naehe', naehe.toFixed(3));
      });
    });

    insel.addEventListener('pointerleave', function () {
      sichtbare.forEach(function (el) { el.style.setProperty('--naehe', '0'); });
    });
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
   3a. HINTERGRUND-FILM

   Kein Player: keine Bedienelemente, kein Ton, Endlosschleife. Der
   Film startet nur, wenn er auch darf — bei reduzierter Bewegung oder
   im Datensparmodus bleibt das Standbild stehen. Er pausiert, sobald
   er aus dem Bild ist oder der Tab in den Hintergrund geht.

   Umschalten über data-hintergrund am Abschnitt: "video" oder etwas
   anderes.
   ─────────────────────────────────────────────────────────── */

function hintergrundFilmAufsetzen() {
  const hero    = document.querySelector('.hero');
  const flaeche = document.querySelector('.hero-bild');
  const film    = flaeche && flaeche.querySelector('.hero-video');
  if (!hero || !film) return;

  if (hero.dataset.hintergrund !== 'video') return;

  /* Wer Bewegung reduziert hat oder Daten sparen will, bekommt Bild. */
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');
  const verbindung = navigator.connection;
  if (ruhig.matches || (verbindung && verbindung.saveData)) return;

  film.muted = true;              /* ohne das startet iOS nicht */
  film.playsInline = true;

  /* Im HTML steht preload="none", damit die Datei bei Standbild-
     Hintergrund gar nicht erst geladen wird. Hier ist Film gewollt —
     also jetzt vorladen. */
  film.preload = 'auto';
  film.load();

  let imBild = true;

  function anwerfen() {
    if (!imBild || document.hidden || ruhig.matches) return;
    const versuch = film.play();
    if (versuch && typeof versuch.catch === 'function') {
      versuch.catch(function () { /* dann bleibt das Standbild */ });
    }
  }

  film.addEventListener('playing', function () {
    flaeche.classList.add('hat-video');
  });

  /* Nicht weiterlaufen lassen, wenn niemand hinschaut */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) film.pause(); else anwerfen();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (eintraege) {
      imBild = eintraege[0].isIntersecting;
      if (imBild) anwerfen(); else film.pause();
    }, { threshold: 0.05 }).observe(hero);
  }

  anwerfen();
}


/* ───────────────────────────────────────────────────────────
   3b. GERÄTE-GALERIE

   Der Rahmen bei der Referenz verwandelt sich von selbst weiter:
   Desktop → Tablet → Handy. Läuft nur, solange man ihn auch sieht,
   und gar nicht, wenn im System Bewegung reduziert eingestellt ist.
   ─────────────────────────────────────────────────────────── */

function geraeteGalerieAufsetzen() {
  const geraet = document.querySelector('.geraet');
  if (!geraet) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const anzeige = document.querySelector('[data-geraet-name]');
  const formen  = ['desktop', 'tablet', 'handy'];
  const namen   = { desktop: 'Desktop', tablet: 'Tablet', handy: 'Handy' };

  let stelle = 0;
  let uhr = null;

  function weiterdrehen() {
    stelle = (stelle + 1) % formen.length;
    geraet.dataset.geraet = formen[stelle];
    if (anzeige) anzeige.textContent = namen[formen[stelle]];
  }

  function starten()  { if (!uhr) uhr = window.setInterval(weiterdrehen, 3400); }
  function anhalten() { if (uhr) { window.clearInterval(uhr); uhr = null; } }

  /* Nicht im Hintergrund vor sich hin rechnen lassen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (eintraege) {
      if (eintraege[0].isIntersecting) starten(); else anhalten();
    }, { threshold: 0.25 }).observe(geraet);
  } else {
    starten();
  }
}


/* ───────────────────────────────────────────────────────────
   3c. REFERENZ ZUM BLÄTTERN

   Rechts blättert der Text, links wechselt die Vorschau mit. Nur auf
   Knopfdruck oder Pfeiltaste — bewusst nichts, was von selbst läuft.
   Die Bildquellen stehen als data-Attribute an der Folie, damit
   Inhalt und Technik nicht auseinanderdriften.
   ─────────────────────────────────────────────────────────── */

function referenzBlaetternAufsetzen() {
  const buehne = document.querySelector('.blaetter-buehne');
  if (!buehne) return;

  const folien = Array.prototype.slice.call(buehne.querySelectorAll('.referenz-folie'));
  if (folien.length < 2) return;

  const zurueck = document.querySelector('[data-blaettern="zurueck"]');
  const vor     = document.querySelector('[data-blaettern="vor"]');
  const stand   = document.querySelector('[data-blaetter-stand]');
  const gesamt  = document.querySelector('[data-blaetter-gesamt]');

  const geraet    = document.querySelector('.geraet');
  const bilder    = geraet ? Array.prototype.slice.call(geraet.querySelectorAll('.geraet-bild')) : [];
  const fuelltext = document.querySelector('[data-geraet-fuelltext]');
  const adresse   = document.querySelector('.browser-adresse');

  let jetzt = 0;

  if (gesamt) gesamt.textContent = String(folien.length);

  function vorschauSetzen(folie) {
    if (!geraet) return;

    /* Fehlt eine Form, springt sie auf die Desktop-Fassung zurück. */
    const quellen = {
      desktop: folie.dataset.bildDesktop || '',
      tablet:  folie.dataset.bildTablet  || folie.dataset.bildDesktop || '',
      handy:   folie.dataset.bildHandy   || folie.dataset.bildDesktop || ''
    };
    const hatBilder = !!quellen.desktop;

    bilder.forEach(function (bild) {
      const quelle = quellen[bild.dataset.fuer] || '';
      if (quelle) bild.setAttribute('src', quelle); else bild.removeAttribute('src');
      bild.alt = hatBilder ? (folie.dataset.bildText || '') : '';
    });

    geraet.classList.toggle('hat-bilder', hatBilder);
    if (fuelltext) fuelltext.textContent = folie.dataset.vorschauText || 'Vorschau folgt';

    /* Die Adressleiste gehört zum Projekt, nicht zum Rahmen — sonst
       stünde bei jedem Projekt dieselbe fremde Adresse. */
    if (adresse && folie.dataset.adresse) adresse.textContent = folie.dataset.adresse;
  }

  function zeigen(index) {
    jetzt = Math.max(0, Math.min(index, folien.length - 1));

    folien.forEach(function (folie, i) {
      const aktiv = i === jetzt;
      folie.classList.toggle('is-aktiv', aktiv);
      /* aria-hidden statt hidden: die Folie muss für die Überblendung
         noch sichtbar bleiben, soll aber nicht vorgelesen werden. */
      folie.setAttribute('aria-hidden', String(!aktiv));
    });

    if (stand) stand.textContent = String(jetzt + 1);
    if (zurueck) zurueck.disabled = jetzt === 0;
    if (vor)     vor.disabled     = jetzt === folien.length - 1;

    vorschauSetzen(folien[jetzt]);
  }

  if (zurueck) zurueck.addEventListener('click', function () { zeigen(jetzt - 1); });
  if (vor)     vor.addEventListener('click',     function () { zeigen(jetzt + 1); });

  /* Pfeiltasten, solange der Fokus im Blätterbereich steht */
  const bereich = buehne.closest('.referenz-blaettern') || buehne;
  bereich.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); zeigen(jetzt - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); zeigen(jetzt + 1); }
  });

  zeigen(0);
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
   4ba. SCROLL-SPERRE BEI OFFENEN FENSTERN

   Sobald irgendein Fenster offen ist, steht die Seite dahinter still.
   showModal() feuert kein eigenes Ereignis, deshalb beobachten wir
   das open-Attribut — so greift es für alle Fenster gleichermaßen,
   auch für später hinzukommende.
   ─────────────────────────────────────────────────────────── */

function scrollSperreAufsetzen() {
  const fenster = document.querySelectorAll('dialog');
  if (!fenster.length || typeof MutationObserver !== 'function') return;

  function pruefen() {
    const offen = !!document.querySelector('dialog[open]');
    document.documentElement.classList.toggle('fenster-offen', offen);
  }

  const beobachter = new MutationObserver(pruefen);
  fenster.forEach(function (f) {
    beobachter.observe(f, { attributes: true, attributeFilter: ['open'] });
  });

  pruefen();
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
  const nurWeb = window.matchMedia('(min-width: 1140px)');

  return function starten() {
    if (!nurWeb.matches) return;
    if (fenster.open) return;
    merkeScroll = window.scrollY;
    bauen();
    try { fenster.showModal(); } catch (fehler) { /* dann eben nicht */ }
  };
}


/* ───────────────────────────────────────────────────────────
   4bc. BAUSTEIN IM DETAIL

   Klick auf eine Kachel dreht sie mittig auf, der Rest verschwimmt
   dahinter. Der Inhalt kommt aus der Kachel selbst — der lange Text
   steht dort versteckt im HTML und muss nicht doppelt gepflegt
   werden.
   ─────────────────────────────────────────────────────────── */

let bausteinZeigen = null;

function bausteinFensterAufsetzen() {
  const fenster = document.querySelector('.baustein-fenster');
  if (!fenster || typeof fenster.showModal !== 'function') return null;

  const symbol = fenster.querySelector('[data-detail-symbol]');
  const titel  = fenster.querySelector('[data-detail-titel]');
  const kurz   = fenster.querySelector('[data-detail-kurz]');
  const lang   = fenster.querySelector('[data-detail-lang]');
  const zu     = fenster.querySelector('[data-detail-zu]');

  if (zu) zu.addEventListener('click', function () { fenster.close(); });

  /* Klick auf den verschwommenen Rand schließt ebenfalls */
  fenster.addEventListener('click', function (e) {
    if (e.target === fenster) fenster.close();
  });

  return function zeigen(stein) {
    const quelleSymbol = stein.querySelector('.baustein-symbol');
    const quelleTitel  = stein.querySelector('h3');
    const quelleKurz   = stein.querySelector('p');
    const quelleLang   = stein.querySelector('.baustein-mehr');

    /* trim(), weil der Text im Quelltext eingerückt steht und die
       Umbrüche sonst mit ins Fenster wandern. */
    symbol.innerHTML  = quelleSymbol ? quelleSymbol.innerHTML : '';
    titel.textContent = quelleTitel ? quelleTitel.textContent.trim() : '';
    kurz.textContent  = quelleKurz  ? quelleKurz.textContent.trim()  : '';
    lang.innerHTML    = quelleLang  ? quelleLang.innerHTML           : '';

    fenster.classList.toggle('ist-dunkel', stein.classList.contains('baustein--spiel'));

    if (!fenster.open) {
      try { fenster.showModal(); } catch (fehler) { /* dann eben nicht */ }
    }
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
    let bewegt = false;
    let halteUhr = null;

    /* Die Kachel ist anklickbar — das muss auch die Tastatur können.
       Gesetzt per JavaScript, weil sie ohne main.js nichts täte. */
    karte.setAttribute('role', 'button');
    karte.setAttribute('tabindex', '0');
    karte.setAttribute('aria-haspopup', 'dialog');
    karte.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (typeof bausteinZeigen === 'function') bausteinZeigen(karte);
    });

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
      bewegt = false;

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
      /* Merken, ob überhaupt gezogen wurde — sonst war es ein Tippen */
      if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
        bewegt = true;
      }

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

    function loslassen(e, abgebrochen) {
      uhrStoppen();
      karte.classList.remove('wackelt');
      wechsel = 0;

      const warAktiv = aktiv;
      aktiv = false;

      if (warAktiv) {
        karte.classList.remove('wird-gezogen');
        try {
          if (karte.hasPointerCapture(e.pointerId)) karte.releasePointerCapture(e.pointerId);
        } catch (fehler) { /* egal */ }
        einrasten(karte);
      }

      /* Kein Weg zurückgelegt heißt: getippt, nicht gezogen. Dann
         klappt die Kachel auf statt sich zu verschieben. */
      if (!abgebrochen && !bewegt && typeof bausteinZeigen === 'function') {
        bausteinZeigen(karte);
      }
    }
    karte.addEventListener('pointerup', function (e) { loslassen(e, false); });
    karte.addEventListener('pointercancel', function (e) { loslassen(e, true); });
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
  aufklapperAufsetzen();
  flyoutLichtAufsetzen();
  fachFilterAufsetzen();
  kopfleisteVerwandelnAufsetzen();
  auswahlAufsetzen();
  memoryStarten = memoryAufsetzen();   /* muss vor dem Spielfeld stehen */
  scrollSperreAufsetzen();
  bausteinZeigen = bausteinFensterAufsetzen();   /* muss vor dem Spielfeld stehen */
  spielfeldAufsetzen();
  hintergrundFilmAufsetzen();
  geraeteGalerieAufsetzen();
  referenzBlaetternAufsetzen();
  einblendenAufsetzen();
  bildflaechenPruefen();
  jahrEintragen();
});
