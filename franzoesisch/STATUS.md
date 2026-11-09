# Französisch · Arbeitsstand

Stand: 9. November 2026. **Schritt 5 umgesetzt und lokal geprüft; Veröffentlichung wird abschließend verifiziert. Als Nächstes: Schritt 6 (Gesamtabfrage und zwei Probeklausuren).**

## Fertiger Umfang

- M1 Erste Gespräche (5 Lektionen), M2 Artikel/Mehrzahl (5), M3 Vorstellungen (4), M4 Pronomen/être (6), M5 Fragen (4), M6 Herkunft/Wohnort/Klasse (4), M7 il y a, un/une/des und Stadtbeschreibung (5).
- Neu M8 (4): j’aime, Artikel bei allgemeinen Vorlieben, je n’aime pas, tu aimes, Frage-/Antwortrolle, et/mais/ou und ou/où, eigener Dialog. Kein vollständiger -er- oder allgemeiner Negationskurs; Artikelregel ausdrücklich auf diese Vorlieben begrenzt.
- Neu M9 (5): Alphabet und Buchstabennamen, Unterrichtsfragen als feste Bausteine, Akzente und Bedeutungsunterschiede, u/ou, zwei Nasalvokale, c/ç, stumme Endungen, ausgewählte Liaison und bewusstes Sprechen. Keine universalen Regeln für alle Endkonsonanten, h oder Wortverbindungen. Et hat keine t-Liaison.
- 42 Lektionen mit je acht Schritten und sieben Lernaufgaben: 294 Lernaufgaben (286 geschlossen, acht freie Texte), 42 Merkkarten.
- Neun Modulprüfungen und drei gemischte Checks: 135 Aufgaben, davon 124 geschlossen und elf freie Texte. Neu M8 10 Aufgaben (9 geschlossen), M9 12 (11 geschlossen), Check M1–M9 15 (14 geschlossen). Offene Selbstkriterien separat.
- M8-Werkstatt: sechs bereitgestellte Gruppen, Ich/Du und positive/negative Aussage; Verneinung farbig und textlich erklärt. M9-Werkstatt: acht Lautvergleiche, sechs Buchstabierwörter, 26 Buchstaben; Akzente und cédille bleiben sichtbar. Keine Vokabeltests.
- Vorhandene Werkstätten, IDs und Fächer erhalten. Offline-Datei M1–M9 selbständig. Inhaltskennungen verhindern alte Skripte mit neuen Inhaltsdaten.

## Prüfung in Schritt 5

32 automatische Tests bestanden: 29 Kernprüfungen plus drei Portalprüfungen. Alle hinterlegten geschlossenen Lösungen und absichtlich falsche Antworten; alte Sicherungen; zwölf unabhängige Prüfungsstände; Akzente und Apostrophe; vollständige Negationsmodelle; Buchstabierzeichen inklusive Unicode-Normalisierung; gültige Lernzielverweise; Offline-Bündel; passende Inhaltskennungen. Biologie, Chemie und Werte und Normen bytegleich erhalten.

Browser: M8-Werkstatt mit l’art und je/tu negativ; M9 u/ou, Alphabet G/J, garçon mit cédille, hôtel mit circonflexe. Vorlesetempo/Stop bedienbar. Im Prüfgerät fehlt eine französische Stimme: der ausdrückliche Hinweis ist geprüft; tatsächlicher Audioklang konnte hier nicht geprüft werden. Kein zugesichertes Audioarchiv oder Hörverstehenstest.

M8-Prüfung nach Neuladen 9/9, Selbstkriterien 2/4; M9 11/11, Selbstkriterien 1/4 bleiben nach Neuladen; Check M1–M9 14/14 mit separater Selbstbewertung. Danach allein M8 neu begonnen; M9, mix3 sowie die vorhandenen M5/M7/mix2-Ergebnisse bleiben abgegeben. Mehrteilige Antworten werden in der Auswertung mit ihren festen Satzteilen gezeigt.

Handyprüfung im 390-Pixel-Rahmen, 375 Pixel Inhaltsbreite: Lautvergleich und Buchstabierhilfe, Negationsaufgabe mit fehlendem pas, gezielter Hinweis und Korrektur. Antwort bleibt beim erneuten Öffnen erhalten; kein horizontales Überlaufen. Offline-Datei mit 42/294 geöffnet, Laut-/Buchstabierwerkstatt mit musée bedienbar.

## Speicherung

Schlüssel bonjour-franzoesisch-klasse6-v1; Dateischema 1; Inhaltsversion 5. exams.m1 bis m9 sowie mix1 bis mix3 getrennt. Legacy state.exam wird als exams.m1 erhalten. Import ersetzt nach Vorschau den Französischstand; keine Cloud-Synchronisation. Freie Texte und tatsächliche Aussprache werden nicht automatisch als richtig/falsch bewertet.

## Stoffgrenzen und Fortsetzung

Grundlage: 30 Fotos, Buchseiten 8–37; eigene Erklärungen und Aufgaben. Bedeutungen bleiben bereitgestellt. Quellen unter Zum Kurs, besonders TV5MONDE für neue Grammatik/Lautregeln. Curriculare Referenz Niedersachsen Französisch 2025: Anfangsausschnitt, kein vollständiger Jahres- oder A1-Kurs. Keine Buchfotos, Originalcomics oder Liedtexte veröffentlicht.

**Schritt 6 als Nächstes:** zusätzliche Gesamtabfrage (etwa 20–25 Aufgaben) und zwei eigenständige Probeklausuren (etwa 45–60 Minuten). Neue Geschichten und Aufgaben, Lernzielbezug, transparente Gewichtung, freie Schreibkriterien und Wiederholungslinks. Nicht einfach Übungsfragen kopieren. Schriftliche Punkte und offene Selbstbewertung trennen. Nur bekannte Strukturen M1–M9; keine neuen Zeiten, vollständigen -er-/avoir-Kurse oder Inversionsfragen. Schritt 7 bleibt abschließende Gesamtprüfung und Integration; Portal und Offlinefassung sind bereits integriert.

Beim Fortsetzen zuerst diesen Stand und aktuellen Repository-Head lesen, dann Schritt 6. Nicht bei M1 neu beginnen. Keine weiteren Fotos erforderlich.

## Dateien und Prüfungen

modules/m1.js bis m9.js, mix1.js bis mix3.js; core.js für Auswertung/Modelle/Speicherung; app.js/style.css/index.html für Oberfläche. tools/bundle.cjs erzeugt Offline-Fassung und Inhaltskennungen.

Im Repository-Stamm:

    node franzoesisch/tools/bundle.cjs
    node --test franzoesisch/tests/core.test.cjs

29 Kernprüfungen; drei zusätzliche lokale Portalprüfungen ergeben 32. Testdaten sind erfunden.

## Öffentliche Veröffentlichung

Wird nach erfolgreicher Bereitstellung mit Quellcommit und Pages-Lauf ergänzt.

Kurs: https://arne188.github.io/Arbeitsbl-tter/franzoesisch/index.html#home
