# Contributing to The Accounting Quest

Thanks for your interest in improving The Accounting Quest. This guide covers how to report problems, set up a development environment, and get a change merged.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report an accounting or content error.** A wrong journal entry, a misleading explanation, or a quiz with the wrong answer is the most valuable kind of bug in a teaching game. Use the "Accounting / content error" issue template.
- **Report a bug.** Crashes, stuck dialogs, broken save/load, rendering problems.
- **Add or improve a chapter.** See [Adding or editing a chapter](#adding-or-editing-a-chapter).
- **Improve translations.** Text lives in `src/i18n/ja.json` and `src/i18n/en.json`.
- **Improve tests and docs.**

For anything larger than a small fix, please open an issue first so we can agree on the approach before you spend time on it.

## Development setup

Requires Node.js 20.19 or newer.

```bash
git clone https://github.com/<your-username>/accounting-quest.git
cd accounting-quest
npm install
npm run dev        # http://localhost:3000
```

The README lists every npm script.

## Before you open a pull request

```bash
npm run lint                        # type check (tsc --noEmit, strict mode)
npx vitest run                      # unit tests
npx playwright install chromium     # first time only
npm run test:e2e                    # end-to-end tests, starts the dev server for you
```

CI runs the same checks (Unit Tests and E2E Tests) on every pull request. Both must pass before a merge.

## Workflow

1. Fork the repository and create a branch from `main`, for example `fix/quiz-answer-ch6` or `feat/chapter-113`.
2. Keep the change focused. One topic per pull request.
3. Write commit messages with a type prefix, as in the existing history: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
4. Open a pull request against `main` and fill in the template. For UI changes, include a screenshot.

## Adding or editing a chapter

Chapters are data-driven node graphs. The details are in the "VN Script Engine" and "Adding a New Chapter" sections of [CLAUDE.md](CLAUDE.md). In short:

1. Create `src/data/chapters/chapterN.ts` exporting a `ChapterScript`.
2. Add every new i18n key to **both** `src/i18n/ja.json` and `src/i18n/en.json`. Keys follow the pattern `ch1.dialog_1`.
3. Register the chapter in `src/scenes/VNScene.ts` (import it and add it to `allChapters`) and in `src/config/chapters.config.ts`.
4. Use the existing numbering: Level 1 is chapters 1-10, Level 2 is 101-112, Level 3 is 201-210.

Rules that apply to all content:

- **Every transaction must balance.** Debits equal credits. The accounting engine rejects unbalanced entries, and the E2E suite plays through all chapters and checks that the books balance.
- **No hard-coded text.** All visible text goes through `t(key)`.
- **Keep the accounting correct and consistent.** If a treatment differs between standards or countries (for example FIFO vs LIFO), say which one the chapter follows.

## Code style

- TypeScript in strict mode. Use the `@/` alias for imports from `src/`.
- Match the style of the surrounding code, including comment density and naming.
- Please do not add runtime dependencies without discussing them in an issue first.

## Licensing

By submitting a contribution you agree that it is licensed under the [MIT License](LICENSE), the same as the rest of the project.
