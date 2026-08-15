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

      /* Auf schmalen Schirmen steht das Detailfenster unter allen vier
         Reitern und damit außerhalb des Bildes. Ohne diesen Sprung tippt
         man auf einen Reiter und sieht scheinbar nichts passieren. */
      if (hinscrollen && aktivesFeld && window.matchMedia('(max-width: 939px)').matches) {
        const kopfhoehe = document.querySelector('.nav');
        const abstand = (kopfhoehe ? kopfhoehe.getBoundingClientRect().height : 0) + 16;
        const ziel = aktivesFeld.getBoundingClientRect().top + window.scrollY - abstand;
        const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: ziel, behavior: ruhig ? 'auto' : 'smooth' });
      }
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
   5. BILDFLÄCHEN — Hinweis ausblenden, sobald ein Bild drin ist
   ─────────────────────────────────────────────────────────── */

function bildflaechenPruefen() {
  document.querySelectorAll('.image-slot').forEach(function (slot) {
    const bild = slot.querySelector('img[src]');
    if (bild && bild.getAttribute('src')) slot.classList.add('has-image');
  });

  /* Landing-Bereich: Erst wenn wirklich ein Hintergrundbild liegt,
     kommt der dunkle Schleier und die helle Schrift. Ohne Bild bliebe
     sonst weiße Schrift auf hellem Platzhalter — unlesbar. */
  const hero = document.querySelector('.hero');
  if (hero && hero.querySelector('.hero-hintergrund img[src]')) {
    hero.classList.add('hat-bild');
  }
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
  aktivenMenuepunktVerfolgen();
  auswahlAufsetzen();
  einblendenAufsetzen();
  bildflaechenPruefen();
  jahrEintragen();
});
