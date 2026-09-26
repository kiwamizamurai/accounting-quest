import Phaser from 'phaser';
import { COLORS, DEPTH, FONT_FAMILY } from '../../config/constants';
import { Rect, getSheetRect, getViewHeight } from '../../config/layout';
import { BalanceSheet, IncomeStatement } from '../../engine/accounting/AccountingEngine';
import { formatAmount } from '../../utils/MoneyFormatter';
import { getLanguage } from '../../i18n';
import { ScrollArea } from './ScrollArea';

/** Text colours of the account types, lighter than the panel colours so they read on the dark sheet. */
const TINT = {
  assets: '#6aaeef',
  liabilities: '#ef7a7a',
  equity: '#6ee06e',
  revenue: '#e6c65c',
  expenses: '#c58cf0',
  good: '#22c55e',
  bad: '#ef4444',
};

type ReportTab = 'bs' | 'pl';

/** One line of a column: a section label, an account with its amount, or a subtotal. */
interface Cell {
  kind: 'section' | 'item' | 'subtotal';
  label: string;
  amount?: number;
  color: string;
}

/** One side of the table: a title, its lines and the total shown at the bottom. */
interface Column {
  title: string;
  titleColor: number;
  cells: Cell[];
  totalLabel: string;
  total: number;
}

interface Statement {
  left: Column;
  right: Column;
}

interface Tab {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
}

const TABS_HEIGHT = 44;
const COLUMN_HEADER_HEIGHT = 30;
const FOOTER_HEIGHT = 56; // totals row and the unit note
const TAB_WIDTH = 132;
const CELL_PADDING = 8;
const CELL_HEIGHT = { section: 26, item: 24, subtotal: 28 };
// On the shortest screens the rows are packed tighter so a small statement fits without scrolling
const CELL_HEIGHT_COMPACT = { section: 24, item: 22, subtotal: 26 };
const COMPACT_VIEW_HEIGHT = 700;

/**
 * Scorecard - the Balance Sheet and Income Statement, one at a time, as a sheet under the top bar.
 *
 * Both are two-column tables like the statements in a bookkeeping textbook: the balance sheet has
 * assets on the left and liabilities + net assets on the right, the income statement has expenses
 * on the left and revenue on the right. The column titles and the totals row stay in place; when
 * a table has more rows than fit, the rows between them scroll (drag, mouse wheel or arrow keys).
 *
 * BS is toggled with the B key, PL with the P key.
 */
export class Scorecard extends Phaser.GameObjects.Container {
  private sheet: Phaser.GameObjects.Container;
  private sheetRect: Rect;
  private bodyRect: Rect;
  private tabBs: Tab;
  private tabPl: Tab;
  private frame: Phaser.GameObjects.Graphics;
  private header: Phaser.GameObjects.Container;
  private footer: Phaser.GameObjects.Container;
  private scroll: ScrollArea;

  private balanceSheet?: BalanceSheet;
  private incomeStatement?: IncomeStatement;
  private activeTab: ReportTab | null = null;

  /** Called when the sheet opens, closes or switches tab. */
  onChange?: () => void;

  private onKeyB = (): void => this.toggle();
  private onKeyP = (): void => this.togglePl();
  private onKeyEscape = (): void => this.close();
  private onKeyUp = (): void => this.scroll.scrollBy(-60);
  private onKeyDown = (): void => this.scroll.scrollBy(60);

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.sheetRect = getSheetRect();
    const { x, y, w, h } = this.sheetRect;
    this.bodyRect = {
      x: x + 6,
      y: y + TABS_HEIGHT + COLUMN_HEADER_HEIGHT,
      w: w - 12,
      h: h - TABS_HEIGHT - COLUMN_HEADER_HEIGHT - FOOTER_HEIGHT,
    };

    this.sheet = scene.add.container(0, 0);
    this.add(this.sheet);

    // Background; it also swallows taps so they do not reach the dialog / stage behind the sheet
    const sheetBg = scene.add.graphics();
    sheetBg.fillStyle(0x12122a, 1);
    sheetBg.fillRoundedRect(x, y, w, h, 14);
    sheetBg.lineStyle(2, 0x4a4a6a, 1);
    sheetBg.strokeRoundedRect(x, y, w, h, 14);
    sheetBg.setInteractive(new Phaser.Geom.Rectangle(x, y, w, h), Phaser.Geom.Rectangle.Contains);
    this.sheet.add(sheetBg);

