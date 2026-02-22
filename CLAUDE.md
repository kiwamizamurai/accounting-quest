# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server
npm run build         # Type-check + production build
npm run lint          # Type-check only (tsc --noEmit)
npm run test          # Run all tests (vitest watch)
npm run test:coverage # Run tests with v8 coverage report

# Run a single test file
npx vitest run tests/accounting.test.ts
```

## Architecture

**The Accounting Quest** is a visual novel educational game built with Phaser 3 + TypeScript. It teaches double-entry bookkeeping across three difficulty levels (Lv1: Lemonade Stand Ch.1-10, Lv2: Lemonade Corporation Ch.101-112, Lv3: Lemonade Group Ch.201-210).

### Scene Flow

`BootScene` → `TitleScene` → `LevelSelectScene` → `ChapterTitleScene` → `VNScene`

`VNScene` (`src/scenes/VNScene.ts`) is the main gameplay scene. It wires `ScriptEngine` callbacks to UI components and hosts the auto-save timer.

### VN Script Engine

Chapters are data-driven node graphs defined in `src/data/chapters/chapterN.ts`. Each chapter exports a `ChapterScript` with an array of typed `ScriptNode` objects linked by `id` → `next` strings.

`ScriptEngine` (`src/vn/ScriptEngine.ts`) executes these nodes and fires typed callbacks (`ScriptEngineCallback`) that `VNScene` handles. Node types are defined in `src/vn/types.ts`:

- `dialog`, `narration` – display text via i18n key
- `transaction` – records a journal entry and optionally animates it
- `choice` / `quiz` / `journal_entry_input` – interactive nodes
- `report` – shows BS or P&L panel
- `character_enter/exit`, `background`, `wait` – scene control
- `conditional`, `set_flag` – branching logic

### Accounting Core

`GameStateManager` (`src/state/GameStateManager.ts`) is a singleton (access via `getGameStateManager()`). It owns:
- `AccountingEngine` (`src/engine/accounting/AccountingEngine.ts`) – validates double-entry and computes Balance Sheet / Income Statement
- `TransactionProcessor` (`src/engine/accounting/TransactionProcessor.ts`) – creates typed `JournalEntry` objects
- `SaveLoadManager` (`src/state/SaveLoadManager.ts`) – localStorage persistence

Account identifiers use the `AccountCategory` enum from `src/models/Account.ts`. All transactions must balance (debits = credits).

### i18n

All visible text uses i18n keys resolved via `t(key)` from `src/i18n/`. Translation files are flat JSON (`src/i18n/ja.json`, `src/i18n/en.json`). Default language is Japanese (`ja`). Chapter dialog keys follow the pattern `ch1.dialog_1`.

### Adding a New Chapter

1. Create `src/data/chapters/chapterN.ts` exporting a `ChapterScript`
2. Add all dialog keys to both `ja.json` and `en.json`
3. Import and register the chapter in `src/scenes/VNScene.ts` (in `create()` where `allChapters` is assembled)

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and Vite).

### Tests

Tests live in `tests/` and use vitest + jsdom. Phaser is mocked via `tests/setup.ts`. Tests cover `AccountingEngine` (double-entry validation, balance sheet math) and `GameStateManager` state transitions.
