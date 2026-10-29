# ACME Salary Management System

**Live demo: https://salary-management-t3d2.onrender.com**

> Hosted on Render's free tier: it sleeps when idle, so the first load can take 30–60 seconds, and edits reset when it restarts (the 10,000 employees are re-seeded on boot).

A web app that lets an HR Manager manage salary records for ~10,000 employees across multiple
countries and answer the question *"how do we pay people?"* without opening a spreadsheet.

| | |
|---|---|
| **Backend** | Ruby on Rails 8 (API mode), SQLite, Minitest |
| **Frontend** | React 19, TypeScript, Vite, Material UI, Recharts, Vitest + Testing Library |
| **Deploy** | Single Docker image on Render (Rails serves the API and the built React app) |

> Supporting docs: [Requirements](docs/01-requirements.md) · [Design & trade-offs](docs/02-design.md) ·
> [AI usage log](docs/03-ai-usage.md) · [Prompts](docs/05-prompts.md) · [Architecture diagrams](docs/06-architecture.md) · [Demo script](docs/04-demo-script.md)

---

## The problem

ACME's HR team keeps salary data for 10,000 employees in Excel files. Finding a person, correcting a
salary, or answering "what's the median engineering salary in Germany?" is slow and error-prone.

**Persona:** the HR Manager. Single trusted user, non-technical, wants fast lookup, safe edits and
numbers they can defend.

## Features

**Employee management**
- Create, edit and delete employees (name, email, job title, department, country, annual salary, hire date)
- Server-side search (name / email), filters (country, department, job title), column sorting, pagination
- Instant client-side validation backed by authoritative server-side validation

**Pay insights**
- Headcount, minimum, average, **median** and maximum salary, org-wide or filtered by country / department
- The same stats grouped by country, department or job title
- Salary distribution across USD bands, and a top-10 earners list
- Cross-country comparison normalised to USD, with local-currency medians shown per country

**Data & operations**
- Deterministic seed script: 10,000 realistic employees in about a second
- One-command Docker build; first boot creates and seeds the database

## Architecture

```
┌────────────────────┐   /api/*    ┌──────────────────────────────────────────────┐
│ React + MUI (Vite) │ ──────────▶ │ Rails API                                    │
│  Employees page    │             │  Controllers (thin)                          │
│  Insights page     │ ◀────────── │   ├─ EmployeeQuery  filter · sort · paginate │
└────────────────────┘    JSON     │   ├─ Insights       group · bands · top-N    │
                                   │   │    └─ SalaryStats  pure min/avg/median   │
                                   │   └─ Employee       validations              │
                                   │        └─ Countries  currency + USD rates    │
                                   └───────────────────┬──────────────────────────┘
                                                       ▼
                                                   SQLite
```

Key choices (full reasoning in [docs/02-design.md](docs/02-design.md)):

- **Integers for money.** Salary is an annual whole-unit integer in the employee's local currency. No float rounding bugs.
- **USD normalisation at read time.** Raw INR and EUR figures are not comparable, so insights convert through a static, documented rate table (`backend/app/lib/countries.rb`). Changing a rate needs no data migration.
- **Query and stats logic lives outside controllers.** `EmployeeQuery`, `Insights` and `SalaryStats` are plain Ruby objects that are unit-tested without HTTP. `SalaryStats` is pure, so median edge cases are trivial to test.
- **Safe by construction.** Sort columns are whitelisted, `LIKE` wildcards are escaped, the DB enforces `NOT NULL`, `salary > 0` and unique email.

## Getting started

Prerequisites: Ruby 3.3, Node 20+, SQLite.

```bash
git clone <repo-url> && cd <repo>

# 1. API  → http://localhost:3000
cd backend
bundle install
bin/rails db:setup          # creates the DB and seeds 10,000 employees (~1s)
bin/rails server

# 2. UI   → http://localhost:5173  (proxies /api to :3000)
cd ../frontend
npm install
npm run dev
```

Seeding options: `bin/rails db:seed` re-seeds (it replaces existing rows). Use `COUNT=500 bin/rails db:seed` for a
smaller set. The generator is seeded, so the same data comes out every time.

## Tests

```bash
cd backend  && bin/rails test    # model, query, stats, insights, controllers, seeder
cd frontend && npm test          # formatting, validation, API client, form behaviour
```

