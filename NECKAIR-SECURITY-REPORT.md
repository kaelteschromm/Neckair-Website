# NECKAIR – Sicherheitsbericht

**Stand:** 16.11.2026 · **Methode:** passive Prüfung nach OWASP WSTG / ASVS: Code-Review, `npm audit`, `git grep` und Git-Historie, Header- und TLS-Abfrage der Live-Seite per `curl`/`openssl`. Keine Angriffe, kein Fuzzing, keine Formular-Absendungen.
**Prüfer:** unabhängiger Security-Auditor-Agent (`.claude/agents/security-auditor.md`). Die Behebung hat der implementierende Agent übernommen.

## Zusammenfassung

**Im Code wurde keine ausnutzbare Schwachstelle gefunden.**
- Die Website ist ein rein statischer Export: kein Backend, keine API-Routen, keine Datenbank, keine Datei-Uploads, keine Logins.
- `npm audit` meldet 0 Schwachstellen.
- In Repo und Git-Historie wurden keine Secrets gefunden.

**Die relevanten Risiken liegen in der Auslieferung (Cloudflare und GitHub Pages):**
- HTTP wird nicht auf HTTPS umgeleitet.
- Es gibt keine Sicherheits-Header.
- TLS 1.0 und 1.1 sind noch erlaubt.
- Die Strecke von Cloudflare zu GitHub ist vermutlich unverschlüsselt.

Das lässt sich nur im Cloudflare- bzw. GitHub-Dashboard beheben (Anleitung unten) und **braucht deine Zustimmung bzw. deinen Zugang**.

## Befunde

### Kritisch
Keine.

### Hoch
| ID | Befund | Nachweis | Status |
|---|---|---|---|
| S-01 | HTTP wird nicht auf HTTPS umgeleitet. Die Seite mit dem Kontaktformular ist im Klartext abrufbar und wäre damit manipulierbar. | `curl -sI http://xn--hnig-0ra.com/` → `200 OK` | **Offen, Cloudflare:** „Always Use HTTPS“ |

### Mittel
| ID | Befund | Nachweis | Status |
|---|---|---|---|
| S-02 | Kein HSTS-Header | Live-Header | **Offen, Cloudflare** |
| S-03 | TLS 1.0 und 1.1 werden akzeptiert | `openssl s_client -tls1` | **Offen, Cloudflare:** Minimum TLS 1.2 |
| S-04 | Keine Content Security Policy | Live-Header, Build | **Teilweise behoben:** Meta-CSP in `src/app/layout.tsx`. Verbindungen nur zur eigenen Domain und zu Formspree, keine Fremdskripte, `object-src 'none'`, `base-uri 'self'`. Offen: CSP zusätzlich als Header über Cloudflare (nötig für `frame-ancestors`) |
| S-05 | Strecke Cloudflare → GitHub Pages vermutlich unverschlüsselt (SSL-Modus „Flexible“, Origin-Zertifikat `*.github.io`) | `openssl s_client` gegen die Origin | **Offen, GitHub und Cloudflare** (vermutet, im Dashboard prüfen) |

### Niedrig
| ID | Befund | Status |
|---|---|---|
| S-06 | Kein Clickjacking-Schutz (`frame-ancestors`, `X-Frame-Options`) | **Offen, Cloudflare.** Per Meta-Tag technisch nicht möglich |
| S-07 | `X-Content-Type-Options`, `Referrer-Policy` und `Permissions-Policy` fehlen | **Teilweise behoben:** Referrer-Policy als Meta-Tag. Rest offen in Cloudflare |
| S-08 | Spam-Schutz nur im Browser, Spamfeld (Honeypot) wurde nicht an Formspree übermittelt | **Behoben im Code:** `_gotcha` wird mitgesendet, Längenbegrenzung auf allen Feldern. **Offen bei Formspree:** Domain-Beschränkung und Spam-Filter aktivieren |
| S-09 | Workflow-Rechte global, Actions nur per Tag gepinnt | **Behoben:** Schreibrechte nur im Deploy-Job, Actions auf Commit-SHA gepinnt, Dependabot (`.github/dependabot.yml`) |

