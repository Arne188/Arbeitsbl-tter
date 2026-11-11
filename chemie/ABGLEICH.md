# Chemie: Abgleich mit der Prüfungsvorbereitung

Stand: 11. November 2026. Grundlage ist die privat bereitgestellte Datei `04_Loesungen_und_Erwartungshorizont.pdf` (7 Seiten). Die Datei enthält Lösungen zu zehn Übungen und einen Erwartungshorizont zu fünf Bereichen einer Übungsklassenarbeit. Die Originalaufgaben liegen nicht vollständig vor; die folgenden Lernaufgaben sind eigenständige neue Aufgaben zu den erkennbaren Anforderungen. Die private Datei wird nicht veröffentlicht.

## Abdeckung

| Anforderung aus der Vorlage | Erklärung/Modell im Kurs | Üben und Prüfungstraining |
|---|---|---|
| Modellzeichen, Legende, Grenzen; Beobachtung und Erklärung; kleine/große Teilchen an einer Trennwand (S. 1, 5) | `modellregeln`, `stoff-teilchen`; neue Trennwandgrafik mit erhaltener Teilchenzahl | k05–k08, k21–k24, k45–k46; ep01–ep02 |
| Kandis: Herauslösen, Umgeben durch Wasser, Diffusion und Erhaltung; Lösen gegenüber Schmelzen (S. 1, 5–6) | `zuckerloesung`; drei Bilder mit jeweils 24 Wasser- und 8 Zuckerzeichen; mittlere Stufe 4 gelöste + 4 gebundene Zuckerzeichen | k33–k36, k47–k49; ep03 |
| Fairer Temperaturvergleich; schnelleres Verteilen belegt nicht höhere Löslichkeit aller Stoffe (S. 1, 5) | `diffusion-temperatur`; gezielte Variable, Kontrollbedingungen und Einfluss von Strömungen | k29–k32, k50–k51; ep08–ep09 |
| Duft: ständige ungeordnete Bewegung, kein Ziel, keine Bewegungsruhe nach Durchmischung; Luftströmung (S. 1–2) | `diffusion-verstehen`; vorhandenes bewegtes Gasmodell und Erklärung | k25–k28; ep15 |
| Zustände: Anordnung, Abstand, Bewegung, Anziehung, Form und Volumen (S. 2, 5) | `drei-zustaende`; ergänzte Merkmalstabelle | k09–k12; neue Zeichenaufgaben k52–k54, ep04–ep06 |
| Alle sechs Zustandsänderungen; Verdunsten (S. 2, 5) | `uebergaenge`; bestehende Grafik und vollständige Tabelle | k17–k20; ep07 |
| Erwärmen im nachgiebigen/starren Behälter; Druck als Kraft pro Fläche; Eisen dehnt sich aus (S. 3, 6) | `temperatur`, neu `gase-druck`; qualitative Gaswerkstatt mit drei Vergleichssituationen | k13–k16, k56–k57; ep11 |
| Gas komprimieren: 10 gleich große Zeichen im kleineren Raum, Wasser kaum komprimierbar, leerer Raum (S. 3, 6–7) | `gase-druck`; Kolbenbild mit zweimal 10 Zeichen | k55, k58; ep10–ep11 |
| R/H/G: reiner Zucker, reiner Sauerstoff, saubere Luft, Müsli, klares Meerwasser, Zuckerlösung (S. 3, 6) | `reinstoff-gemisch`; neue Dreiergrafik und Beispieltabelle mit klaren Bedingungen | k37–k40, k59; ep12 |
| Zutatenliste; einheitliches Aussehen und Produktname beweisen keine Reinheit (S. 4, 6) | `reinstoff-gemisch`; Getränk und Salz mit Zusatzstoff | k60–k61; ep13 |
| Homogene Mischung mit zwei unterscheidbaren Teilchenarten und Legende zeichnen (S. 3, 6) | `reinstoff-gemisch`; Zeichenwerkstatt und mögliche Vergleichszeichnung | k62; ep14 |

## Ergebnis der Überarbeitung

- 13 Lerneinheiten, 62 Lernaufgaben (vorher 11 und 44).
- Neuer zentraler Einstieg `chemie.html#/preparation` mit zehn Lernzielen und direkten Erklär-/Übungslinks.
- Eigenes passendes Prüfungstraining: `chemie.html#/exam/preparation`, 15 Aufgaben, 60 Punkte. Zeit 45–60 Minuten nur als Übungsvorschlag. Automatische und selbst eingeschätzte Punkte getrennt dargestellt; keine automatische Schulnote.
- Bisherige Vertiefungs-Probeklausur mit 13 Aufgaben und 60 Punkten bleibt inhaltlich erhalten und separat gespeichert.
- Zeichnungen erlauben Kreis-/Dreieckzeichen, Radieren, Erklärungstext, Mustervergleich und Selbstbewertung. Die feste Rasterhilfe ist kein Modell eines regelmäßigen Gasgitters. Gleichwertige andere Verteilungen sind richtig; keine automatische Bedeutungsprüfung der Zeichnung.
- Stofftrennung bleibt als zusätzliche Vertiefung verfügbar.

## Technische Prüfung

`node --test chemie/tests/core.test.cjs`: 10 Tests bestanden. Geprüft sind alle geschlossenen Lösungsschlüssel, ungültige Zeichendaten, Modell-Teilchenzahlen, unabhängige Prüfungsstände, alte Sicherungen und getrennte Selbsteinschätzung. Das ursprüngliche Speicherkennzeichen und Schema 1 bleiben erhalten. Neue Daten liegen zusätzlich in `prepExam`; bestehende Antworten behalten ihre IDs.

Die Gaswerkstatt ist qualitativ. Sie liefert keine realen Druckmesswerte und keine °C-Skala. Physischer Ausdruck und konkrete echte Mobilgeräte müssen getrennt betrachtet werden. Die HTML-Datei bleibt eigenständig ohne externe Skripte, Schriftarten oder Stylesheets.

Browserprüfung und Veröffentlichungsnachweis werden nach der Auslieferung ergänzt.
