## Project Overview

This repository contains The Accounting Quest, a visual novel educational game built with Phaser 3 and TypeScript. The game teaches double-entry bookkeeping across three difficulty levels: Level 1 (Lemonade Stand Chapters 1-10), Level 2 (Lemonade Corporation Chapters 101-112), and Level 3 (Lemonade Group Chapters 201-210).

## Development Commands

To start the Vite development server, run: npm run dev

To perform type-checking and create a production build, run: npm run build

To run type-checking only without building, run: npm run lint (which executes tsc --noEmit)

To run all tests in watch mode, run: npm run test

To run tests with a v8 coverage report, run: npm run test:coverage

To run a single test file, use: npx vitest run tests/accounting.test.ts

## Scene Flow Architecture

The game follows this scene progression: BootScene leads to TitleScene, which leads to LevelSelectScene, then ChapterTitleScene, and finally VNScene.

VNScene (located in src/scenes/VNScene.ts) is the main gameplay scene. It wires ScriptEngine callbacks to UI components and hosts the auto-save timer.

## VN Script Engine

Chapters are data-driven node graphs defined in src/data/chapters/chapterN.ts. Each chapter exports a ChapterScript containing an array of typed ScriptNode objects linked by id and next string references.

ScriptEngine (src/vn/ScriptEngine.ts) executes these nodes and fires typed callbacks (ScriptEngineCallback) that VNScene handles. Node types are defined in src/vn/types.ts and include:

Dialog and narration nodes display text via i18n keys. Transaction nodes record journal entries and optionally animate them. Choice, quiz, and journal_entry_input nodes provide interactive gameplay. Report nodes show Balance Sheet or Profit & Loss panels. Character_enter, character_exit, background, and wait nodes control scene presentation. Conditional and set_flag nodes enable branching logic.

## Accounting Core

GameStateManager (src/state/GameStateManager.ts) is a singleton accessed via getGameStateManager(). It owns the AccountingEngine, TransactionProcessor, and SaveLoadManager.

AccountingEngine (src/engine/accounting/AccountingEngine.ts) validates double-entry bookkeeping and computes Balance Sheet and Income Statement reports.

TransactionProcessor (src/engine/accounting/TransactionProcessor.ts) creates typed JournalEntry objects.

SaveLoadManager (src/state/SaveLoadManager.ts) handles localStorage persistence.

Account identifiers use the AccountCategory enum from src/models/Account.ts. All transactions must balance with debits equaling credits.

## Internationalization (i18n)

All visible text uses i18n keys resolved via t(key) from src/i18n/. Translation files are flat JSON located at src/i18n/ja.json and src/i18n/en.json. The default language is Japanese (ja). Chapter dialog keys follow the pattern ch1.dialog_1.

## Adding a New Chapter

To add a new chapter, first create src/data/chapters/chapterN.ts that exports a ChapterScript. Then add all dialog keys to both ja.json and en.json translation files. Finally, import and register the chapter in src/scenes/VNScene.ts in the create() method where allChapters is assembled.

## Path Alias Configuration

The path alias @/* maps to src/* and is configured in tsconfig.json and Vite configuration.

## Testing

Tests are located in the tests/ directory and use vitest with jsdom. Phaser is mocked via tests/setup.ts. Tests cover AccountingEngine (double-entry validation and balance sheet math) and GameStateManager state transitions.