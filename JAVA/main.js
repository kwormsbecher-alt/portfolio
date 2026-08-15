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

  /* Beim Wechsel auf Desktop-Breite aufräumen */
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
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
  einblendenAufsetzen();
  bildflaechenPruefen();
  jahrEintragen();
});