### Info
| ID | Befund | Status |
|---|---|---|
| S-10 | JSON-LD ohne `<`-Escaping (heute nicht ausnutzbar, Daten sind statisch) | **Behoben:** `<`-Escaping |
| S-11 | Bibliothek drei enthält Adressen für Umgebungs-Presets eines Fremd-CDN (ungenutzt) | Akzeptiert. Die CSP blockiert solche Abrufe, die Regel steht im Skill |
| S-12 | `Access-Control-Allow-Origin: *` (Standard bei GitHub Pages) | Akzeptiert (öffentliche statische Inhalte) |
| S-13 | Keine `security.txt` | **Behoben:** `public/.well-known/security.txt` |
| S-14 | Private Gmail-Adresse öffentlich, Platzhalter im Impressum | Offen: geschäftliche Adresse und echte Daten nötig |
| S-15 | Lokaler Testserver lauschte auf allen Netzwerk-Interfaces und stürzte bei kaputten URLs ab | **Behoben:** bindet an 127.0.0.1, fängt Fehler ab |
| S-16 | Neue Hauptversionen von motion, eslint und typescript verfügbar | Kein Sicherheitsdruck. Später geplant aktualisieren (Dependabot) |
| S-17 | Live-Stand (9.11.) entspricht nicht dem geprüften Arbeitsstand | Nach dem Deployment die Header-Prüfung wiederholen |

Bereits während der Arbeit behoben:
- **sharp 0.34.5:** Hochrisiko-Lücken in libvips/libheif/librsvg (GHSA-f88m-g3jw-g9cj u. a.). Auf 0.35.5 aktualisiert, `npm audit` meldet 0.
- **Next.js** auf den Patch 16.4.6 gehoben.

## Positiv
- Keine `innerHTML`-, `eval`- oder `document.write`-Stellen. Alle externen Links haben `rel="noopener noreferrer"` (per Unit-Test geprüft).
- Die Weiterleitungsseiten der alten Website haben feste Ziele, eine offene Weiterleitung ist nicht möglich.
- Keine Fremdressourcen beim Seitenaufruf (per E2E-Test geprüft), Schriften lokal, keine Source-Maps im Build.
- Deploy per OIDC ohne gespeicherte Secrets, kein `pull_request`-Trigger.
- Eigene 404-Seite ohne Serverdetails, `.git/` nicht erreichbar, TLS 1.3 aktiv.

## Anleitung: Cloudflare und GitHub (braucht deinen Zugang)

1. **GitHub → Repo Neckair-Website → Settings → Pages:** „Enforce HTTPS“ aktivieren. Falls es ausgegraut ist: In Cloudflare unter *DNS* die Einträge der Domain kurz auf „DNS only“ (graue Wolke) stellen, warten, bis GitHub das Zertifikat ausgestellt hat, dann wieder „Proxied“.
2. **Cloudflare → SSL/TLS → Overview:** Modus **Full (strict)**.
3. **Cloudflare → SSL/TLS → Edge Certificates:**
   - Always Use HTTPS: **On**
   - Minimum TLS Version: **1.2**
   - TLS 1.3: **On**
   - Automatic HTTPS Rewrites: **On**
   - HSTS: aktivieren, zunächst `max-age` 1 Monat, *preload* aus (wegen des späteren Wechsels zu neckair.de)
4. **Cloudflare → Rules → Transform Rules → Response Header Transform Rule** (alle Anfragen), jeweils „Set static“:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://formspree.io data: blob:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io; frame-ancestors 'none'; upgrade-insecure-requests
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=(), fullscreen=(self)
   Cross-Origin-Opener-Policy: same-origin
   ```
   `'unsafe-inline'` ist nötig, weil der statische Next.js-Export Inline-Skripte enthält. Empfehlung: die CSP zuerst eine Woche als `Content-Security-Policy-Report-Only` ausrollen.
5. **Datenschutzrelevante Cloudflare-Schalter** (siehe Datenschutzbericht):
   - *Scrape Shield → Email Address Obfuscation:* **Off**
   - Network Error Logging abschalten, falls verfügbar
   - Web Analytics/Browser Insights **aus** lassen
   - Bot Fight Mode nur nach Abwägung (kann Cookies setzen)
6. **Formspree-Dashboard:** Formular auf die eigene Domain beschränken, Spam-Filter aktivieren.

Kontrolle danach:
```
curl -sI http://xn--hnig-0ra.com/                          # 301 → https
curl -sI https://xn--hnig-0ra.com/                         # Header vorhanden
openssl s_client -connect xn--hnig-0ra.com:443 -tls1_1      # Handshake muss scheitern
```