Tests are fast (about a second for the backend), deterministic (no network or clock dependence) and
use in-memory/transactional databases. The git history follows TDD: each feature is a `test: ... (red)` commit followed by the
`feat:` commit that makes it pass.

## API reference

All endpoints are under `/api`. Errors return `{ "errors": { "field": ["message"] } }`
(`422` validation, `404` not found, `400` bad request).

### Employees

| Method & path | Description |
|---|---|
| `GET /employees` | List. Params: `q`, `country`, `department`, `job_title`, `min_salary`, `max_salary`, `sort`, `dir`, `page`, `per_page` (max 100) |
| `GET /employees/:id` | Fetch one |
| `POST /employees` | Create. Body: `{ "employee": { ... } }` |
| `PATCH /employees/:id` | Update |
| `DELETE /employees/:id` | Delete (`204`) |
| `GET /meta` | Countries, departments, job titles for filters and forms |

```bash
curl "localhost:3000/api/employees?country=IN&q=patel&sort=salary&dir=desc&per_page=2"
```
```json
{
  "data": [{ "id": 17, "full_name": "Priya Patel", "country": "IN", "currency": "INR", "salary": 3150000, "...": "..." }],
  "meta": { "page": 1, "per_page": 2, "total": 61, "total_pages": 31 }
}
```

### Insights (USD-normalised)

All accept optional `country`, `department` and `job_title` filters.

| Endpoint | Returns |
|---|---|
| `GET /insights/summary` | `{ headcount, min, avg, median, max }` |
| `GET /insights/groups?by=country\|department\|job_title` | The same stats per group (country rows also include local-currency stats) |
| `GET /insights/distribution` | Headcount per salary band (`< 25k` … `200k+`) |
| `GET /insights/top?limit=10` | Top earners ranked by USD |

## Project structure

```
backend/
  app/models/employee.rb          validations, currency, USD conversion
  app/lib/countries.rb            supported countries, currencies, static USD rates
  app/queries/employee_query.rb   search / filter / sort / paginate
  app/services/                   Insights, SalaryStats
  app/controllers/                thin HTTP layer
  lib/employee_generator.rb       deterministic fake data
  lib/employee_seeder.rb          batched bulk insert
  test/                           mirrors app/ and lib/
frontend/
  src/api/                        typed client and shared types
  src/pages/                      EmployeesPage, InsightsPage
  src/components/                 EmployeeForm
  src/lib/                        format, validate, hooks
docs/                             requirements, design, AI log, demo script
Dockerfile, render.yaml           single-image deployment
```

## Performance

Measured locally on 10,000 rows (warm): employee list with search, filter and sort takes about 40 ms and the insights endpoints
about 70–140 ms. The filter columns and the salary column are indexed. Name search is a `LIKE '%q%'` scan, which is fine at this size
(SQLite FTS5 would be the next step).

## Deployment

The app ships as one Docker image: the React app is built into Rails' `public/`, so a single service serves both the UI and the API.
On first boot it creates the SQLite database and seeds 10,000 employees.

**Run the image locally**
```bash
docker build -t acme-salary .
docker run -p 3000:3000 -e SECRET_KEY_BASE=$(openssl rand -hex 32) -e FORCE_SSL=false acme-salary
```

**Deploy to Render**
1. Push the repo to GitHub.
2. In Render choose *New → Blueprint*, select the repo and apply [`render.yaml`](render.yaml). (Alternatively *New → Web Service* with Runtime = Docker, `SECRET_KEY_BASE` set, `FORCE_SSL=false` and health check path `/up`.)
3. Wait for the build, then open the service URL. `/up` is the health check.

Free-tier note: Render's disk is ephemeral and the service sleeps when idle. Because the API reseeds on boot, the demo recovers itself,
but edits made on the live demo do not persist across restarts.

## Scope decisions

Deliberately **not** built in v1 (reasoning in [docs/01-requirements.md](docs/01-requirements.md)):

- **Authentication / roles.** The brief has a single trusted HR persona and does not ask for login. It is the first thing to add
  before real salary data goes in (for example, a session login with an audit log).
- Salary history / audit trail, bonuses and equity, payroll runs
- Live FX rates (static table instead, for determinism)
- CSV/Excel import and export UI
- Pay-equity analysis by protected attributes (data we deliberately do not collect)

## How AI was used

Built with Claude Code in a test-first loop, with verification against running software (not only unit tests). Details,
including the mistakes caught along the way, are in [docs/03-ai-usage.md](docs/03-ai-usage.md).
