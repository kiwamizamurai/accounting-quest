import Phaser from 'phaser';
import { COLORS, DEPTH, FONT_FAMILY } from '../../config/constants';
import { Rect, getSheetRect, getViewHeight } from '../../config/layout';
import { BalanceSheet, IncomeStatement } from '../../engine/accounting/AccountingEngine';
import { formatMoney } from '../../utils/MoneyFormatter';
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

interface SheetRow {
  kind: 'header' | 'item' | 'total' | 'grand';
  label: string;
  amount?: number;
  color: string;
}

interface Tab {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
}

const ROW_HEIGHT = { header: 34, item: 27, total: 31, grand: 38 };
// On the shortest screens the rows are packed tighter so a small statement fits without scrolling
const ROW_HEIGHT_COMPACT = { header: 30, item: 25, total: 28, grand: 34 };
const COMPACT_VIEW_HEIGHT = 700;
const HEADER_HEIGHT = 44;
const SUMMARY_HEIGHT = 74;
const TAB_WIDTH = 132;

/**
 * Scorecard - the Balance Sheet and Income Statement, one at a time, as a sheet under the top bar.
 *
 * Both are laid out as vertical statements (assets, then liabilities, then net assets), which is
 * what a tall screen is good at. When a statement has more rows than fit, the body scrolls
 * (drag, mouse wheel or arrow keys) while the tabs and the totals bar stay put.
 *
 * BS is toggled with the B key, PL with the P key.
 */
export class Scorecard extends Phaser.GameObjects.Container {
  private sheet: Phaser.GameObjects.Container;
  private sheetRect: Rect;
  private bodyRect: Rect;
  private tabBs: Tab;
  private tabPl: Tab;
  private summary: Phaser.GameObjects.Container;
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
      y: y + HEADER_HEIGHT + SUMMARY_HEIGHT,
      w: w - 12,
      h: h - HEADER_HEIGHT - SUMMARY_HEIGHT - 8,
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

    // Totals bar under the tabs
    this.summary = scene.add.container(0, 0);
    this.sheet.add(this.summary);

    // Scrolling body, clipped to its rectangle
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
    this.drawTab(this.tabBs, lang === 'ja' ? '貸借対照表' : 'Balance Sheet', COLORS.ASSETS, this.activeTab === 'bs');
    this.drawTab(this.tabPl, lang === 'ja' ? '損益計算書' : 'Income Statement', COLORS.REVENUE, this.activeTab === 'pl');

    this.clearContainer(this.summary);
    this.clearContainer(this.scroll.content);

    let rows: SheetRow[] = [];
    if (this.activeTab === 'bs' && this.balanceSheet) {
      rows = this.buildBalanceSheetRows(this.balanceSheet, lang);
      this.renderBalanceSummary(this.balanceSheet, lang);
    } else if (this.activeTab === 'pl' && this.incomeStatement) {
      rows = this.buildIncomeStatementRows(this.incomeStatement, lang);
      this.renderIncomeSummary(this.incomeStatement, lang);
    }