    // Tabs (segmented control) and close button
    this.tabBs = this.createTab(x + 10, y + 6, () => this.open('bs'));
    this.tabPl = this.createTab(x + 10 + TAB_WIDTH + 6, y + 6, () => this.open('pl'));
    this.createCloseButton(x + w - 10 - 32, y + 6);

    // Table lines, column titles and the totals row (these stay put while the rows scroll)
    this.frame = scene.add.graphics();
    this.sheet.add(this.frame);
    this.header = scene.add.container(0, 0);
    this.sheet.add(this.header);
    this.footer = scene.add.container(0, 0);
    this.sheet.add(this.footer);

    // Scrolling rows, clipped to their rectangle
    this.scroll = new ScrollArea(scene, this.bodyRect, this.sheet);
    this.scroll.setEnabled(false);

    // Keyboard shortcuts
    scene.input.keyboard?.on('keydown-B', this.onKeyB);
    scene.input.keyboard?.on('keydown-P', this.onKeyP);
    scene.input.keyboard?.on('keydown-ESC', this.onKeyEscape);
    scene.input.keyboard?.on('keydown-UP', this.onKeyUp);
    scene.input.keyboard?.on('keydown-DOWN', this.onKeyDown);

    this.setDepth(DEPTH.DIALOG + 30);
    this.setScrollFactor(0);
    scene.add.existing(this);

