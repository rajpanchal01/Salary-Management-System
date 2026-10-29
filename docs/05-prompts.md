# Prompts and instructions given to the AI

Tool: Claude Code. These are the real prompts from the build, in order, lightly shortened where marked.
They show the working pattern: I set the goal and constraints, review each slice, then redirect.

| # | Prompt (author's words) | What it drove |
|---|---|---|
| 1 | The full assessment brief, pasted as-is (goal, persona, 10,000 employees, backend + UI, seed script, tests, incremental commits, artifacts) | Requirements doc first, then stack choice and plan |
| 2 | "i want ruby on rails as backend" | Switched the backend from an initial TypeScript/Express plan to Rails 8 API + SQLite before any code was committed |
| 3 | "please continue with next steps" | Employees API, then insights, seed script, React UI, deployment, docs, each as a verified slice |
| 4 | "run it on local" / "kill" | Started and stopped both servers to check the app running for real |
| 5 | Asked for step-by-step commits that follow a TDD approach, short messages, no co-author line, plus a more descriptive README | History rebuilt as test-first slices; README rewritten |
| 6 | "i think commits are too much, we should have it around 20 max, combine it and make the commit msg a bit more descriptive" | 34 commits squashed to 18 with fuller messages |
| 7 | "should i push 2 separate repo or 1 repo is fine with both?" | Decision to keep one monorepo; deployment later simplified to a single Render service serving both UI and API |
| 8 | "do we need user login section here? if needed and asked in requirements then we should implement" | Checked the brief: auth is not requested, so it stays out of scope and is documented as a v2 item |

## Standing constraints I gave the AI
- Rails for the backend; React for the UI with a component library (MUI).
- Test-first, with fast deterministic tests that are easy to read.
- Short commit messages, no co-author trailer, no more than about 20 commits.
- Verify against the running system, not only unit tests (see "where I corrected the AI" in [03-ai-usage.md](03-ai-usage.md)).
- Do not build what the brief does not ask for (for example, login).

## Prompt-writing notes
- Early direction changes (stack) are cheap; I made the Rails decision before the first commit.
- Short, specific follow-ups ("combine it, max 20") worked better than re-describing the whole task.
- Requirements came first, so every later feature had a stated reason to exist or to be left out.