    this.scroll.setContentHeight(this.renderRows(rows));
  }

  private buildBalanceSheetRows(bs: BalanceSheet, lang: string): SheetRow[] {
    const ja = lang === 'ja';
    const rows: SheetRow[] = [];
    const name = (item: { nameJa: string; name: string }): string => (ja ? item.nameJa : item.name);

    rows.push({ kind: 'header', label: ja ? '資産の部' : 'Assets', color: TINT.assets });
    for (const a of bs.assets.filter(a => a.balance !== 0)) {
      rows.push({ kind: 'item', label: name(a), amount: a.balance, color: TINT.assets });
    }
    rows.push({ kind: 'total', label: ja ? '資産合計' : 'Total Assets', amount: bs.totalAssets, color: TINT.assets });

    rows.push({ kind: 'header', label: ja ? '負債の部' : 'Liabilities', color: TINT.liabilities });
    for (const l of bs.liabilities.filter(l => l.balance !== 0)) {
      rows.push({ kind: 'item', label: name(l), amount: l.balance, color: TINT.liabilities });
    }
    rows.push({ kind: 'total', label: ja ? '負債合計' : 'Total Liabilities', amount: bs.totalLiabilities, color: TINT.liabilities });

    rows.push({ kind: 'header', label: ja ? '純資産の部' : 'Equity', color: TINT.equity });
    // The net income row is drawn separately below (with its own colour), so skip the synthetic one
    for (const e of bs.equity.filter(e => e.balance !== 0 && !e.isNetIncome)) {
      rows.push({ kind: 'item', label: name(e), amount: e.balance, color: TINT.equity });
    }
    if (bs.netIncome !== 0) {
      rows.push({
        kind: 'item',
        label: ja ? '当期純利益' : 'Net Income',
        amount: bs.netIncome,
        color: bs.netIncome > 0 ? TINT.good : TINT.bad,
      });
    }
    rows.push({ kind: 'total', label: ja ? '純資産合計' : 'Total Equity', amount: bs.totalEquity, color: TINT.equity });

    rows.push({
      kind: 'grand',
      label: ja ? '負債・純資産合計' : 'Liabilities + Equity',
      amount: bs.totalLiabilities + bs.totalEquity,
      color: '#ffd700',
    });
    return rows;
  }

  private buildIncomeStatementRows(is: IncomeStatement, lang: string): SheetRow[] {
    const ja = lang === 'ja';
    const rows: SheetRow[] = [];
    const name = (item: { nameJa: string; name: string }): string => (ja ? item.nameJa : item.name);

    rows.push({ kind: 'header', label: ja ? '収益の部' : 'Revenues', color: TINT.revenue });
    for (const r of is.revenues.filter(r => r.balance !== 0)) {
      rows.push({ kind: 'item', label: name(r), amount: r.balance, color: TINT.revenue });
    }
    rows.push({ kind: 'total', label: ja ? '収益合計' : 'Total Revenue', amount: is.totalRevenue, color: TINT.revenue });

    rows.push({ kind: 'header', label: ja ? '費用の部' : 'Expenses', color: TINT.expenses });
    for (const e of is.expenses.filter(e => e.balance !== 0)) {
      rows.push({ kind: 'item', label: name(e), amount: e.balance, color: TINT.expenses });
    }
    rows.push({ kind: 'total', label: ja ? '費用合計' : 'Total Expenses', amount: is.totalExpenses, color: TINT.expenses });

    const label = is.netIncome >= 0
      ? (ja ? '当期純利益' : 'Net Income')
      : (ja ? '当期純損失' : 'Net Loss');
    rows.push({ kind: 'grand', label, amount: is.netIncome, color: is.netIncome >= 0 ? TINT.good : TINT.bad });
    return rows;
  }

  /** Draw the rows top to bottom inside the scrolling content; returns their total height. */
  private renderRows(rows: SheetRow[]): number {
    const { scene } = this;
    const left = this.bodyRect.x + 10;
    const right = this.bodyRect.x + this.bodyRect.w - 10;
    const rowHeights = getViewHeight() < COMPACT_VIEW_HEIGHT ? ROW_HEIGHT_COMPACT : ROW_HEIGHT;
    let y = this.bodyRect.y + 4;

    for (const row of rows) {
      const height = rowHeights[row.kind];
      const center = y + height / 2;

      if (row.kind === 'header') {
        const bar = scene.add.graphics();
        bar.fillStyle(Phaser.Display.Color.HexStringToColor(row.color).color, 1);
        bar.fillRoundedRect(left - 2, center - 8, 4, 18, 2);
        this.scroll.content.add(bar);
        this.scroll.content.add(this.makeText(left + 8, center + 2, row.label, 15, row.color, true, 0));
      } else {
        const bold = row.kind !== 'item';
        if (row.kind === 'total' || row.kind === 'grand') {
          const line = scene.add.graphics();
          const color = row.kind === 'grand' ? 0xffd700 : Phaser.Display.Color.HexStringToColor(row.color).color;
          line.lineStyle(1, color, row.kind === 'grand' ? 0.8 : 0.4);
          line.lineBetween(left, y + 1, right, y + 1);
          if (row.kind === 'grand') {
            line.lineBetween(left, y + 4, right, y + 4);
          }
          this.scroll.content.add(line);
        }
        const indent = row.kind === 'item' ? 12 : 0;
        const size = row.kind === 'item' ? 15 : 16;
        const labelColor = row.kind === 'item' ? '#eeeeee' : row.kind === 'grand' ? '#ffd700' : '#ffffff';
        const amountText = this.makeText(right, center + 2, formatMoney(row.amount ?? 0), size, row.color, true, 1);
        const labelText = this.makeText(left + indent, center + 2, row.label, size, labelColor, bold, 0);
        // A long account name must never run into its amount
        const room = right - left - indent - amountText.width - 10;
        if (labelText.width > room && room > 0) {
          labelText.setScale(room / labelText.width);
        }
        this.scroll.content.add(amountText);
        this.scroll.content.add(labelText);
      }
      y += height;
    }
    return y + 8 - this.bodyRect.y;
  }

  private makeText(
    x: number,
    y: number,
    text: string,
    size: number,
    color: string,
    bold: boolean,
    originX: number
  ): Phaser.GameObjects.Text {
    const label = this.scene.add.text(x, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: `${size}px`,
      color,
      fontStyle: bold ? 'bold' : 'normal',
      padding: { top: 4, bottom: 4 },
    });
    label.setOrigin(originX, 0.5);
    return label;
  }

  // ---- Totals bar ---------------------------------------------------------

  /** Three boxes and their operators, e.g. Assets = Liabilities + Equity. */
  private renderSummary(
    boxes: { label: string; amount: number; color: string }[],
    operators: string[],
    footer: { text: string; color: string }
  ): void {
    const { scene } = this;
    const { x, y, w } = this.sheetRect;
    const top = y + HEADER_HEIGHT;
    const operatorWidth = 20;
    const boxWidth = (w - 20 - operatorWidth * 2) / 3;

    boxes.forEach((box, index) => {
      const bx = x + 10 + index * (boxWidth + operatorWidth);
      const bg = scene.add.graphics();
      bg.fillStyle(0x1e1e38, 1);
      bg.fillRoundedRect(bx, top, boxWidth, 46, 8);
      bg.lineStyle(1, Phaser.Display.Color.HexStringToColor(box.color).color, 0.7);
      bg.strokeRoundedRect(bx, top, boxWidth, 46, 8);
      this.summary.add(bg);

      this.summary.add(this.makeText(bx + boxWidth / 2, top + 13, box.label, 12, '#aab0c8', false, 0.5));
      const amount = this.makeText(bx + boxWidth / 2, top + 32, formatMoney(box.amount), 15, box.color, true, 0.5);
      // Large amounts shrink to stay inside their box
      if (amount.width > boxWidth - 8) {
        amount.setScale((boxWidth - 8) / amount.width);
      }
      this.summary.add(amount);

      if (index < operators.length) {
        this.summary.add(this.makeText(bx + boxWidth + operatorWidth / 2, top + 24, operators[index], 16, '#aab0c8', true, 0.5));
      }
    });

    this.summary.add(this.makeText(x + w / 2, top + 60, footer.text, 12, footer.color, true, 0.5));
  }

  private renderBalanceSummary(bs: BalanceSheet, lang: string): void {
    const ja = lang === 'ja';
    this.renderSummary(
      [
        { label: ja ? '資産' : 'Assets', amount: bs.totalAssets, color: TINT.assets },
        { label: ja ? '負債' : 'Liabilities', amount: bs.totalLiabilities, color: TINT.liabilities },
        { label: ja ? '純資産' : 'Equity', amount: bs.totalEquity, color: TINT.equity },
      ],
      ['＝', '＋'],
      bs.isBalanced
        ? { text: ja ? '✓ 貸借一致' : '✓ Balanced', color: TINT.good }
        : { text: ja ? '✗ 貸借不一致' : '✗ Imbalanced', color: TINT.bad }
    );
  }

  private renderIncomeSummary(is: IncomeStatement, lang: string): void {
    const ja = lang === 'ja';
    this.renderSummary(
      [
        { label: ja ? '収益' : 'Revenue', amount: is.totalRevenue, color: TINT.revenue },
        { label: ja ? '費用' : 'Expenses', amount: is.totalExpenses, color: TINT.expenses },
        {
          label: is.netIncome >= 0 ? (ja ? '純利益' : 'Net Income') : (ja ? '純損失' : 'Net Loss'),
          amount: is.netIncome,
          color: is.netIncome >= 0 ? TINT.good : TINT.bad,
        },
      ],
      ['－', '＝'],
      { text: ja ? '収益 － 費用 ＝ 当期純利益' : 'Revenue − Expenses = Net Income', color: '#aab0c8' }
    );
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
