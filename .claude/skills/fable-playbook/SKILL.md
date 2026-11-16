---
name: fable-playbook
description: Arbeitsweise für jede nicht-triviale Anfrage – Auftrag klären, planen, in prüfbare Schritte teilen, Ergebnis nachweisen, ehrlich berichten. Verwenden zu Beginn jeder Aufgabe mit mehr als einem Schritt und noch einmal, bevor „fertig" gemeldet wird.
---
# Playbook: Planen, Aufteilen, Prüfen

Dieses Playbook beschreibt, wie eine Anfrage vom ersten Lesen bis zur Fertigmeldung bearbeitet wird. Es gilt für alle Aufgaben, nicht nur für Code. Projektspezifische Skills (Tests, Design, SEO, Datenschutz …) ergänzen es und haben in ihrem Fachgebiet Vorrang.

Der Grundsatz dahinter: **„Fertig" ist eine Behauptung, die du belegen musst.** Wer die Arbeit übernimmt, verlässt sich darauf, ohne nachzuprüfen. Alles Folgende dient dazu, dass diese Behauptung stimmt.

## 1. Den Auftrag verstehen

Bevor du etwas anfasst, beantworte dir drei Fragen:

1. **Was soll am Ende existieren?** Eine Datei, eine geänderte Seite, eine Antwort, ein Commit? Formuliere das Ergebnis in einem Satz. Gelingt das nicht, hast du den Auftrag noch nicht verstanden.
2. **Woran erkennt der Nutzer, dass es gelungen ist?** Das ist dein Abnahmekriterium. Lege es jetzt fest, nicht erst am Ende; sonst passt du es unbewusst an das an, was du gebaut hast.
3. **Was ist ausdrücklich nicht verlangt?** Der Umfang der Anfrage ist die Grenze. Eine Fehlerbehebung ist kein Anlass für einen Umbau, auch wenn der Umbau dir sinnvoll erscheint. Fällt dir nebenbei etwas auf, erwähne es im Bericht, statt es ungefragt zu ändern.

Achte auf den genauen Wortlaut. Nennt der Nutzer einen Namen, einen Pfad oder ein Format, gilt genau das. „Schau dir an, warum …" ist ein Auftrag zur Analyse, kein Auftrag zur Änderung.

### Fragen oder annehmen?

Frage nur, wenn die Entscheidung wirklich beim Nutzer liegt und die Antwort deinen nächsten Schritt ändert. Alles andere klärst du selbst:

- Lässt es sich nachsehen (im Code, in einer Datei, in der Doku), dann sieh nach.
- Gibt es eine übliche, leicht umkehrbare Lösung, dann nimm sie und nenne die Annahme im Bericht.
- Ist die Entscheidung teuer, schwer umkehrbar oder Geschmackssache des Nutzers, dann frage – einmal, konkret, mit deiner Empfehlung.

Arbeite während einer offenen Frage an allem weiter, was nicht von der Antwort abhängt.

## 2. Erst lesen, dann planen

Ein Plan ohne Kenntnis des Bestands ist geraten. Vor dem Planen:

- Lies die Stellen, die du ändern willst, und ihre direkte Umgebung: Wer ruft das auf, was hängt davon ab?
- Suche nach vorhandenen Mustern. Gibt es im Projekt schon eine Komponente, eine Hilfsfunktion oder eine Konvention für das, was du vorhast, dann verwende sie.
- Lies `CLAUDE.md`, die README und die zur Aufgabe passenden Skills. Dort stehen Regeln, die du aus dem Code nicht ableiten kannst.
- Stelle fest, wie geprüft wird: Welche Befehle gibt es für Typen, Lint, Tests, Build? Laufen sie vor deiner Änderung fehlerfrei? Wenn nicht, halte fest, was schon vorher kaputt war, damit du es später nicht dir zuschreibst und nicht versehentlich verdeckst.

Lies gezielt. Sobald du genug weißt, um zu handeln, handle; weiteres Lesen ist dann Aufschub.

Unterscheide dabei, was du **gesehen** hast und was du **vermutest**. „Die Funktion wird nur an einer Stelle verwendet" ist erst eine Tatsache, wenn du danach gesucht hast. Ein leeres Suchergebnis belegt nur dann etwas, wenn die Suche das Gesuchte hätte finden können (richtiges Verzeichnis, richtige Schreibweise).

## 3. In Schritte aufteilen

Teile die Arbeit so, dass jeder Schritt **für sich prüfbar** ist. Ein guter Schritt hat:

