# Portfolio-Website

Statische Website — reines HTML, CSS und JavaScript. Kein Build-Schritt,
keine Abhängigkeiten. Dateien hochladen, fertig.

## Aufbau

```
index.html                     Startseite mit allen 9 Abschnitten
HTML/impressum.html            Gerüst, noch nicht scharf
HTML/datenschutz.html          Gerüst, noch nicht scharf
HTML/referenz-zahnarzt.html    Fallstudie, Ausbaustufe 2
CSS/tokens.css                 Farben, Schriften, Maße — HIER wird das Design gesteuert
CSS/styles.css                 Aufbau der Seite, benutzt nur Tokens
JAVA/main.js                   Menü, Scroll-Effekte, Termin-Mail
PHP/                           leer, für ein echtes Formular später
bilder/                        Fotos und Screenshots
```

## Was noch ersetzt werden muss

| Was | Wo | Wie |
|---|---|---|
| **Mailadresse** | `JAVA/main.js`, ganz oben bei `KONTAKT.EMAIL` | Eine Zeile ändern. Alle Knöpfe auf allen Seiten ziehen automatisch mit. |
| **Name / Marke** | Suche nach `[DEIN NAME]` in allen HTML-Dateien | Suchen-und-Ersetzen über alle Dateien. |
| **Texte** | Alles mit gelber Markierung im Browser | Das sind die Stellen mit der CSS-Klasse `platzhalter`. |
| **Bilder** | Die gestrichelten Flächen | Bild nach `bilder/` legen, `<img>` in das `.image-slot` einsetzen. Der Hinweis verschwindet von selbst. |

### Markierungen ausschalten

Die gelb markierten Platzhalter-Texte sind eine Arbeitshilfe. Zum Ausblenden
im `<body>`-Tag die Klasse ergänzen:

```html
<body class="platzhalter-aus">
```

## Design ändern

Alles Optische steht in `CSS/tokens.css` — etwa 40 Zeilen. Farbe, Schrift,
Rundungen und Abstände dort ändern, die ganze Seite dreht sich mit.

**Wichtige Regel:** In `CSS/styles.css` niemals eine feste Farbe wie `#3F5D50`
schreiben, immer nur `var(--accent)`. Sonst bricht genau dieser Mechanismus.

## Lokal anschauen

`index.html` doppelklicken reicht zum schnellen Draufschauen.

Für die richtige Vorschau — und um sie auf iPad und iPhone im selben WLAN zu
öffnen — liegt ein Mini-Server eine Ebene höher (`WEBSITE/Claude/dev-server.js`,
absichtlich außerhalb dieses Ordners, damit das Repo sauber bleibt):

```bash
node ../dev-server.js
```

- Am PC: `http://localhost:8080`
- Am iPad/iPhone: `http://192.168.2.33:8080` (WLAN-IP des PCs)

Beim ersten Start fragt die Windows-Firewall nach — für **private Netzwerke**
erlauben, sonst kommt das iPad nicht durch.
