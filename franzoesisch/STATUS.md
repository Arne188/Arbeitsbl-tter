# Französisch · Arbeitsstand

Stand: 9. November 2026. **Schritt 1 ist umgesetzt. Als Nächstes folgt Schritt 2: M2 und M3.**

## Fertiger Umfang

- Ein gemeinsamer Kurs mit eigenem Einstieg aus der vorhandenen Fächerauswahl.
- M1 vollständig: fünf Lektionen mit je acht Lernschritten. Gesprächsrollen je/tu; Name und Apostroph; Aussage und Intonationsfrage; Befinden; j’ai … ans; sinnvoll zusammenhängender Dialog.
- 35 Lernaufgaben: 34 geschlossen und eine freie Dialogwerkstatt. Pro Lektion Entdeckungsaufgabe, drei geführte Übungen, eine Anwendung und zwei Mini-Check-Aufgaben.
- Modulprüfung mit neun automatisch bewerteten Aufgaben und einem eigenen Dialog. Vier Selbstbewertungskriterien werden separat angezeigt.
- Verständliche deutsche Grammatikerklärungen, gelöste Beispiele in aufdeckbaren Schritten, fünf druckbare Merkkarten, eigene SVG-Zeichnung, kleine Lautfenster.
- Auswahlfragen, Satzbausteine, begrenzte Texteingaben und eigene Texte mit Kriterien. Gestufte Tipps, gezielte Fehlerrückmeldungen und Lösungen auf Wunsch.
- Transparente Bearbeitungsstände: gelesen / begonnen / wiederholen / nach Hilfe oder Korrektur geprüft / beide Mini-Checks ohne Hilfe im ersten Versuch richtig.
- Eigener Speicherbereich `bonjour-franzoesisch-klasse6-v1`, JSON-Export und Import mit Vorschau, Akzentleiste, mobile Navigation.
- Zusätzlich selbständige Offline-Fassung, aus den modularen Quellen erzeugt.

## Verbindliche Stoffgrenzen

Grundlage sind 30 bereitgestellte Fotos der Buchseiten 8–37 (C’est parti, Unité 1, Module 1). Eigene Texte und Zeichnungen, keine öffentliche Reproduktion der Buchseiten. Kein Vokabeltrainer: benötigte Wortbedeutungen und Zahlwörter bleiben sichtbar. Kein vollständiger Jahreskurs oder vollständiger A1-Kurs.

Je m’appelle / tu t’appelles sowie j’ai … ans sind zunächst erklärter Anfangsstoff. Daraus entsteht in M1 kein vollständiger s’appeler-, avoir- oder -er-Konjugationskurs. Die vollständigen Personalpronomen und être folgen in M4. Die curriculare Grundlage ist das niedersächsische Kerncurriculum Französisch 2025 (Jahrgänge 6–10; A1-Ziel am Ende von Jahrgang 7). Quellen stehen in der Kursansicht „Zum Kurs“.

## Geprüft

- Elf automatische Tests für alle geschlossenen Lösungsschlüssel, fehlende/alternative Apostrophe, NFC und signifikante Akzente, erwartbare Fehler, Hilfen und Erstversuche, getrennte Prüfungsbewertung, Export/Import, fremde und beschädigte Sicherungen, neue Modul-IDs und Offline-Datei.
- Drei zusätzliche Integrationsprüfungen für die Fächerauswahl, relative Links und die unveränderten Programme der bisherigen Fächer.
- Browser: Einstieg und Lektionsschritte, falsche/richtige Antwort mit Tipp, Satzbausteine, Neu laden mit Wiederherstellung, Akzentleiste, komplette Modulprüfung (9/9), getrennte Selbsteinschätzung und Wiederherstellung nach Neu laden.
- Dateiexport und erneuter Import einschließlich Vorschau und Bestätigung im Browser erfolgreich.
- Schmale Ansicht mit 390-Pixel-Frame (375 Pixel Inhaltsbreite wegen Scrollleiste): Einstieg, Erklärung, Navigation und beide Mini-Check-Aufgaben getestet; kein seitliches Überlaufen des Dokuments. Fortschrittsanzeige nach Prüfung direkt aktualisiert.
- GitHub Pages erfolgreich veröffentlicht (Lauf 42640264274, Quellcommit 9b589d0c2aa81fc51594b53d126472c62ce17025). Öffentliche Fächerauswahl mit vier Fächern und der darin verlinkte Französischkurs im Browser geprüft; erste Lektion auf der öffentlichen Seite geöffnet. Direktlink: https://arne188.github.io/Arbeitsbl-tter/franzoesisch/index.html.

## Bekannte Grenzen

- M2–M9 sind ausdrücklich geplant. Gemischte Checks, Gesamtabfrage und zwei Probeklausuren sind noch nicht enthalten.
- Offene Texte erhalten keine vorgetäuschte automatische Sprachkorrektur. Hinterlegte kurze Satzantworten akzeptieren definierte Varianten; ein freier Dialog wird anhand von Kriterien selbst geprüft.
- Vorlesen verwendet nur eine verfügbare französische Systemstimme. Ohne passende Stimme erscheint ein Hinweis. Es gibt noch keine eigenen Audiodateien und keine originale Buchaufnahme; Textaufgaben funktionieren ohne Ton.
- Kein geräteübergreifender Cloud-Lernstand. Browser können lokale Speicherung sperren; dann wird die Dateisicherung angeboten. Alte beschädigte Daten werden erst nach ausdrücklicher Auswahl durch einen neuen Stand ersetzt.
- Drucklayout für Merkkarten vorhanden; die Druckausgabe wurde noch nicht als PDF visuell geprüft.

## Nächste Etappe: Schritt 2

M2 „Nomen, Artikel und Mehrzahl“ (etwa fünf Lektionen) und M3 „Personen und Dinge vorstellen“ (etwa vier Lektionen) vollständig ausarbeiten. Dazu Modulprüfungen M2/M3 und erster gemischter Check. Neue Artikel-/Satzwerkstatt mit klarer Erklärung von Genus und Numerus, le/la/l’/les, Elision vor Vokal bzw. h muet, Singular/Plural und c’est/ce sont. Mon ami/mon amie nur als nötiger begrenzter Baustein, ohne ganzen Possessivkurs.

Beim Fortsetzen zuerst Repository-Stand und diese Datei lesen. Danach vorhandene Quellen erweitern, stabile IDs und Speicherformat erhalten, Offline-Fassung neu bauen, alte Sicherung gegen zusätzliche Module testen und den Stand aktualisieren. Keine erneute Grundsatzplanung nötig.

## Dateien und Prüfungen

- `modules/m1.js`: eigener Unterrichtsinhalt und geprüfte Lösungsschlüssel; weitere Module später eigene Dateien.
- `core.js`: reine Auswertung, Fortschritt, Speicherung und Importprüfung.
- `app.js`: Darstellung, Bedienung, lokale Sicherung und optionale Systemstimme.
- `style.css`, `index.html`: Gestaltung und Einstieg.
- `tools/bundle.cjs`: erzeugt `offline.html`, ohne externe Abhängigkeiten.
- `tests/core.test.cjs`: `node --test franzoesisch/tests/core.test.cjs` im Repository-Stamm.

Schema 1 bleibt bei reinen Inhaltserweiterungen erhalten. Vorhandene und auch bislang unbekannte gültige Modul-IDs überstehen den Import; Antworten werden beim Anzeigen anhand des aktuellen Lösungsschlüssels erneut geprüft. Eine neue Schema-Version braucht eine echte Migration, keinen pauschalen Reset.