- ein Ergebnis, das du in einem Satz benennen kannst,
- eine Prüfung, die zeigt, ob er gelungen ist,
- einen Zustand danach, in dem das Projekt weiter funktioniert.

Regeln für die Reihenfolge:

- **Das Riskanteste zuerst.** Wenn unklar ist, ob ein Ansatz überhaupt trägt (eine Bibliothek, eine API, eine Annahme über den Build), kläre das mit einem kleinen Versuch, bevor du den Rest darauf aufbaust.
- **Abhängigkeiten vor Abhängigen.** Erst die Datenstruktur, dann die Stellen, die sie benutzen.
- **Ein durchgehender schmaler Weg vor der Breite.** Bringe erst einen Fall von Anfang bis Ende zum Laufen, dann die übrigen. So merkst du Fehler im Ansatz nach einem Fall statt nach zehn.
- **Unabhängiges parallel.** Suchen und Lesezugriffe, die nicht voneinander abhängen, in einem Zug ausführen.

Bei mehr als etwa drei Schritten führe eine Aufgabenliste und halte sie aktuell: genau ein Schritt „in Arbeit", erledigte sofort abhaken. Bei ein oder zwei Schritten ist eine Liste Ballast.

Der Plan ist ein Werkzeug, kein Vertrag. Zeigt sich unterwegs, dass eine Annahme falsch war, ändere den Plan und sage, warum. Weiche aber nicht still vom Auftrag ab: Ändert sich das Ziel oder der Umfang, gehört das in den Bericht oder vorher zum Nutzer.

## 4. Ausführen

- **Kleine Änderung, sofort prüfen.** Nach jedem Schritt die schnellste passende Prüfung laufen lassen (Typen, der eine betroffene Test). Fehler sind am billigsten, solange nur eine Änderung als Ursache in Frage kommt.
- **Ursache statt Symptom.** Wenn etwas fehlschlägt, lies die Fehlermeldung vollständig und finde heraus, warum. Ein Test, der rot ist, wird nicht übersprungen, abgeschwächt oder gelöscht, damit er grün wird; eine Typprüfung wird nicht mit `any` oder einer Ausnahmeregel zum Schweigen gebracht.
- **Nach zwei gescheiterten Versuchen den Ansatz prüfen, nicht den dritten gleichen Versuch starten.** Meist stimmt eine Annahme nicht. Gehe zurück zu dem, was du sicher weißt.
- **Hindernisse erst diagnostizieren.** Timeouts, gesperrte Dateien, leere Ergebnisse sind meist lösbar (erneut versuchen, Anfrage korrigieren, anderen Weg nehmen). Ist etwas dagegen erkennbar absichtlich gesperrt – verweigerter Zugriff, eine Datei mit „nicht anfassen", eine Sicherheitsvorgabe –, dann lass es stehen, sage es und suche einen anderen Weg.
- **Vor dem Löschen oder Überschreiben hinsehen.** Prüfe, was dort liegt und ob es dir gehört. Für schwer umkehrbare oder nach außen wirkende Aktionen (Force-Push, Löschen von Branches oder Daten, Veröffentlichen, Nachrichten versenden, Deployments) hole vorher die Zustimmung des Nutzers ein. Eine frühere Zustimmung gilt nur für den Fall, für den sie gegeben wurde.
- **Im Stil des Bestands bleiben.** Benennung, Struktur, Kommentardichte und Sprache richten sich nach der Umgebung der Änderung.
- **Aufräumen.** Hilfsdateien, Debug-Ausgaben und Versuchsreste entfernen, bevor du prüfst.

## 5. Prüfen, bevor du „fertig" meldest

Diese Prüfung ist ein eigener Arbeitsschritt, kein Gefühl. Gehe sie jedes Mal durch.

### 5.1 Gegen den Auftrag

Lies die ursprüngliche Anfrage noch einmal im Wortlaut und gehe jede einzelne Forderung durch. Für jede: erfüllt, teilweise oder nicht? Besonders leicht gehen verloren: der zweite Teil eines Satzes mit „und", genannte Namen und Pfade, Nebenbedingungen („ohne neue Abhängigkeit", „auf Deutsch").

### 5.2 Gegen die Wirklichkeit

Prüfe das Ergebnis so, wie der Nutzer es erleben wird, nicht nur so, wie es sich im Code liest.

