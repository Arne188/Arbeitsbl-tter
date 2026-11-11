# Französisch · Abschlussprüfung der Anwendung

Geprüft am 11. November 2026. Ausgangsstand: Commit `38706e14b44abfda0179d4ed1826b1ebb8ed06c2`.

## Ergebnis

Der Kurs ist für den vorgesehenen Anfangsstoff einsatzbereit. Die technische Abschlussprüfung von Schritt 7 wurde durchgeführt. Die bisherigen inhaltlichen Grenzen bleiben bestehen: Buchseiten 8–37, kein vollständiger Jahres- oder A1-Kurs, keine automatische Bewertung freier französischer Texte und keine zugesicherte Audiobibliothek.

## Nachweise

| Bereich | Prüfung und Ergebnis |
|---|---|
| Quellenstand | Alle 30 lokal übernommenen Repository-Dateien vor Änderungen bytegenau gegen die GitHub-Blob-SHAs geprüft. |
| Auswertung und Daten | Alle 33 vorhandenen Node-Tests bestanden, vor und nach den Abschlusskorrekturen. Enthalten sind Lösungsschlüssel, falsche Antworten, Akzente, Punktgewichte, freie Rubriken, alte Sicherungen, beschädigte Imports und voneinander unabhängige Prüfungen. |
| Vollständige Navigation | Auf der öffentlichen Seite alle 42 Lektionen und sämtliche 336 Lernschritte geöffnet. Überschrift und Schrittinhalt vorhanden; keine doppelten DOM-IDs, sichtbaren undefined-Texte oder horizontal überlaufende Dokumente in der Desktopansicht. |
| Prüfungszugang | Alle 15 Prüfungen mit zusammen 199 Aufgaben geöffnet. Eine leere Abgabe wird in jeder Prüfung blockiert; vorher erscheinen keine Auswertungslösungen. |
| Probeklausur A | Alle 20 Aufgaben über die sichtbaren Eingabefelder ausgefüllt. Entwurf nach Neuladen vollständig. Nach Abgabe 40/40 automatische Punkte; Bereiche 8/8, 20/20, 12/12. Zwei unterschiedliche Schreibkriterien gewählt: 3/20 separat selbst eingeschätzte Punkte, zwei von zehn Kriterien bewertet; nach Neuladen erhalten. |
| Übungsrückmeldung | M1 mit absichtlich falscher Antwort, Hinweis und anschließender Korrektur durchgespielt. Richtige Rückmeldung kennzeichnet weiterhin die vorherige Hilfe/Korrektur. Satzbausteine über die Schaltflächen zusammengesetzt und korrekt bewertet. |
| Sicherung | JSON-Datei über „Sichern & Laden“ exportiert. Eine Antwort anschließend geändert. Dieselbe Sicherung über Dateiauswahl, Vorschau und Bestätigung importiert: ursprüngliche Antwort sowie Klausurstand wiederhergestellt. |
| Zeichenleiste | In einer Texteingabe aus caf durch den é-Knopf café erzeugt; Zeichen nach Neuladen erhalten. Der DOM-Wert eines bereits gerenderten value-Attributs wurde dabei nicht mit dem aktuellen Eingabewert verwechselt. |
| Schmale Ansicht | Öffentliche Testansicht mit 375-Pixel-Rahmen, zunächst 373 Pixel innerer Breite und 358 Pixel Inhalt wegen Rand/Scrollbar. Alle neun Modulübersichten einschließlich ihrer Werkstätten über die normale Navigation geöffnet; kein horizontal überlaufendes Dokument. M1/M2-Lektionsschritte zusätzlich stichprobenartig geöffnet und die Startansicht visuell kontrolliert. |
| Offline-Paket | Die veröffentlichte eigenständige HTML-Fassung geöffnet; Startansicht funktioniert, keine externen Skript- oder Stylesheet-Dateien. Automatische Tests prüfen eigenständiges HTML ohne externe Skript-/Stylesheet-Dateien, identische Inhaltsmodule und gültige enthaltene Skripte. Nach der Korrektur neu gebündelt und erneut geprüft. |
| Druck | Druck-Schaltfläche der ausgefüllten Probeklausur ausgelöst und Druck-CSS für Merkkarten/Auswertung geprüft. Ein physischer Ausdruck und eine seitenweise PDF-Druckvorschau wurden nicht nachgewiesen. |
| Fachliche Stichprobe | Merkkarten aus allen neun Modulen geprüft: Gesprächsrolle, Genus/Anzahl, c’est, Subjekt, Intonationsfrage, Herkunft/Aufenthalt, il y a, bestimmte Artikel bei Vorlieben sowie Buchstabieren. Das ersetzt keine externe vollständige fachredaktionelle Prüfung aller Texte. |

