# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server (http://localhost:5173)
npm run build         # Type-check + production build
npm run preview       # Preview production build locally
npm run lint          # Type-check only (tsc --noEmit, strict mode)
npm run test          # Run all tests (vitest watch mode)
npm run test:ui       # Run tests with Vitest UI (http://localhost:51204)
npm run test:coverage # Run tests once with v8 coverage report (html in coverage/)
npm run deploy        # Build and deploy to gh-pages (requires gh-pages CLI)

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

All visible text uses i18n keys resolved via `t(key)` from `src/i18n/`. Translation files are flat JSON:
- `src/i18n/ja.json` (Japanese)
- `src/i18n/en.json` (English)

Default language is Japanese (`ja`). Chapter dialog keys follow the pattern `ch1.dialog_1`. New text must be added to both language files.

### Adding a New Chapter

1. Create `src/data/chapters/chapterN.ts` exporting a `ChapterScript` with typed nodes array
2. Structure typically includes:
   - `narration` – scene-setting text
   - `dialog` – character speech
   - `transaction` – journal entries with optional animations
   - `choice` / `quiz` / `journal_entry_input` – interactive prompts (choice/quiz require action in handler, journal_entry_input validates player input)
   - `report` – show Balance Sheet or P&L snapshot
   - `character_enter/exit`, `background` – scene setup
   - `conditional` – branch logic based on flags
3. Add all i18n keys (dialog, narration, choice labels) to both `src/i18n/ja.json` and `src/i18n/en.json`
4. Register the chapter in `src/scenes/VNScene.ts`:
   - Import it at the top
   - Add to `allChapters` array in `create()` method
5. Game configuration is in `src/config/chapters.config.ts` if chapter metadata (title, level) is needed

### Configuration

Key config files:
- `src/config/game.config.ts` – Phaser game options (canvas size, physics, etc.)
- `src/config/chapters.config.ts` – Chapter metadata registry (titles, levels, unlock order)
- `src/config/constants.ts` – Game-wide constants (animation durations, UI positions, etc.)

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and Vite).

### Tests

Tests live in `tests/` and use vitest + jsdom. Phaser is mocked via `tests/setup.ts`. Tests cover `AccountingEngine` (double-entry validation, balance sheet math) and `GameStateManager` state transitions.

### Testing with Chrome DevTools MCP

Chrome DevTools MCP allows AI agents to directly control and inspect the browser for end-to-end verification of game behavior. This is useful for testing gameplay flow, UI interactions, financial calculations, and visual rendering.

**Setup:**

1. Pre-configured in `.mcp.json` (for Claude Code) and `.junie/mcp.json` (for Junie)
2. Requires Node.js v22+ and Chrome browser (stable or later)

**Usage:**

1. Start the dev server with `npm run dev`
2. The AI agent connects to Chrome via Chrome DevTools MCP automatically
3. Available verifications:
   - `take_screenshot` – confirm visual rendering of scenes, dialogs, UI panels
   - `take_snapshot` – inspect DOM structure and element states
   - `list_console_messages` – verify no errors/warnings during gameplay
   - `evaluate_script` – check game state (e.g., `getGameStateManager().getBalanceSheet()`)
   - `click`, `fill`, `press_key` – simulate player interactions (advancing dialogs, making choices)
   - `list_network_requests` – verify no unexpected API calls or resource load failures

**Example workflow:**
1. Navigate to game scene
2. Take screenshot to verify chapter renders correctly
3. Click to advance dialog, take screenshot to confirm text updated
4. Execute script to check accounting engine validation
5. Verify no console errors
