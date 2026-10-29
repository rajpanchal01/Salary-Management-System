# Salary Management System — Requirements

## Goal
Give ACME's HR Manager one web app that replaces the salary spreadsheets for ~10,000
employees in many countries, so they can (1) keep salary records accurate and
(2) answer "how do we pay people?" in seconds instead of pivot-tabling.

## Persona
Single persona: **HR Manager**. Trusted, internal, non-technical. Cares about
speed of lookup, correctness of edits, and defensible numbers.

## In scope (v1)
| Area | Feature | Why |
|---|---|---|
| Records | Create / view / edit / delete employees (name, email, job title, department, country, annual salary in local currency, hire date) | Replaces the spreadsheet rows |
| Finding | Server-side search (name/email), filter (country, department, job title), sort, pagination | 10k rows cannot be shipped to the browser |
| Insights | Headcount, min / avg / median / max salary, overall and grouped by country, department, job title | The core "how do we pay people" questions |
| Insights | Salary distribution (bands) and top-paid list | Spot outliers and compression |
| Insights | Cross-country comparison normalised to USD | Raw local-currency numbers are not comparable |
| Data | Seed script generating 10,000 realistic employees (deterministic) | Required; also makes demos reproducible |

## Deliberately left out (and why)
- **Authentication / roles** — single trusted persona; adds weight without answering the brief. First v2 item before real data goes in.
- **Payroll, bonuses, equity, salary history / audit trail** — different problem (pay *runs*); history is valuable but doubles the data model. v2.
- **Live FX rates** — non-deterministic external dependency. A static, documented rate table is used; one file to update.
- **Excel import/export UI** — migration is a one-off; the seed script stands in for it. CSV export is a cheap v2 add.
- **Multi-tenant, i18n, approval workflows, notifications** — no evidence they're needed for one HR manager.
- **Pay-equity analysis by gender/ethnicity** — sensitive data we do not collect.

## Key decisions & assumptions
- Salary = **annual gross, whole units of the employee's local currency** (integer; no float money bugs).
- One employee = one country = one currency (ISO 4217).
- Insights are aggregated server-side from one narrow column pluck (~10k rows, a few ms), normalised to USD; keeps median/band logic simple and unit-testable. Revisit with SQL aggregation if the org grows 100x.
- USD normalisation applied at query time from a static rate table, so changing rates needs no data migration.

## Stack
Ruby on Rails 8 (API mode) + SQLite, Minitest; React + Vite + TypeScript UI with a component library.

## Non-functional targets
- List/search/insight responses < 200 ms on 10k rows locally.
- Validation at model level; DB enforces integrity (NOT NULL, CHECK salary > 0, UNIQUE email, indexes on filter columns).
- Core logic covered by fast, deterministic tests.

## Success criteria
HR manager can find any employee in < 10 s, edit a salary in < 30 s, and read the
org's pay by country/department/job title without leaving the app.
