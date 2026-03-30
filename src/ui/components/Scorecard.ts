import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_WIDTH } from '../../config/constants';
import { BalanceSheet, IncomeStatement } from '../../engine/accounting/AccountingEngine';
import { formatMoney } from '../../utils/MoneyFormatter';
import { getLanguage } from '../../i18n';

/**
 * Scorecard - T-account style Balance Sheet and Income Statement panels.
 *
 * BS layout:  Left = Assets         | Right = Liabilities + Equity
 * PL layout:  Left = Expenses (+NI) | Right = Revenues (+NL)
 *
 * BS toggled with B key, PL toggled with P key.
 */
export class Scorecard extends Phaser.GameObjects.Container {
  // ---- layout constants ----
  private readonly panelWidth = 740;
  private readonly panelX = 30;
  private readonly halfWidth = 370; // panelWidth / 2
  private readonly basePanelY = 50;
  private readonly lineHeight = 17;
  private readonly itemPadding = 8;

  // ---- BS panel ----
  private bsBodyContainer: Phaser.GameObjects.Container;
  private bsBackground: Phaser.GameObjects.Graphics;
  private bsDivider: Phaser.GameObjects.Graphics;
  private bsTitleText: Phaser.GameObjects.Text;
  private bsLeftContainer: Phaser.GameObjects.Container;
  private bsRightContainer: Phaser.GameObjects.Container;
  private bsBalanceIndicator: Phaser.GameObjects.Text;
  private lastBsHeight = 200;
  private isBsExpanded = false;

  // ---- PL panel ----
  private plBodyContainer: Phaser.GameObjects.Container;
  private plBackground: Phaser.GameObjects.Graphics;
  private plDivider: Phaser.GameObjects.Graphics;
  private plTitleText: Phaser.GameObjects.Text;
  private plLeftContainer: Phaser.GameObjects.Container;
  private plRightContainer: Phaser.GameObjects.Container;
  private isPlExpanded = false;

  // ---- toggle buttons ----
  private bsToggleBtn: Phaser.GameObjects.Container;
  private bsToggleBtnBg: Phaser.GameObjects.Graphics;
  private bsToggleBtnText: Phaser.GameObjects.Text;
  private plToggleBtn: Phaser.GameObjects.Container;
  private plToggleBtnBg: Phaser.GameObjects.Graphics;
  private plToggleBtnText: Phaser.GameObjects.Text;

  private totalTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private onKeyB: () => void;
  private onKeyP: () => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    const lang = getLanguage();

    // === BS body ===
    this.bsBodyContainer = scene.add.container(0, 0);
    this.add(this.bsBodyContainer);

    this.bsBackground = scene.add.graphics();
    this.bsBodyContainer.add(this.bsBackground);

    this.bsDivider = scene.add.graphics();
    this.bsBodyContainer.add(this.bsDivider);

