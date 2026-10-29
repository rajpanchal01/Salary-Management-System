# Design & Trade-offs

## Architecture
```
React (MUI) ──/api/*──▶ Rails controllers ──▶ EmployeeQuery / Insights / SalaryStats ──▶ SQLite
                              └──▶ Employee (validations) ──▶ Countries (static currency + USD rates)
```
- **Controllers** are thin: parse params, call a query/service object, render JSON.
- **EmployeeQuery** owns filtering, whitelisted sorting, pagination (testable without HTTP).
- **Insights** + **SalaryStats** own the analytics; `SalaryStats` is pure (no DB) so median/avg edge cases are trivially unit-tested.
- **Countries** is the single place for currency and FX assumptions.

## Decisions
| Decision | Why | Cost / revisit when |
|---|---|---|
| Salary stored as integer in local currency | No float money errors; matches how HR thinks | No sub-unit amounts; fine for annual salary |
| USD conversion at read time with static rates | Rates change without migrations; deterministic tests | Not historical-accurate; add rate table + effective dates if needed |
| Insights aggregated in Ruby after one `pluck` | Simple, testable median/bands; ~100 ms for 10k rows | Move to SQL/materialised views at ~100x scale |
| Offset pagination with `id` tiebreaker | Simple, stable ordering, supports "jump to page" | Keyset pagination if deep paging gets slow |
| Sort column whitelist, `LIKE` wildcard escaping | Prevents SQL injection / accidental wildcard search | — |
| Seed uses `insert_all!` in batches | 10k rows in <1s | Skips model validation; generator only emits valid data (tested) |
| `/api/meta` for filter options | One tiny call keeps UI in sync with data | Cache if it ever shows up in profiles |
| One Docker image (Rails serves React) | One deploy, no CORS, simplest ops | Split to CDN + API if traffic grows |
| SQLite in production | Zero-ops; fits single-user internal tool | Move to Postgres for multi-user / durability; ephemeral disk on free hosting means the demo re-seeds on boot |

## Performance
Measured locally (dev mode, 10,000 rows, warm): employee list with search+filter+sort ≈ 40 ms,
insights endpoints ≈ 70–140 ms. Indexes on `email` (unique), `country`, `department`, `job_title`, `salary`.
Name search uses `LIKE '%q%'` (not index-assisted); fine at this size, FTS5 would be the upgrade.

## Testing strategy
- Backend: model validations, query object, stats maths, insights semantics (incl. USD ranking vs raw local amounts), controllers, seeder determinism. All in-memory/fast, no network.
- Frontend: pure logic (format, validation), API client contract, form behaviour.
- Bugs caught by verification rather than by tests first are noted in the AI log.

## Known gaps (deliberate, see requirements)
No auth, no audit trail/salary history, no CSV import/export, static FX rates, no end-to-end browser test.
