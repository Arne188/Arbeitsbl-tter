# Französisch · Arbeitsstand

Stand: 9. November 2026.

**Schritt 3 ist umgesetzt, veröffentlicht und geprüft. Als Nächstes folgt Schritt 4 (M6/M7).**

- M4: sechs Lektionen zu Subjekt, il/elle, sämtlichen être-Präsensformen, nous/ils/elles, on und höflichem bzw. pluralischem vous, eigener Text und Fehlerkorrektur.
- M5: vier Lektionen zu Intonationsfragen, Fragebausteinen, gesuchter Information und Antwortperspektive; eigener Dialog. Keine zusätzlichen Inversions-/est-ce-que- oder vollständigen avoir-Kurse.
- Insgesamt 24 Lektionen mit je acht Schritten, 168 Lernaufgaben (164 geschlossen, vier offene Texte), 24 Merkkarten.
- Fünf Modulprüfungen plus gemischter Check M1–M3. Zusammen 64 Prüfungsaufgaben: 59 automatisch geprüft, fünf offene Selbstbewertungen. M4: zwölf Aufgaben (elf geschlossen), M5: zehn (neun geschlossen).
- Neue Pronomen-/être-Werkstatt mit 13 ausdrücklich beschriebenen Situationen und aufdeckbarem Denkweg. Vollständige Formtabelle. Fragewerkstatt mit acht Situationen und aufdeckbarer Antwort/Begründung. Beide sind erklärend, unbenotet.
- Mehrteilige Aufgaben melden getrennt Fehler beim Pronomen und bei der Verbform. Erklärungen unterscheiden Bedeutung/Kopfzahl von grammatischer Form und direkte Anrede vom Sprechen über Personen.
- Speicherbereich und Schema 1 unverändert, Inhaltsversion 3. Alle sechs Prüfungen haben unabhängige Entwürfe/Abgaben/Selbstbewertungen. M1–M3 und der erste gemischte Check behalten ihre IDs. Offline-Datei auf M1–M5 erweitert. Inhaltskennungen schützen vor gemischten Cache-Fassungen.
- 24 automatische Prüfungen bestanden: Lösungsschlüssel aller geschlossenen Aufgaben, Schriftzeichen, gezielte Diagnose, alte Sicherungen, unabhängige Prüfungen, unvollständige Auswahlfelder, Formenmodell, Online-Dateiversionen, Offline-Bündel und unveränderte bisherige Fächer.
- Bisherige Browserprüfung: on est, höfliches vous êtes, Antwortlabor mit je suis, gezielte Pronomen-/Verbfehler und korrigierte Wiederherstellung; M4-Prüfung vollständig 11/11 nach Entwurfsneuladen.

Noch offen: M6–M9, weitere gemischte Checks, Gesamtabfrage und zwei Probeklausuren. Schritt 4 ergänzt Herkunft/Wohnort/Klasse, il y a und un/une/des, Orts-/Personenkarten und zweiten gemischten Check nach M6. Ein eventuell benötigter kurzer Präpositionshinweis bleibt auf bereitgestellte Städte/Länder begrenzt.

## Abschließende Prüfung und Veröffentlichung

- M5-Prüfung vollständig 9/9, eigener Text separat 2/4; Entwurf, Abgabe und Selbstbewertung nach Neuladen erhalten. Zuvor M4: 11/11. Alte Prüfungsstände zusätzlich durch automatisierte Migrationstests geprüft.
- Handy im 390-Pixel-Frame (375 Pixel Inhalt): höfliches vous in Pronomenkette; M5-Auswahlaufgabe korrekt ausgewertet. Kein horizontales Überlaufen.
- Offline-Datei mit 24 Lektionen/168 Lernaufgaben und M5-Fragewerkstatt geöffnet.
- GitHub Pages: c8770e0fcdc8c486315a1825d5a05e9ea8fb29e1, Lauf 42679477260 erfolgreich. Öffentlicher Überblick, on-est-Kette, höfliche vous-/je-Antwort und sechs Prüfungsangebote im Browser geprüft.
- https://arne188.github.io/Arbeitsbl-tter/franzoesisch/index.html#home

## Grundlagen und Grenzen

30 Fotos der Seiten 8–37. Eigene Inhalte, keine veröffentlichten Buchfotos oder Liedtexte. Keine Vokabeltests. Quellen unter Zum Kurs. Freie Texte mit Selbstbewertung, kein automatischer Sprachkorrektor. Optionale geräteabhängige Systemstimme, keine Originalhörtexte oder eigenen Audiodateien. M6–M9, weitere gemischte Checks, Gesamtabfrage und zwei Probeklausuren fehlen noch.

## Speichern und Fortsetzen

Schlüssel bonjour-franzoesisch-klasse6-v1; Dateischema 1; Inhaltsversion 3. exams.m1/m2/m3/m4/m5/mix1 getrennt. Legacy state.exam wird nach exams.m1 übernommen, state.exam bleibt kompatibler Verweis. IDs unverändert, gültige künftige IDs erhalten. Import ersetzt nach Vorschau den ganzen Französischstand. Keine Cloud-Synchronisation.

Zuerst diese Datei und aktuellen Repository-Stand lesen, dann Schritt 4 umsetzen. Nicht erneut bei M1 anfangen.

## Dateien und Prüfung

modules/m1.js bis m5.js: Module; modules/mix1.js: gemischter Check und Artikelkarten. core.js: Auswertung/Speichern; app.js: Darstellung/Werkstätten; tools/bundle.cjs: Offline-Paket und Online-Dateiversionen.

Im Repository-Stamm:

    node franzoesisch/tools/bundle.cjs
    node --test franzoesisch/tests/core.test.cjs

21 Kernprüfungen; drei zusätzliche lokale Portalprüfungen ergeben insgesamt 24. Die Test-Sicherung enthält nur erfundene Testdaten.
