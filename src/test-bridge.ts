/**
 * Test bridge module for E2E testing.
 * Exposes a programmatic API to drive the ScriptEngine through chapters
 * without Phaser UI, verifying scenario completion and accounting correctness.
 *
 * Only loaded in development mode (import.meta.env.DEV).
 */
import { ScriptEngine, ScriptEngineCallback } from './vn/ScriptEngine';
import { getGameStateManager, initGameStateManager } from './state/GameStateManager';
import { ChapterScript } from './vn/types';

// Import all chapters
import { chapter1 } from './data/chapters/chapter1';
import { chapter2 } from './data/chapters/chapter2';
import { chapter3 } from './data/chapters/chapter3';
import { chapter4 } from './data/chapters/chapter4';
import { chapter5 } from './data/chapters/chapter5';
import { chapter6 } from './data/chapters/chapter6';
import { chapter7 } from './data/chapters/chapter7';
import { chapter8 } from './data/chapters/chapter8';
import { chapter9 } from './data/chapters/chapter9';
import { chapter10 } from './data/chapters/chapter10';
import { chapter101 } from './data/chapters/chapter101';
import { chapter102 } from './data/chapters/chapter102';
import { chapter103 } from './data/chapters/chapter103';
import { chapter104 } from './data/chapters/chapter104';
import { chapter105 } from './data/chapters/chapter105';
import { chapter106 } from './data/chapters/chapter106';
import { chapter107 } from './data/chapters/chapter107';
import { chapter108 } from './data/chapters/chapter108';
import { chapter109 } from './data/chapters/chapter109';
import { chapter110 } from './data/chapters/chapter110';
import { chapter111 } from './data/chapters/chapter111';
import { chapter112 } from './data/chapters/chapter112';
import { chapter201 } from './data/chapters/chapter201';
import { chapter202 } from './data/chapters/chapter202';
import { chapter203 } from './data/chapters/chapter203';
import { chapter204 } from './data/chapters/chapter204';
import { chapter205 } from './data/chapters/chapter205';
import { chapter206 } from './data/chapters/chapter206';
import { chapter207 } from './data/chapters/chapter207';
import { chapter208 } from './data/chapters/chapter208';
import { chapter209 } from './data/chapters/chapter209';
import { chapter210 } from './data/chapters/chapter210';

const chapterMap = new Map<number, ChapterScript>([
  [1, chapter1], [2, chapter2], [3, chapter3], [4, chapter4], [5, chapter5],
  [6, chapter6], [7, chapter7], [8, chapter8], [9, chapter9], [10, chapter10],
  [101, chapter101], [102, chapter102], [103, chapter103], [104, chapter104],
  [105, chapter105], [106, chapter106], [107, chapter107], [108, chapter108],
  [109, chapter109], [110, chapter110], [111, chapter111], [112, chapter112],
  [201, chapter201], [202, chapter202], [203, chapter203], [204, chapter204],
  [205, chapter205], [206, chapter206], [207, chapter207], [208, chapter208],
  [209, chapter209], [210, chapter210],
]);

const noopCallbacks: ScriptEngineCallback = {
  onDialog: () => {},
  onChoice: () => {},
  onTransaction: () => {},
  onReport: () => {},
  onNarration: () => {},
  onCharacterEnter: () => {},
  onCharacterExit: () => {},
  onBackgroundChange: () => {},
  onWait: () => {},
  onChapterEnd: () => {},
  onQuiz: () => {},
  onJournalEntryInput: () => {},
};

export interface PlayChapterResult {
  completed: boolean;
  nodesVisited: number;
  balanceSheet: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netIncome: number;
    isBalanced: boolean;
  };
  incomeStatement: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
  completedChapters: number[];
  playerExp: number;
  errors: string[];
}

function buildResult(
  completed: boolean,
  nodesVisited: number,
  errors: string[],
): PlayChapterResult {
  const gameState = getGameStateManager();
  const bs = gameState.getBalanceSheet();
  const is = gameState.getIncomeStatement();
  return {
    completed,
    nodesVisited,
    balanceSheet: {
      totalAssets: bs.totalAssets,
      totalLiabilities: bs.totalLiabilities,
      totalEquity: bs.totalEquity,
      netIncome: bs.netIncome,
      isBalanced: bs.isBalanced,
    },
    incomeStatement: {
      totalRevenue: is.totalRevenue,
      totalExpenses: is.totalExpenses,
      netIncome: is.netIncome,
    },
    completedChapters: [...gameState.getPlayer().completedChapters],
    playerExp: gameState.getPlayer().exp,
    errors,
  };
}

/**
 * Play through a chapter programmatically using the ScriptEngine.
 * Always selects the first choice option and the correct quiz/journal answer.
 * Shares the global GameStateManager so accounting state accumulates across chapters.
 */
function playChapter(chapterId: number): PlayChapterResult {
  const gameState = getGameStateManager();
  const engine = new ScriptEngine(gameState);

  const chapter = chapterMap.get(chapterId);
  if (!chapter) {
    return buildResult(false, 0, [`Chapter ${chapterId} not found`]);
  }

  engine.registerChapter(chapter);
  engine.setCallbacks(noopCallbacks);
  engine.startChapter(chapterId);

  const errors: string[] = [];
  let nodesVisited = 0;
  const MAX_NODES = 500;

  for (let i = 0; i < MAX_NODES; i++) {
    const node = engine.getCurrentNode();
    if (!node) {
      errors.push(`No current node after ${nodesVisited} nodes`);
      break;
    }

    nodesVisited++;

    switch (node.type) {
      case 'chapter_end':
        // completeChapter was already called by executeCurrentNode
        return buildResult(true, nodesVisited, errors);

      case 'dialog':
      case 'narration':
      case 'character_enter':
      case 'character_exit':
      case 'background':
      case 'wait':
      case 'report':
      case 'transaction':
        engine.advance(node.next);
        break;

      case 'choice':
        engine.selectChoice(0);
        break;

      case 'quiz':
        engine.answerQuiz(node.correctIndex);
        break;

      case 'journal_entry_input':
        engine.submitJournalEntry(node.expectedEntries);
        break;

      default:
        errors.push(`Unexpected node type at ${(node as any).id}`);
        break;
    }
  }

  return buildResult(false, nodesVisited, [...errors, 'Max iterations reached']);
}

// Expose on window for Playwright access
declare global {
  interface Window {
    __TEST_BRIDGE__: {
      playChapter: typeof playChapter;
      initGameStateManager: typeof initGameStateManager;
      getGameStateManager: typeof getGameStateManager;
    };
  }
}

window.__TEST_BRIDGE__ = {
  playChapter,
  initGameStateManager,
  getGameStateManager,
};