    // Start closed
    this.sheet.setVisible(false);
  }

  // =========================================================================
  //  Sheet chrome: tabs, close button
  // =========================================================================

  private createTab(x: number, y: number, onTap: () => void): Tab {
    const { scene } = this;
    const container = scene.add.container(x, y);
    const bg = scene.add.graphics();
    const label = scene.add.text(TAB_WIDTH / 2, 16, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    label.setOrigin(0.5);
    const zone = scene.add.zone(TAB_WIDTH / 2, 16, TAB_WIDTH, 40);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerup', onTap);
    container.add([bg, label, zone]);
    this.sheet.add(container);
    return { container, bg, label };
  }

  private createCloseButton(x: number, y: number): void {
    const { scene } = this;
    const container = scene.add.container(x, y);
    const bg = scene.add.graphics();
    bg.fillStyle(0x2a2a4a, 1);
    bg.fillRoundedRect(0, 0, 32, 32, 8);
    const label = scene.add.text(16, 16, '✕', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ffffff',
      padding: { top: 4, bottom: 4 },
    });
    label.setOrigin(0.5);
    const zone = scene.add.zone(16, 16, 44, 44);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => this.close());
    container.add([bg, label, zone]);
    this.sheet.add(container);
  }

  private drawTab(tab: Tab, text: string, color: number, selected: boolean): void {
    tab.bg.clear();
    tab.bg.fillStyle(selected ? color : 0x1e1e38, selected ? 0.35 : 1);
    tab.bg.fillRoundedRect(0, 0, TAB_WIDTH, 32, 8);
    tab.bg.lineStyle(2, selected ? color : 0x3a3a5a, 1);
    tab.bg.strokeRoundedRect(0, 0, TAB_WIDTH, 32, 8);
    tab.label.setText(text);
    tab.label.setColor(selected ? '#ffffff' : '#9aa0b5');
  }

  // =========================================================================
  //  Rendering
  // =========================================================================

  private render(): void {
    const lang = getLanguage();
    const ja = lang === 'ja';
    this.drawTab(this.tabBs, ja ? '貸借対照表' : 'Balance Sheet', COLORS.ASSETS, this.activeTab === 'bs');
    this.drawTab(this.tabPl, ja ? '損益計算書' : 'Income Statement', COLORS.REVENUE, this.activeTab === 'pl');

    this.frame.clear();
    this.clearContainer(this.header);
    this.clearContainer(this.footer);
    this.clearContainer(this.scroll.content);

    let statement: Statement | undefined;
    if (this.activeTab === 'bs' && this.balanceSheet) {
      statement = this.buildBalanceSheet(this.balanceSheet, ja);
    } else if (this.activeTab === 'pl' && this.incomeStatement) {
      statement = this.buildIncomeStatement(this.incomeStatement, ja);
    }
    if (!statement) {
      this.scroll.setContentHeight(0);
      return;
    }

    const colWidth = this.bodyRect.w / 2;
    const leftX = this.bodyRect.x;
    const rightX = this.bodyRect.x + colWidth;

    this.drawColumnHeader(statement.left, leftX, colWidth);
    this.drawColumnHeader(statement.right, rightX, colWidth);

    const leftHeight = this.renderCells(statement.left.cells, leftX, colWidth);
    const rightHeight = this.renderCells(statement.right.cells, rightX, colWidth);
    this.scroll.setContentHeight(Math.max(leftHeight, rightHeight) + 6);

    this.drawFooter(statement, leftX, rightX, colWidth, ja);
    this.drawFrame(rightX);
  }

  /** Assets on the left; liabilities and net assets on the right, each with its subtotal. */
  private buildBalanceSheet(bs: BalanceSheet, ja: boolean): Statement {
    const name = (item: { nameJa: string; name: string }): string => (ja ? item.nameJa : item.name);

    const left: Cell[] = bs.assets
      .filter(a => a.balance !== 0)
      .map(a => ({ kind: 'item', label: name(a), amount: a.balance, color: TINT.assets }));

    const right: Cell[] = [];
    right.push({ kind: 'section', label: ja ? '負債の部' : 'Liabilities', color: TINT.liabilities });
    for (const l of bs.liabilities.filter(l => l.balance !== 0)) {
      right.push({ kind: 'item', label: name(l), amount: l.balance, color: TINT.liabilities });
    }
    right.push({ kind: 'subtotal', label: ja ? '負債合計' : 'Total Liabilities', amount: bs.totalLiabilities, color: TINT.liabilities });

    right.push({ kind: 'section', label: ja ? '純資産の部' : 'Equity', color: TINT.equity });
    // The net income row is drawn separately below (with its own colour), so skip the synthetic one
    for (const e of bs.equity.filter(e => e.balance !== 0 && !e.isNetIncome)) {
      right.push({ kind: 'item', label: name(e), amount: e.balance, color: TINT.equity });
    }
    if (bs.netIncome !== 0) {
      right.push({
        kind: 'item',
        label: ja ? '当期純利益' : 'Net Income',
        amount: bs.netIncome,
        color: bs.netIncome > 0 ? TINT.good : TINT.bad,
      });
    }
    right.push({ kind: 'subtotal', label: ja ? '純資産合計' : 'Total Equity', amount: bs.totalEquity, color: TINT.equity });

    return {
      left: {
        title: ja ? '資産' : 'Assets',
        titleColor: COLORS.ASSETS,
        cells: left,
        totalLabel: ja ? '資産合計' : 'Total Assets',
        total: bs.totalAssets,
      },
      right: {
        title: ja ? '負債・純資産' : 'Liabilities & Equity',
        titleColor: COLORS.LIABILITIES,
        cells: right,
        totalLabel: ja ? '負債・純資産合計' : 'Liabilities + Equity',
        total: bs.totalLiabilities + bs.totalEquity,
      },
    };
  }

  /** Expenses on the left, revenue on the right; the net income (or loss) goes on the shorter side. */
  private buildIncomeStatement(is: IncomeStatement, ja: boolean): Statement {
    const name = (item: { nameJa: string; name: string }): string => (ja ? item.nameJa : item.name);

    const left: Cell[] = is.expenses
      .filter(e => e.balance !== 0)
      .map(e => ({ kind: 'item', label: name(e), amount: e.balance, color: TINT.expenses }));
    const right: Cell[] = is.revenues
      .filter(r => r.balance !== 0)
      .map(r => ({ kind: 'item', label: name(r), amount: r.balance, color: TINT.revenue }));

    if (is.netIncome > 0) {
      left.push({ kind: 'subtotal', label: ja ? '当期純利益' : 'Net Income', amount: is.netIncome, color: TINT.good });
    } else if (is.netIncome < 0) {
      right.push({ kind: 'subtotal', label: ja ? '当期純損失' : 'Net Loss', amount: -is.netIncome, color: TINT.bad });
    }

    return {
      left: {
        title: ja ? '費用' : 'Expenses',
        titleColor: COLORS.EXPENSES,
        cells: left,
        totalLabel: ja ? '合計' : 'Total',
        total: is.totalExpenses + Math.max(0, is.netIncome),
      },
      right: {
        title: ja ? '収益' : 'Revenue',
        titleColor: COLORS.REVENUE,
        cells: right,
        totalLabel: ja ? '合計' : 'Total',
        total: is.totalRevenue + Math.max(0, -is.netIncome),
      },
    };
  }

  private drawColumnHeader(column: Column, x: number, width: number): void {
    const { scene } = this;
    const y = this.sheetRect.y + TABS_HEIGHT;

    const bg = scene.add.graphics();
    bg.fillStyle(column.titleColor, 0.25);
    bg.fillRect(x + 1, y, width - 2, COLUMN_HEADER_HEIGHT - 3);
    bg.lineStyle(2, column.titleColor, 1);
    bg.lineBetween(x + 1, y + COLUMN_HEADER_HEIGHT - 3, x + width - 1, y + COLUMN_HEADER_HEIGHT - 3);
    this.header.add(bg);

    const title = this.makeText(x + width / 2, y + (COLUMN_HEADER_HEIGHT - 3) / 2, column.title, 14, '#ffffff', true, 0.5);
    this.header.add(title);
  }

  /** Draw the cells of one column top to bottom inside the scrolling content; returns their height. */
  private renderCells(cells: Cell[], x: number, width: number): number {
    const { scene } = this;
    const heights = getViewHeight() < COMPACT_VIEW_HEIGHT ? CELL_HEIGHT_COMPACT : CELL_HEIGHT;
    let y = this.bodyRect.y + 2;

    for (const cell of cells) {
      if (cell.kind === 'section') {
        const height = heights.section;
        const bar = scene.add.graphics();
        bar.fillStyle(Phaser.Display.Color.HexStringToColor(cell.color).color, 1);
        bar.fillRoundedRect(x + 4, y + height / 2 - 7, 3, 14, 1.5);
        this.scroll.content.add(bar);
        this.scroll.content.add(this.makeText(x + CELL_PADDING + 4, y + height / 2, cell.label, 13, cell.color, true, 0));
        y += height;
        continue;
      }

      const bold = cell.kind === 'subtotal';
      const base = bold ? heights.subtotal : heights.item;
      const amountText = this.makeText(x + width - CELL_PADDING, 0, formatAmount(cell.amount ?? 0), 13, cell.color, true, 1);
      // A long account name wraps onto a second line instead of running into its amount
      const room = Math.max(40, width - CELL_PADDING * 2 - amountText.width - 8);
      const labelText = this.makeText(x + CELL_PADDING, 0, cell.label, 13, bold ? '#ffffff' : '#eeeeee', bold, 0, room);
      const height = Math.max(base, Math.ceil(labelText.height));

      if (bold) {
        const line = scene.add.graphics();
        line.lineStyle(1, Phaser.Display.Color.HexStringToColor(cell.color).color, 0.5);
        line.lineBetween(x + CELL_PADDING, y + 0.5, x + width - CELL_PADDING, y + 0.5);
        this.scroll.content.add(line);
      }
      amountText.setY(y + height / 2);
      labelText.setY(y + height / 2);
      this.scroll.content.add(amountText);
      this.scroll.content.add(labelText);
      y += height;
    }
    return y - this.bodyRect.y;
  }

  /** The totals row and the unit note under the table; the two totals sit side by side. */
  private drawFooter(statement: Statement, leftX: number, rightX: number, width: number, ja: boolean): void {
    const { scene } = this;
    const top = this.sheetRect.y + this.sheetRect.h - FOOTER_HEIGHT;
    const balanced = statement.left.total === statement.right.total;

    // Double rule above the totals
    const rule = scene.add.graphics();
    rule.lineStyle(1, 0xffd700, 0.8);
    rule.lineBetween(leftX + 2, top + 3, rightX + width - 2, top + 3);
    rule.lineBetween(leftX + 2, top + 6, rightX + width - 2, top + 6);
    this.footer.add(rule);

    for (const [column, x] of [[statement.left, leftX], [statement.right, rightX]] as [Column, number][]) {
      const centerY = top + 8 + 17;
      const amountText = this.makeText(x + width - CELL_PADDING, centerY, formatAmount(column.total), 15, balanced ? '#ffd700' : TINT.bad, true, 1);
      const room = Math.max(40, width - CELL_PADDING * 2 - amountText.width - 6);
      const labelText = this.makeText(x + CELL_PADDING, centerY, column.totalLabel, 13, '#ffffff', true, 0, room);
      this.footer.add(amountText);
      this.footer.add(labelText);
    }

    const unit = this.makeText(rightX + width - CELL_PADDING, top + FOOTER_HEIGHT - 12, ja ? '単位: 円' : 'Unit: G', 12, '#8a90a8', false, 1);
    this.footer.add(unit);
  }

  /** The line between the two columns, and a rule under the column titles. */
  private drawFrame(dividerX: number): void {
    const { y, h } = this.sheetRect;
    const top = y + TABS_HEIGHT;
    const bottom = y + h - FOOTER_HEIGHT;
    this.frame.lineStyle(1, 0x4a4a6a, 1);
    this.frame.lineBetween(dividerX, top, dividerX, bottom);
    this.frame.lineBetween(this.bodyRect.x, bottom, this.bodyRect.x + this.bodyRect.w, bottom);
  }

  private makeText(
    x: number,
    y: number,
    text: string,
    size: number,
    color: string,
    bold: boolean,
    originX: number,
    wrapWidth?: number
  ): Phaser.GameObjects.Text {
    const label = this.scene.add.text(x, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: `${size}px`,
      color,
      fontStyle: bold ? 'bold' : 'normal',
      padding: { top: 4, bottom: 4 },
      ...(wrapWidth ? { wordWrap: { width: wrapWidth, useAdvancedWrap: true } } : {}),
    });
    label.setOrigin(originX, 0.5);
    return label;
  }

  private clearContainer(container: Phaser.GameObjects.Container): void {
    const children = container.getAll();
    for (let i = children.length - 1; i >= 0; i--) {
      (children[i] as Phaser.GameObjects.GameObject).destroy();
    }
  }

  // =========================================================================
  //  Public API
  // =========================================================================

  /** Update the balance sheet data (drawn when its tab is open). */
  update(balanceSheet: BalanceSheet): void {
    this.balanceSheet = balanceSheet;
    if (this.activeTab === 'bs') this.render();
  }

  /** Update the income statement data without opening the sheet. */
  updateIncomeStatement(incomeStatement: IncomeStatement): void {
    this.incomeStatement = incomeStatement;
    if (this.activeTab === 'pl') this.render();
  }

  /** Update the income statement data and open its tab. */
  showIncomeStatement(incomeStatement: IncomeStatement): void {
    this.incomeStatement = incomeStatement;
    this.open('pl');
  }

  /** Show the balance sheet; closes it if it is already open. */
  toggle(): void {
    if (this.activeTab === 'bs') {
      this.close();
    } else {
      this.open('bs');
    }
  }

  /** Show the income statement; closes it if it is already open. */
  togglePl(): void {
    if (this.activeTab === 'pl') {
      this.close();
    } else {
      this.open('pl');
    }
  }

  private open(tab: ReportTab): void {
    const wasOpen = this.activeTab !== null;
    if (this.activeTab !== tab) {
      this.scroll.scrollTo(0);
    }
    this.activeTab = tab;
    this.scroll.setEnabled(true);
    this.sheet.setVisible(true);
    this.render();
    if (!wasOpen) {
      this.sheet.setAlpha(0);
      this.scene.tweens.add({ targets: this.sheet, alpha: 1, duration: 140 });
    }
    this.onChange?.();
  }

  close(): void {
    if (this.activeTab === null) return;
    this.activeTab = null;
    this.scroll.setEnabled(false);
    this.sheet.setVisible(false);
    this.onChange?.();
  }

  get bsExpanded(): boolean {
    return this.activeTab === 'bs';
  }

  get plExpanded(): boolean {
    return this.activeTab === 'pl';
  }

  destroy(): void {
    if (this.scene) {
      this.scene.input.keyboard?.off('keydown-B', this.onKeyB);
      this.scene.input.keyboard?.off('keydown-P', this.onKeyP);
      this.scene.input.keyboard?.off('keydown-ESC', this.onKeyEscape);
      this.scene.input.keyboard?.off('keydown-UP', this.onKeyUp);
      this.scene.input.keyboard?.off('keydown-DOWN', this.onKeyDown);
      this.scroll.destroy();
    }
    super.destroy();
  }
}
