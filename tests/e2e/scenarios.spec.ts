import { test, expect, Page } from '@playwright/test';

/**
 * E2E scenario tests for The Accounting Quest.
 *
 * Each level's chapters are played through programmatically via the test bridge,
 * which drives the ScriptEngine with no-op Phaser callbacks.
 * This verifies:
 *   - Every chapter's node graph can be traversed to completion (chapter_end reached)
 *   - The balance sheet equation holds (Assets = Liabilities + Equity + NetIncome)
 *   - No NaN or negative-total anomalies in accounting data
 */

interface PlayChapterResult {
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

async function waitForTestBridge(page: Page) {
  await page.goto('/');
  await page.waitForFunction(
    () => typeof window.__TEST_BRIDGE__ !== 'undefined',
    { timeout: 15_000 },
  );
}

async function initLevel(page: Page, level: 1 | 2 | 3) {
  await page.evaluate((lv) => {
    window.__TEST_BRIDGE__.initGameStateManager('TestPlayer', lv);
  }, level);
}

async function playChapter(page: Page, chapterId: number): Promise<PlayChapterResult> {
  return page.evaluate((id) => window.__TEST_BRIDGE__.playChapter(id), chapterId);
}

function assertChapterResult(result: PlayChapterResult, chapterId: number) {
  // Chapter must complete
  expect(result.completed, `Chapter ${chapterId} did not reach chapter_end`).toBe(true);
  expect(result.errors, `Chapter ${chapterId} had errors: ${result.errors.join(', ')}`).toHaveLength(0);
  expect(result.nodesVisited, `Chapter ${chapterId} visited no nodes`).toBeGreaterThan(0);

  // Balance sheet must be balanced (the fundamental accounting equation)
  const bs = result.balanceSheet;
  expect(bs.isBalanced, `Chapter ${chapterId}: BS not balanced — A=${bs.totalAssets} L=${bs.totalLiabilities} E=${bs.totalEquity} NI=${bs.netIncome}`).toBe(true);

  // No NaN values
  expect(Number.isFinite(bs.totalAssets), `Chapter ${chapterId}: totalAssets is not finite`).toBe(true);
  expect(Number.isFinite(bs.totalLiabilities), `Chapter ${chapterId}: totalLiabilities is not finite`).toBe(true);
  expect(Number.isFinite(bs.totalEquity), `Chapter ${chapterId}: totalEquity is not finite`).toBe(true);
  expect(Number.isFinite(bs.netIncome), `Chapter ${chapterId}: netIncome is not finite`).toBe(true);

  const is = result.incomeStatement;
  expect(Number.isFinite(is.totalRevenue), `Chapter ${chapterId}: totalRevenue is not finite`).toBe(true);
  expect(Number.isFinite(is.totalExpenses), `Chapter ${chapterId}: totalExpenses is not finite`).toBe(true);
}

// ---------------------------------------------------------------------------
// Level 1: Lemonade Stand (Chapters 1–10)
// ---------------------------------------------------------------------------
test.describe('Level 1 — Lemonade Stand', () => {
  const chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test('all chapters complete with balanced accounting', async ({ page }) => {
    await waitForTestBridge(page);
    await initLevel(page, 1);

    for (const chapterId of chapters) {
      const result = await playChapter(page, chapterId);
      assertChapterResult(result, chapterId);

      // Verify the chapter was recorded as complete
      expect(
        result.completedChapters,
        `Chapter ${chapterId} not in completedChapters`,
      ).toContain(chapterId);
    }

    // After all Level 1 chapters: verify final state
    const finalState = await page.evaluate(() => {
      const gsm = window.__TEST_BRIDGE__.getGameStateManager();
      return {
        completedChapters: [...gsm.getPlayer().completedChapters],
        bs: gsm.getBalanceSheet(),
      };
    });

    expect(finalState.completedChapters).toEqual(expect.arrayContaining(chapters));
    expect(finalState.bs.isBalanced).toBe(true);
  });

  test('chapter 1 produces expected initial accounting state', async ({ page }) => {
    await waitForTestBridge(page);
    await initLevel(page, 1);

    const result = await playChapter(page, 1);
    assertChapterResult(result, 1);

    // After chapter 1, there should be assets (from investment + purchases)
    expect(result.balanceSheet.totalAssets).toBeGreaterThan(0);
    // Equity should exist from owner's capital
    expect(result.balanceSheet.totalEquity).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Level 2: Lemonade Corporation (Chapters 101–112)
// ---------------------------------------------------------------------------
test.describe('Level 2 — Lemonade Corporation', () => {
  const chapters = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112];

  test('all chapters complete with balanced accounting', async ({ page }) => {
    await waitForTestBridge(page);
    await initLevel(page, 2);

    for (const chapterId of chapters) {
      const result = await playChapter(page, chapterId);
      assertChapterResult(result, chapterId);

      expect(
        result.completedChapters,
        `Chapter ${chapterId} not in completedChapters`,
      ).toContain(chapterId);
    }

    const finalState = await page.evaluate(() => {
      const gsm = window.__TEST_BRIDGE__.getGameStateManager();
      return {
        completedChapters: [...gsm.getPlayer().completedChapters],
        bs: gsm.getBalanceSheet(),
        is: gsm.getIncomeStatement(),
      };
    });

    expect(finalState.completedChapters).toEqual(expect.arrayContaining(chapters));
    expect(finalState.bs.isBalanced).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Level 3: Lemonade Group (Chapters 201–210)
// ---------------------------------------------------------------------------
test.describe('Level 3 — Lemonade Group', () => {
  const chapters = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210];

  test('all chapters complete with balanced accounting', async ({ page }) => {
    await waitForTestBridge(page);
    await initLevel(page, 3);

    for (const chapterId of chapters) {
      const result = await playChapter(page, chapterId);
      assertChapterResult(result, chapterId);

      expect(
        result.completedChapters,
        `Chapter ${chapterId} not in completedChapters`,
      ).toContain(chapterId);
    }

    const finalState = await page.evaluate(() => {
      const gsm = window.__TEST_BRIDGE__.getGameStateManager();
      return {
        completedChapters: [...gsm.getPlayer().completedChapters],
        bs: gsm.getBalanceSheet(),
        is: gsm.getIncomeStatement(),
      };
    });

    expect(finalState.completedChapters).toEqual(expect.arrayContaining(chapters));
    expect(finalState.bs.isBalanced).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// UI Navigation E2E Test — verifies actual game interaction for Chapter 1
// ---------------------------------------------------------------------------
test.describe('UI Navigation', () => {
  test('can navigate from title to chapter 1 and advance dialogs', async ({ page }) => {
    await page.goto('/');

    // Wait for Phaser game to boot (canvas element appears)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    // Get canvas scale for coordinate mapping
    const getScale = () =>
      page.evaluate(() => {
        const c = document.querySelector('canvas')!;
        return { scaleX: c.clientWidth / 800, scaleY: c.clientHeight / 600 };
      });

    // Title Screen: click "New Game" button at (400, 310)
    const scale = await getScale();
    await page.click('canvas', {
      position: { x: 400 * scale.scaleX, y: 310 * scale.scaleY },
    });
    await page.waitForTimeout(500);

    // Level Select: click Lv.1 "Start" button at approximately (150, 450)
    await page.click('canvas', {
      position: { x: 150 * scale.scaleX, y: 450 * scale.scaleY },
    });
    await page.waitForTimeout(500);

    // Chapter Title Screen: click to skip
    await page.click('canvas');
    await page.waitForTimeout(500);

    // VNScene should be active now — verify via test bridge
    await page.waitForFunction(
      () => typeof window.__TEST_BRIDGE__ !== 'undefined',
      { timeout: 5_000 },
    );

    // Verify that the game state was initialized for level 1
    const state = await page.evaluate(() => {
      const gsm = window.__TEST_BRIDGE__.getGameStateManager();
      return {
        currentChapter: gsm.getCurrentChapter(),
        gameLevel: gsm.getState().gameLevel,
      };
    });

    expect(state.gameLevel).toBe(1);
    expect(state.currentChapter).toBe(1);

    // Advance a few dialogs via keyboard (SPACE key)
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
    }

    // Verify the game is running without errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.waitForTimeout(500);

    // No critical errors should have occurred
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('ScriptEngine') && !e.includes('Audio'),
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
