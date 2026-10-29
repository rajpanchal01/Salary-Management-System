# How AI was used

Tool: Claude Code (agentic CLI), driven by me turn by turn. I set direction and constraints; the agent wrote code, ran tests and verified behaviour.

## Workflow
1. Gave the assessment brief; asked for the requirements doc first and committed it before any code.
2. Redirected stack early: the agent's initial TypeScript/Express backend plan was replaced with **Ruby on Rails** at my request, before any backend code was committed.
3. Built in vertical, test-first slices, one commit each: model → employees API → insights → seed → UI → deploy.
4. Required real verification, not just "tests pass": measured endpoint timings on 10k rows, ran the built Docker image and curled it.

## Representative prompts
- "I want Ruby on Rails as backend."
- "Please continue with next steps" (after reviewing the plan: API → insights → seed → UI → deploy → docs).

## Where I had to correct or verify the AI
- **JSON gem incompatibility** (`quirks_mode` error with json 3.x on this Rails): found via failing tests, pinned `json ~> 2.10`.
- **Committed junk**: the generated app had no `.gitignore`, so logs, SQLite DB and bootsnap cache were tracked; removed from history going forward.
- **SPA fallback bug**: `/insights` returned 404 inside the Docker image. A lenient test (`[200, 404]`) had masked it; found by curling the container, fixed the route constraint and tightened the tests.
- **Performance claim**: initial dev-mode numbers looked slow (cold start); re-measured warm before documenting.
- **MUI API drift**: system props on `Stack`/`Typography` no longer type-check; moved to `sx`.

## Commit history
The first pass produced 9 broad commits. I then asked for the history to be restructured into smaller test-first slices and later
squashed to a shorter, more descriptive set. The code did not change in that process; only how it is grouped. Commit timestamps are the real ones.
The full list of prompts is in [05-prompts.md](05-prompts.md).

## What I did not delegate
Choosing scope and the "left out" list, USD-normalisation as the basis for comparison, and what counts as "done" (running it end to end).
