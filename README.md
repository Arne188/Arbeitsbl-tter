# Lernwelten · Klasse 6

Gemeinsame Fächerauswahl für die interaktiven Lernseiten:

- **Biologie:** Blütenpflanzen, Blütenaufbau und Lebensformen, Wurzelhaare, Bestäubung und Befruchtung. 10 Einheiten, 43 Übungen und Probeklausur.
- **Chemie:** Teilchenmodell, Aggregatzustände, Diffusion, Lösen, Gemische und Trennverfahren. 11 Einheiten, 44 Übungen und Probeklausur.
- **Werte und Normen:** Glück und Lebensgestaltung, Zukunftswünsche, Erfolg und Misserfolg, Verantwortung. 12 Einheiten, 36 Übungen, vier Prüfungsmodule, Gesamtabfrage und eine Probeklausur mit 60 Punkten.

## Öffnen

`index.html` ist die Startseite. Jedes Fach kann direkt im Browser geöffnet oder über den Downloadlink als eigenständige HTML-Datei offline genutzt werden. Installation oder Anmeldung sind zum Lernen nicht erforderlich.

## Lernstand

Jedes Fach speichert unter einem eigenen Browser-Schlüssel. Export und Import über „Sichern & Laden“ funktionieren innerhalb des jeweiligen Fachs. Eine Sicherung der bisherigen Offline-Datei kann in der entsprechenden Online-Lernwelt importiert werden. Beim Wechsel von einer lokalen Datei zu einer anderen Webseitenadresse wird der Browserstand nicht automatisch übertragen. Es gibt keine Cloud-Synchronisation und keine Übertragung der Antworten an einen Server.

Freie Antworten und Zeichnungen werden anhand der Muster- bzw. Beispielantworten selbst eingeschätzt. Es gibt keinen verbindlichen Notenschlüssel. Curriculare Einordnung, zusätzliche Vertiefungen und Quellen stehen in den jeweiligen Lernwelten.

## GitHub Pages

Die Dateien liegen fertig im Repository-Stamm. Die Veröffentlichung benötigt keinen Build und keine Abhängigkeiten. Unter **Settings → Pages → Build and deployment** als Quelle **Deploy from a branch**, den Branch **main** und den Ordner **/(root)** auswählen und speichern. `.nojekyll` sorgt für die unveränderte statische Auslieferung. Nach der Erstaktivierung veröffentlicht GitHub weitere Änderungen automatisch.

## Dateien

- `index.html`, `portal.css`: Startseite
- `biologie.html`, `chemie.html`, `werte-und-normen.html`: eigenständige Lernwelten
- `subjects.json`: Themen- und Umfangsübersicht
- `.nojekyll`: statische Auslieferung über GitHub Pages

Die HTML-Dateien enthalten bereits ihre Bilder, Stile und Programme. Neue Fächer können mit einer weiteren HTML-Datei und einer Karte auf der Startseite ergänzt werden.