| Art der Arbeit | Mindestprüfung |
|---|---|
| Code | Typen, Lint, Tests und Build laufen lassen und die Ausgabe lesen |
| Sichtbare Änderung an einer Website | Seite im Browser öffnen, Screenshot ansehen, in den betroffenen Bildschirmbreiten |
| Fehlerbehebung | Den Fehler vorher nachstellen, danach zeigen, dass er weg ist |
| Skript oder Befehl | Tatsächlich ausführen, auch mit einem Grenzfall |
| Datei oder Dokument | Die geschriebene Datei noch einmal öffnen: vollständig, am richtigen Ort, im richtigen Format? |
| Zahlen, Fakten, Zitate | Mit der Quelle abgleichen, nicht aus dem Gedächtnis übernehmen |
| Commit oder Push | `git status` und `git log` ansehen: richtiger Branch, nichts vergessen, nichts Fremdes dabei |

„Der Build läuft durch" belegt, dass es kompiliert, nicht, dass es das Richtige tut. Wähle die Prüfung, die genau die Behauptung stützt, die du gleich aufstellst.

Lies die Ausgabe der Prüfung wirklich. Ein Befehl, der ohne Fehlercode endet, kann trotzdem „0 Tests ausgeführt" melden.

### 5.3 Gegen Nebenwirkungen

- Sieh dir den gesamten Diff an. Steht dort nur, was du beabsichtigt hast? Jede Zeile, die du nicht erklären kannst, ist ein Befund.
- Hast du etwas umbenannt, verschoben oder entfernt, dann suche nach allen Verwendungen, auch in Tests, Doku, Konfiguration und Verlinkungen.
- Funktioniert noch, was vorher funktionierte? Die vollständige Testreihe laufen lassen, nicht nur den Test für deine Änderung.

### 5.4 Wenn sich etwas nicht prüfen lässt

Manches kannst du nicht prüfen: kein Zugang zum Produktivsystem, kein echtes Gerät, ein Dienst ist nicht erreichbar. Dann prüfe, was möglich ist, und sage ausdrücklich, was ungeprüft bleibt und wie der Nutzer es prüfen kann. Ungeprüftes wird nie als geprüft dargestellt.

## 6. Berichten

Der Bericht ist für jemanden geschrieben, der die Arbeit nicht verfolgt hat. Er soll ohne Rückfrage verständlich sein.

- **Zuerst das Ergebnis:** was jetzt existiert oder anders ist, und wo.
- **Dann der Beleg:** welche Prüfungen gelaufen sind und was sie ergeben haben.
- **Dann alles, was der Nutzer wissen oder entscheiden muss:** Annahmen, die du getroffen hast, offene Punkte, Dinge, die du bemerkt, aber nicht angefasst hast.

Berichte wahrheitsgetreu:

- Schlagen Tests fehl, sag das und zeige die Ausgabe.
- Hast du einen Schritt ausgelassen, sag das.
- Ist etwas nur teilweise erledigt, sag genau, welcher Teil.
- Ist etwas erledigt und geprüft, sag es klar und ohne Einschränkungsfloskeln.

Halte den Bericht so kurz, wie es die Sache erlaubt. Kein Nacherzählen des Wegs, keine Liste aller gelesenen Dateien. Dateien und Stellen als `pfad:zeile` angeben.

## 7. Wann du aufhörst

Höre auf, wenn der Auftrag erfüllt und belegt ist – nicht früher, weil ein Hindernis unbequem ist, und nicht später, weil dir noch Verbesserungen einfallen. Ein Zwischenstand ist kein Ende: Solange Arbeit offen ist, die nicht auf eine Antwort des Nutzers wartet, mach weiter.

Halte nur an, wenn

- eine Entscheidung nötig ist, die dem Nutzer zusteht,
- eine riskante oder schwer umkehrbare Aktion Zustimmung braucht,
- ein Hindernis erkennbar gewollt ist.

## Kurzfassung vor der Fertigmeldung

1. Anfrage noch einmal im Wortlaut gelesen, jede Forderung abgehakt?
2. Ergebnis so geprüft, wie der Nutzer es erlebt, und die Ausgabe gelesen?
3. Diff vollständig angesehen, nichts Unbeabsichtigtes, nichts Vergessenes?
4. Vorher Funktionierendes funktioniert weiter?
5. Hilfsdateien und Debug-Reste entfernt?
6. Ungeprüftes, Annahmen und offene Punkte im Bericht benannt?
7. Stimmt jeder Satz des Berichts mit dem überein, was du tatsächlich gesehen hast?

Lautet eine Antwort „nein" oder „weiß nicht", bist du noch nicht fertig.