    this.bsTitleText = scene.add.text(
      this.panelX + this.panelWidth / 2,
      this.basePanelY + 12,
      lang === 'ja' ? '\u8CB8\u501F\u5BFE\u7167\u8868 (B/S)' : 'Balance Sheet',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    this.bsTitleText.setOrigin(0.5, 0);
    this.bsBodyContainer.add(this.bsTitleText);

    this.bsLeftContainer = scene.add.container(0, 0);
    this.bsBodyContainer.add(this.bsLeftContainer);
    this.bsRightContainer = scene.add.container(0, 0);
    this.bsBodyContainer.add(this.bsRightContainer);

    this.bsBalanceIndicator = scene.add.text(
      this.panelX + this.panelWidth / 2,
      this.basePanelY + 180,
      '',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '11px',
        color: '#22c55e',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    this.bsBalanceIndicator.setOrigin(0.5, 0);
    this.bsBodyContainer.add(this.bsBalanceIndicator);

    // === PL body ===
    this.plBodyContainer = scene.add.container(0, 0);
    this.add(this.plBodyContainer);

    this.plBackground = scene.add.graphics();
    this.plBodyContainer.add(this.plBackground);

    this.plDivider = scene.add.graphics();
    this.plBodyContainer.add(this.plDivider);

    this.plTitleText = scene.add.text(
      this.panelX + this.panelWidth / 2,
      this.basePanelY + 12,
      lang === 'ja' ? '\u640D\u76CA\u8A08\u7B97\u66F8 (P/L)' : 'Income Statement',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    this.plTitleText.setOrigin(0.5, 0);
    this.plBodyContainer.add(this.plTitleText);

    this.plLeftContainer = scene.add.container(0, 0);
    this.plBodyContainer.add(this.plLeftContainer);
    this.plRightContainer = scene.add.container(0, 0);
    this.plBodyContainer.add(this.plRightContainer);

    // === Toggle buttons ===
    this.bsToggleBtn = scene.add.container(0, 0);
    this.bsToggleBtnBg = scene.add.graphics();
    this.bsToggleBtnText = scene.add.text(0, 0, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    this.bsToggleBtn.add(this.bsToggleBtnBg);
    this.bsToggleBtn.add(this.bsToggleBtnText);
    this.add(this.bsToggleBtn);

    this.plToggleBtn = scene.add.container(0, 0);
    this.plToggleBtnBg = scene.add.graphics();
    this.plToggleBtnText = scene.add.text(0, 0, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    this.plToggleBtn.add(this.plToggleBtnBg);
    this.plToggleBtn.add(this.plToggleBtnText);
    this.add(this.plToggleBtn);

    this.drawToggleButtons();

    // Hit zones
    const bsHitZone = scene.add.zone(GAME_WIDTH - 50, 30, 80, 30);
    bsHitZone.setInteractive({ useHandCursor: true });
    bsHitZone.on('pointerdown', () => this.toggle());
    this.add(bsHitZone);

    const plHitZone = scene.add.zone(GAME_WIDTH - 140, 30, 80, 30);
    plHitZone.setInteractive({ useHandCursor: true });
    plHitZone.on('pointerdown', () => this.togglePl());
    this.add(plHitZone);

    // Keyboard shortcuts
    this.onKeyB = () => this.toggle();
    this.onKeyP = () => this.togglePl();
    scene.input.keyboard?.on('keydown-B', this.onKeyB);
    scene.input.keyboard?.on('keydown-P', this.onKeyP);

    this.setDepth(DEPTH.UI_PANEL);
    this.setScrollFactor(0);
    scene.add.existing(this);

    // Start collapsed
    this.bsBodyContainer.setVisible(false);
    this.plBodyContainer.setVisible(false);
  }

  // =========================================================================
  //  Toggle buttons
  // =========================================================================

  private drawToggleButtons(): void {
    const btnWidth = 80;
    const btnHeight = 28;
    const bsBtnX = GAME_WIDTH - btnWidth - 10;
    const plBtnX = bsBtnX - btnWidth - 10;
    const btnY = 16;

    // BS button
    this.bsToggleBtnBg.clear();
    this.bsToggleBtnBg.fillStyle(0x1a1a2e, 0.9);
    this.bsToggleBtnBg.fillRoundedRect(bsBtnX, btnY, btnWidth, btnHeight, 4);
    this.bsToggleBtnBg.lineStyle(1, COLORS.ASSETS, 0.8);
    this.bsToggleBtnBg.strokeRoundedRect(bsBtnX, btnY, btnWidth, btnHeight, 4);

    const bsLabel = this.isBsExpanded ? 'BS \u2715' : 'BS \u25B6';
    this.bsToggleBtnText.setText(bsLabel);
    this.bsToggleBtnText.setPosition(bsBtnX + btnWidth / 2, btnY + btnHeight / 2);
    this.bsToggleBtnText.setOrigin(0.5);

    // PL button
    this.plToggleBtnBg.clear();
    this.plToggleBtnBg.fillStyle(0x1a1a2e, 0.9);
    this.plToggleBtnBg.fillRoundedRect(plBtnX, btnY, btnWidth, btnHeight, 4);
    this.plToggleBtnBg.lineStyle(1, COLORS.REVENUE, 0.8);
    this.plToggleBtnBg.strokeRoundedRect(plBtnX, btnY, btnWidth, btnHeight, 4);

    const plLabel = this.isPlExpanded ? 'PL \u2715' : 'PL \u25B6';
    this.plToggleBtnText.setText(plLabel);
    this.plToggleBtnText.setPosition(plBtnX + btnWidth / 2, btnY + btnHeight / 2);
    this.plToggleBtnText.setOrigin(0.5);
  }

  // =========================================================================
  //  Panel background drawing
  // =========================================================================

  private drawPanelBg(
    gfx: Phaser.GameObjects.Graphics,
    divGfx: Phaser.GameObjects.Graphics,
    height: number
  ): void {
    gfx.clear();
    gfx.fillStyle(0x1a1a2e, 0.92);
    gfx.fillRoundedRect(this.panelX, this.basePanelY, this.panelWidth, height, 8);
    gfx.lineStyle(2, 0x4a4a6a);
    gfx.strokeRoundedRect(this.panelX, this.basePanelY, this.panelWidth, height, 8);

    // Title underline
    gfx.lineStyle(1, 0xffd700, 0.3);
    gfx.lineBetween(
      this.panelX + 10, this.basePanelY + 30,
      this.panelX + this.panelWidth - 10, this.basePanelY + 30
    );

    // Center vertical divider
    divGfx.clear();
    const divX = this.panelX + this.halfWidth;
    divGfx.lineStyle(1, 0x4a4a6a, 0.6);
    divGfx.lineBetween(divX, this.basePanelY + 32, divX, this.basePanelY + height - 8);
  }

  // =========================================================================
  //  Helper: add elements into a column container
  // =========================================================================

  private clearContainer(container: Phaser.GameObjects.Container): void {
    const children = container.getAll();
    for (let i = children.length - 1; i >= 0; i--) {
      (children[i] as Phaser.GameObjects.GameObject).destroy();
    }
  }

  /** Bold colored section header, e.g. "【資産の部】" */
  private addHeader(
    container: Phaser.GameObjects.Container,
    text: string,
    colX: number,
    y: number,
    color: number
  ): void {
    const t = this.scene.add.text(colX + this.itemPadding, y, text, {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    container.add(t);
  }

  /** Normal item row: label left-aligned, amount right-aligned within column */
  private addItem(
    container: Phaser.GameObjects.Container,
    label: string,
    amount: number,
    colX: number,
    y: number,
    color: number
  ): void {
    const labelText = this.scene.add.text(colX + this.itemPadding + 8, y, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#cccccc',
      padding: { top: 4, bottom: 4 },
    });
    container.add(labelText);

    const amountText = this.scene.add.text(
      colX + this.halfWidth - this.itemPadding - 5,
      y,
      formatMoney(amount),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '11px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        padding: { top: 4, bottom: 4 },
      }
    );
    amountText.setOrigin(1, 0);
    container.add(amountText);
  }

  /** Total row with separator line above */
  private addTotal(
    container: Phaser.GameObjects.Container,
    label: string,
    amount: number,
    colX: number,
    y: number,
    color: number,
    key?: string,
    bold = true
  ): void {
    const line = this.scene.add.graphics();
    line.lineStyle(1, color, 0.4);
    line.lineBetween(
      colX + this.itemPadding, y - 3,
      colX + this.halfWidth - this.itemPadding, y - 3
    );
    container.add(line);

    const labelText = this.scene.add.text(colX + this.itemPadding, y, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: bold ? 'bold' : 'normal',
      padding: { top: 4, bottom: 4 },
    });
    container.add(labelText);

    const amountText = this.scene.add.text(
      colX + this.halfWidth - this.itemPadding - 5,
      y,
      formatMoney(amount),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontStyle: bold ? 'bold' : 'normal',
        padding: { top: 4, bottom: 4 },
      }
    );
    amountText.setOrigin(1, 0);
    container.add(amountText);

    if (key) {
      this.totalTexts.set(key, amountText);
    }
  }

  /** Double-line grand total (bottom of T-account) */
  private addGrandTotal(
    container: Phaser.GameObjects.Container,
    label: string,
    amount: number,
    colX: number,
    y: number
  ): void {
    // Double line
    const dblLine = this.scene.add.graphics();
    dblLine.lineStyle(1, 0xffd700, 0.6);
    dblLine.lineBetween(colX + this.itemPadding, y - 5, colX + this.halfWidth - this.itemPadding, y - 5);
    dblLine.lineBetween(colX + this.itemPadding, y - 2, colX + this.halfWidth - this.itemPadding, y - 2);
    container.add(dblLine);

    const labelText = this.scene.add.text(colX + this.itemPadding, y, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    container.add(labelText);

    const amountText = this.scene.add.text(
      colX + this.halfWidth - this.itemPadding - 5,
      y,
      formatMoney(amount),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    amountText.setOrigin(1, 0);
    container.add(amountText);
  }

  // =========================================================================
  //  Public API
  // =========================================================================

  /**
   * Update BS panel with new data (T-account: left=Assets, right=L+E)
   */
  update(balanceSheet: BalanceSheet): void {
    const lang = getLanguage();
    this.bsTitleText.setText(lang === 'ja' ? '貸借対照表 (B/S)' : 'Balance Sheet');
    this.clearContainer(this.bsLeftContainer);
    this.clearContainer(this.bsRightContainer);
    this.totalTexts.clear();

    const contentY = this.basePanelY + 37;
    const leftX = this.panelX;
    const rightX = this.panelX + this.halfWidth;

    // ---- Left column: Assets ----
    let leftY = contentY;
    this.addHeader(
      this.bsLeftContainer,
      lang === 'ja' ? '\u3010\u8CC7\u7523\u306E\u90E8\u3011' : 'Assets',
      leftX, leftY, COLORS.ASSETS
    );
    leftY += this.lineHeight;

    for (const a of balanceSheet.assets.filter(a => a.balance !== 0)) {
      this.addItem(
        this.bsLeftContainer,
        lang === 'ja' ? a.nameJa : a.name,
        a.balance, leftX, leftY, COLORS.ASSETS
      );
      leftY += this.lineHeight;
    }
    leftY += 4;
    this.addTotal(
      this.bsLeftContainer,
      lang === 'ja' ? '\u8CC7\u7523\u5408\u8A08' : 'Total Assets',
      balanceSheet.totalAssets, leftX, leftY, COLORS.ASSETS, 'totalAssets', false
    );
    leftY += this.lineHeight + 4;

    // ---- Right column: Liabilities + Equity ----
    let rightY = contentY;

    // Liabilities
    this.addHeader(
      this.bsRightContainer,
      lang === 'ja' ? '\u3010\u8CA0\u50B5\u306E\u90E8\u3011' : 'Liabilities',
      rightX, rightY, COLORS.LIABILITIES
    );
    rightY += this.lineHeight;

    for (const l of balanceSheet.liabilities.filter(l => l.balance !== 0)) {
      this.addItem(
        this.bsRightContainer,
        lang === 'ja' ? l.nameJa : l.name,
        l.balance, rightX, rightY, COLORS.LIABILITIES
      );
      rightY += this.lineHeight;
    }
    rightY += 4;
    this.addTotal(
      this.bsRightContainer,
      lang === 'ja' ? '\u8CA0\u50B5\u5408\u8A08' : 'Total Liabilities',
      balanceSheet.totalLiabilities, rightX, rightY, COLORS.LIABILITIES, 'totalLiabilities', false
    );
    rightY += this.lineHeight + 6;

    // Equity
    this.addHeader(
      this.bsRightContainer,
      lang === 'ja' ? '\u3010\u7D14\u8CC7\u7523\u306E\u90E8\u3011' : 'Equity',
      rightX, rightY, COLORS.EQUITY
    );
    rightY += this.lineHeight;

    for (const e of balanceSheet.equity.filter(e => e.balance !== 0)) {
      this.addItem(
        this.bsRightContainer,
        lang === 'ja' ? e.nameJa : e.name,
        e.balance, rightX, rightY, COLORS.EQUITY
      );
      rightY += this.lineHeight;
    }
    if (balanceSheet.netIncome !== 0) {
      const niLabel = lang === 'ja' ? '当期純利益' : 'Net Income';
      const niColor = balanceSheet.netIncome > 0 ? 0x22c55e : 0xef4444;
      this.addItem(
        this.bsRightContainer,
        niLabel,
        balanceSheet.netIncome, rightX, rightY, niColor
      );
      rightY += this.lineHeight;
    }
    rightY += 4;
    this.addTotal(
      this.bsRightContainer,
      lang === 'ja' ? '\u7D14\u8CC7\u7523\u5408\u8A08' : 'Total Equity',
      balanceSheet.totalEquity, rightX, rightY, COLORS.EQUITY, 'totalEquity', false
    );
    rightY += this.lineHeight + 4;

    // ---- Grand totals (bottom of T-account) ----
    const grandY = Math.max(leftY, rightY) + 2;
    this.addGrandTotal(
      this.bsLeftContainer,
      lang === 'ja' ? '\u5408\u8A08' : 'Total',
      balanceSheet.totalAssets, leftX, grandY
    );
    this.addGrandTotal(
      this.bsRightContainer,
      lang === 'ja' ? '\u5408\u8A08' : 'Total',
      balanceSheet.totalLiabilities + balanceSheet.totalEquity, rightX, grandY
    );

    // Balance indicator
    const indicatorY = grandY + this.lineHeight + 4;
    if (balanceSheet.isBalanced) {
      this.bsBalanceIndicator.setText(lang === 'ja' ? '\u2713 \u8CB8\u501F\u4E00\u81F4' : '\u2713 Balanced');
      this.bsBalanceIndicator.setColor('#22c55e');
    } else {
      this.bsBalanceIndicator.setText(lang === 'ja' ? '\u2717 \u8CB8\u501F\u4E0D\u4E00\u81F4' : '\u2717 Imbalanced');
      this.bsBalanceIndicator.setColor('#ef4444');
    }
    this.bsBalanceIndicator.setY(indicatorY);

    // Resize background
    this.lastBsHeight = indicatorY - this.basePanelY + 22;
    this.drawPanelBg(this.bsBackground, this.bsDivider, this.lastBsHeight);

    // Reposition PL below if BS is open
    this.repositionPlPanel();
  }

  /**
   * Update PL data without expanding the panel
   */
  updateIncomeStatement(incomeStatement: IncomeStatement): void {
    this.renderIncomeStatement(incomeStatement);
  }

  /**
   * Update PL data and expand the panel
   */
  showIncomeStatement(incomeStatement: IncomeStatement): void {
    this.renderIncomeStatement(incomeStatement);
    if (!this.isPlExpanded) {
      this.togglePl();
    }
  }

  // =========================================================================
  //  PL rendering (T-account: left=Expenses, right=Revenues)
  // =========================================================================

  private renderIncomeStatement(is: IncomeStatement): void {
    const lang = getLanguage();
    this.plTitleText.setText(lang === 'ja' ? '損益計算書 (P/L)' : 'Income Statement');
    this.clearContainer(this.plLeftContainer);
    this.clearContainer(this.plRightContainer);

    const contentY = this.basePanelY + 37;
    const leftX = this.panelX;
    const rightX = this.panelX + this.halfWidth;

    // ---- Left column: Expenses (debit side) ----
    let leftY = contentY;
    this.addHeader(
      this.plLeftContainer,
      lang === 'ja' ? '\u3010\u8CBB\u7528\u306E\u90E8\u3011' : 'Expenses',
      leftX, leftY, COLORS.EXPENSES
    );
    leftY += this.lineHeight;

    for (const exp of is.expenses.filter(e => e.balance !== 0)) {
      this.addItem(
        this.plLeftContainer,
        lang === 'ja' ? exp.nameJa : exp.name,
        exp.balance, leftX, leftY, COLORS.EXPENSES
      );
      leftY += this.lineHeight;
    }

    leftY += 4;
    this.addTotal(
      this.plLeftContainer,
      lang === 'ja' ? '費用合計' : 'Total Expenses',
      is.totalExpenses, leftX, leftY, COLORS.EXPENSES, 'totalExpenses', false
    );
    leftY += this.lineHeight + 4;

    // ---- Right column: Revenues (credit side) ----
    let rightY = contentY;
    this.addHeader(
      this.plRightContainer,
      lang === 'ja' ? '\u3010\u53CE\u76CA\u306E\u90E8\u3011' : 'Revenues',
      rightX, rightY, COLORS.REVENUE
    );
    rightY += this.lineHeight;

    for (const rev of is.revenues.filter(r => r.balance !== 0)) {
      this.addItem(
        this.plRightContainer,
        lang === 'ja' ? rev.nameJa : rev.name,
        rev.balance, rightX, rightY, COLORS.REVENUE
      );
      rightY += this.lineHeight;
    }

    rightY += 4;
    this.addTotal(
      this.plRightContainer,
      lang === 'ja' ? '収益合計' : 'Total Revenue',
      is.totalRevenue, rightX, rightY, COLORS.REVENUE, 'totalRevenue', false
    );
    rightY += this.lineHeight + 4;

    // ---- Net income formula (full-width, below both columns) ----
    const formulaY = Math.max(leftY, rightY) + 2;
    const formulaLine = this.scene.add.graphics();
    formulaLine.lineStyle(1, 0xffd700, 0.6);
    formulaLine.lineBetween(leftX + this.itemPadding, formulaY - 5, leftX + this.halfWidth * 2 - this.itemPadding, formulaY - 5);
    formulaLine.lineBetween(leftX + this.itemPadding, formulaY - 2, leftX + this.halfWidth * 2 - this.itemPadding, formulaY - 2);
    this.plLeftContainer.add(formulaLine);

    const niColor = is.netIncome >= 0 ? '#22c55e' : '#ef4444';
    const niLabel = is.netIncome >= 0
      ? (lang === 'ja' ? '当期純利益' : 'Net Income')
      : (lang === 'ja' ? '当期純損失' : 'Net Loss');
    const formulaText = lang === 'ja'
      ? `${niLabel}  ${formatMoney(is.totalRevenue)} - ${formatMoney(is.totalExpenses)} = ${formatMoney(is.netIncome)}`
      : `${niLabel}  ${formatMoney(is.totalRevenue)} - ${formatMoney(is.totalExpenses)} = ${formatMoney(is.netIncome)}`;

    const formulaLabel = this.scene.add.text(leftX + this.itemPadding, formulaY, formulaText, {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: niColor,
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    this.plLeftContainer.add(formulaLabel);

    const bottomY = formulaY + this.lineHeight + 8;

    // Resize background
    const plHeight = bottomY - this.basePanelY + 8;
    this.drawPanelBg(this.plBackground, this.plDivider, plHeight);
  }

  // =========================================================================
  //  Toggle / positioning
  // =========================================================================

  toggle(): void {
    this.isBsExpanded = !this.isBsExpanded;
    this.bsBodyContainer.setVisible(this.isBsExpanded);
    this.repositionPlPanel();
    this.drawToggleButtons();
  }

  togglePl(): void {
    this.isPlExpanded = !this.isPlExpanded;
    this.plBodyContainer.setVisible(this.isPlExpanded);
    this.drawToggleButtons();
  }

  /**
   * Shift PL panel below BS when BS is expanded, or back to top when collapsed.
   * Uses container Y offset so PL content coordinates stay relative to basePanelY.
   */
  private repositionPlPanel(): void {
    if (this.isBsExpanded) {
      this.plBodyContainer.setY(this.lastBsHeight + 10);
    } else {
      this.plBodyContainer.setY(0);
    }
  }

  get bsExpanded(): boolean {
    return this.isBsExpanded;
  }

  get plExpanded(): boolean {
    return this.isPlExpanded;
  }

  highlightTotal(key: string): void {
    const text = this.totalTexts.get(key);
    if (text) {
      this.scene.tweens.add({
        targets: text,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        repeat: 1,
      });
    }
  }

  destroy(): void {
    if (this.scene) {
      this.scene.input.keyboard?.off('keydown-B', this.onKeyB);
      this.scene.input.keyboard?.off('keydown-P', this.onKeyP);
    }
    super.destroy();
  }
}
