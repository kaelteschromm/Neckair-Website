---
name: neckair-security-audit
description: Passives Sicherheitsaudit der NECKAIR-Website nach OWASP WSTG und ASVS. Verwenden für Sicherheitsprüfungen von Code, Abhängigkeiten, Headern und Deployment. Nie aktive Angriffe gegen Produktivsysteme.
---
# Security-Audit

## Grundsätze
- Nur passiv: Code lesen, `npm audit`, Header per `curl -sI` abfragen. Keine Exploits, kein Fuzzing, keine Last.
- Secrets nie ausgeben, nur Fundort nennen.

## Checkliste
| Bereich | Prüfung | Referenz |
|---|---|---|
| XSS | `grep -rn "dangerouslySetInnerHTML\|innerHTML\|eval(\|new Function" src` – nur JSON-LD aus eigenen Daten zulässig | WSTG-CLNT-01, ASVS V5 |
| Links | `target="_blank"` mit `rel="noopener noreferrer"` | WSTG-CLNT-04 |
| CSP | Meta-CSP in `layout.tsx`; `connect-src` nur self + Formular-Endpunkt | ASVS V14.4 |
| Header | HSTS, X-Frame-Options/frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy (Cloudflare) | WSTG-CONF-07, -12 |
| HTTPS | http → https-Weiterleitung, TLS ≥ 1.2 | WSTG-CRYP-01 |
| Abhängigkeiten | `npm audit`, `npm outdated` | ASVS V14.2 |
| Secrets | `git grep -nIE "(api[_-]?key|secret|token|password)\s*[:=]"` | ASVS V2.10 |
| Actions | minimale `permissions`, gepinnte Actions | – |
| Formular | Honeypot, Längenbegrenzung, Validierung, HTTPS-Endpunkt, Datenminimierung | WSTG-INPV, ASVS V5.1 |
| Backend | statischer Export: keine API-Routen (`find src/app -name "route.ts"`) | – |

## Bericht
`NECKAIR-SECURITY-REPORT.md`: Zusammenfassung, Befunde nach Schwere (Kritisch/Hoch/Mittel/Niedrig/Info), je Befund Nachweis, Risiko, Abhilfe, Status (behoben/offen/benötigt Zustimmung).