## Korrekturen in Schritt 7

- In den sechs freien Abschlussaufgaben „vier Kriterien“ zu „fünf Kriterien“ berichtigt. Die Aufgaben zeigen jeweils fünf Kriterien; Punkte und Speicherung bleiben gleich.
- Veraltete Ankündigung von Schritt 7 in der Kursinformation und im README aktualisiert.
- Offline-Datei sowie die Inhaltskennungen der geänderten Online-Dateien neu erzeugt.
- `tests/viewports.html` als wiederverwendbare Ansicht für schmale Inhaltsbreiten ergänzt. Diese Entwicklerseite verwendet den normalen lokalen Französischstand. Vor Testeingaben einen eigenen Lernstand sichern. Der Rahmen ist in der endgültigen Fassung als content-box dimensioniert.

## Grenzen und Wiederholung

Die Browserprüfungen verwenden erfundene Texte und einen separaten Prüfbrowser. Keine Antworten von Lernenden wurden veröffentlicht. Die drei anderen Fachdateien bleiben bytegleich. Browserprüfungen beziehen sich auf Chromium; Safari, Firefox, echte Android-/iOS-Geräte und konkrete französische Systemstimmen sind nicht separat geprüft.

Nach Änderungen am Kurs:

```sh
node franzoesisch/tools/bundle.cjs
node --test franzoesisch/tests/core.test.cjs
```

Danach Navigation, Aufgabenrückmeldung, eine Klausurabgabe und Sicherung/Import im Browser wiederholen. Für schmale Ansichten `tests/viewports.html` öffnen und die gewünschte Breite sowie Online-/Offline-Fassung auswählen. Der aktuelle Veröffentlichungsnachweis steht in `STATUS.md`.

## Prüfung nach der Veröffentlichung

Quellcommit `7e5b2d4c705e61007b13a94f49c0d96e3e90b5eb`, Pages-Lauf `43026095964` erfolgreich. Online-Einstieg, Anwendungscode, Abschlussinhalte, Offline-Paket und Testansicht sind öffentlich mit HTTP 200 und identischen Bytes ausgeliefert. Alle 336 Lernschritte danach erneut mit Warten auf die jeweils passende aktive Schritt-Route geöffnet. Der alte Klausurstand 40/40 plus 3/20 Selbstbewertung blieb erhalten, die Erklärung nennt jetzt fünf Kriterien.

In der endgültigen Testansicht hat der Rahmen tatsächlich 375 Pixel innere Breite; die Klausurauswertung mit allen zehn Kriterien benötigt 360 Pixel Dokumentbreite. Bei 390 Pixeln innerer Breite benötigt sie 375 Pixel Dokumentbreite. Die Offline-Startansicht bei 390 Pixeln läuft ebenfalls ohne horizontalen Dokumentüberlauf. Diese Unterschiede entstehen durch die vertikale Browser-Scrollbar.

Der Rückweg über „Alle Fächer“ zeigt die vier Fachkarten einschließlich Französisch und der Offline-Links. 27 interne Dateiverweise in Portal, Kurseinstieg und Offline-Paket auf vorhandene Ziele geprüft. Biologie, Chemie und Werte und Normen sind gegenüber dem Ausgangsstand bytegleich.
