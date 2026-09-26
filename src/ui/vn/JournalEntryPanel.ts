import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, FONT_FAMILY } from '../../config/constants';
import { AccountType } from '../../models/Account';
import { t } from '../../i18n';
import { formatMoney } from '../../utils/MoneyFormatter';

export interface JournalEntryLine {
  account: string;
  debit?: number;
  credit?: number;
}

export interface JournalAccountOption {
  category: string;
  label: string;
  type: AccountType;
}

export interface JournalEntryPanelConfig {
  prompt: string;
  hint?: string;
  /** Number of debit / credit lines the entry has (one input row per line). */
  debitCount: number;
  creditCount: number;
  /** Accounts the player can pick from, already labelled in the current language. */
  accounts: JournalAccountOption[];
  /** The correct entry, used to mark each row after submitting. */
  expected: JournalEntryLine[];
  /** The correct entry as text, shown after submitting. */
  correctAnswer: string;
  /** Submit the player's entry; returns whether it was correct. */
  onSubmit: (entries: JournalEntryLine[]) => boolean;
  onClose: (isCorrect: boolean) => void;
}

type Side = 'debit' | 'credit';

interface Row {
  side: Side;
  account: string | null;
  amount: number;
  accountBtn: MiniButton;
  amountBtn: MiniButton;
}

interface MiniButton {
  container: Phaser.GameObjects.Container;
  setText(text: string): void;
  setEnabled(enabled: boolean): void;
  setBorder(color: number): void;
  setFilled(filled: boolean): void;
}

const FONT = FONT_FAMILY;
const MAX_AMOUNT_DIGITS = 9;

const TAB_TYPES: { type: AccountType; key: string }[] = [
  { type: AccountType.ASSET, key: 'je.tab_asset' },
  { type: AccountType.LIABILITY, key: 'je.tab_liability' },
  { type: AccountType.EQUITY, key: 'je.tab_equity' },
  { type: AccountType.REVENUE, key: 'je.tab_revenue' },
  { type: AccountType.EXPENSE, key: 'je.tab_expense' },
];

function createMiniButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  fontSize: number,
  onClick: () => void
): MiniButton {
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const label = scene.add.text(0, 0, text, {
    fontFamily: FONT,
    fontSize: `${fontSize}px`,
    color: '#ffffff',
    fontStyle: 'bold',
    align: 'center',
    wordWrap: { width: w - 10 },
    padding: { top: 3, bottom: 3 },
  });
  label.setOrigin(0.5);
  container.add([bg, label]);

  let enabled = true;
  let hover = false;
  let border = 0x5a5a7a;
  let filled = false;

  const draw = (): void => {
    bg.clear();
    const fill = !enabled ? 0x33334a : hover ? COLORS.BUTTON_HOVER : filled ? 0x2f3f66 : COLORS.BUTTON;
    bg.fillStyle(fill, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.lineStyle(2, hover && enabled ? COLORS.ASSETS : border, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    label.setAlpha(enabled ? 1 : 0.5);
  };
  draw();

  container.setSize(w, h);
  container.setInteractive({ useHandCursor: true });
  container.on('pointerover', () => {
    hover = true;
    draw();
  });
  container.on('pointerout', () => {
    hover = false;
    draw();
  });
  container.on('pointerup', () => {
    if (enabled) {
      onClick();
    }
  });

  return {
    container,
    setText: (next: string) => label.setText(next),
    setEnabled: (next: boolean) => {
      enabled = next;
      draw();
    },
    setBorder: (color: number) => {
      border = color;
      draw();
    },
    setFilled: (next: boolean) => {
      filled = next;
      draw();
    },
  };
}

/**
 * Journal entry input: the player fills in the debit and credit lines of an entry
 * (account picked from a list grouped by type, amount typed on a keypad) and submits it.
 */
export class JournalEntryPanel extends Phaser.GameObjects.Container {
  private config!: JournalEntryPanelConfig;
  private rows: Row[] = [];
  private panelBody?: Phaser.GameObjects.Container;
  private popup?: Phaser.GameObjects.Container;
  private noteText?: Phaser.GameObjects.Text;
  private submitBtn?: MiniButton;
  private sideButtons: MiniButton[] = []; // hint / reset, hidden once the entry is submitted
  private hintShown = false;
  private submitted = false;
  private keypadHandler?: (event: KeyboardEvent) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.setDepth(DEPTH.DIALOG + 20);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(config: JournalEntryPanelConfig): void {
    this.hide();
    this.config = config;
    this.rows = [];
    this.sideButtons = [];
    this.hintShown = false;
    this.submitted = false;
    this.setVisible(true);
    this.build();
  }

  hide(): void {
    this.closePopup();
    this.panelBody?.destroy();
    this.panelBody = undefined;
    this.rows = [];
    this.setVisible(false);
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  private build(): void {
    const { scene } = this;
    const body = scene.add.container(0, 0);
    this.panelBody = body;
    this.add(body);

    // Dim everything behind and swallow clicks
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.82);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
    body.add(overlay);

    const box = scene.add.graphics();
    box.fillStyle(0x1a1a2e, 0.98);
    box.fillRoundedRect(24, 16, GAME_WIDTH - 48, GAME_HEIGHT - 32, 8);
    box.lineStyle(2, 0x4a4a6a, 1);
    box.strokeRoundedRect(24, 16, GAME_WIDTH - 48, GAME_HEIGHT - 32, 8);
    body.add(box);

    body.add(
      scene.add
        .text(GAME_WIDTH / 2, 38, t('je.title'), {
          fontFamily: FONT,
          fontSize: '20px',
          color: '#ffd700',
          fontStyle: 'bold',
          padding: { top: 4, bottom: 4 },
        })
        .setOrigin(0.5)
    );

    body.add(
      scene.add.text(44, 62, this.config.prompt, {
        fontFamily: FONT,
        fontSize: '15px',
        color: '#ffffff',
        wordWrap: { width: GAME_WIDTH - 88, useAdvancedWrap: true },
        lineSpacing: 4,
        padding: { top: 2, bottom: 2 },
      })
    );

    // Hint / answer line (filled in later)
    this.noteText = scene.add.text(44, 122, '', {
      fontFamily: FONT,
      fontSize: '13px',
      color: '#ffd700',
      wordWrap: { width: GAME_WIDTH - 88, useAdvancedWrap: true },
      lineSpacing: 3,
      padding: { top: 2, bottom: 2 },
    });
    body.add(this.noteText);

    this.buildColumns(body);
    this.buildBottomBar(body);
    this.updateSubmitState();
  }

  private buildColumns(body: Phaser.GameObjects.Container): void {
    const { scene } = this;
    // Room above the columns for the hint / result text (up to 3 lines)
    const headerY = 192;
    const rowsTop = 232;
    const rowHeight = 56;
    const leftX = 44;
    const rightX = 412;
    const colWidth = 344;
    const rowCount = Math.max(this.config.debitCount, this.config.creditCount, 1);

    const drawHeader = (x: number, color: number, label: string): void => {
      const g = scene.add.graphics();
      g.fillStyle(color, 0.25);
      g.fillRoundedRect(x, headerY, colWidth, 28, 4);
      g.lineStyle(2, color, 1);
      g.strokeRoundedRect(x, headerY, colWidth, 28, 4);
      body.add(g);
      body.add(
        scene.add
          .text(x + colWidth / 2, headerY + 14, label, {
            fontFamily: FONT,
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
            padding: { top: 3, bottom: 3 },
          })
          .setOrigin(0.5)
      );
    };
    drawHeader(leftX, COLORS.ASSETS, t('je.debit'));
    drawHeader(rightX, COLORS.LIABILITIES, t('je.credit'));

    // T-account divider
    const divider = scene.add.graphics();
    divider.lineStyle(2, 0x4a4a6a, 1);
    divider.lineBetween(GAME_WIDTH / 2, headerY, GAME_WIDTH / 2, rowsTop + rowCount * rowHeight);
    body.add(divider);

    const addRows = (side: Side, count: number, x: number): void => {
      for (let i = 0; i < count; i++) {
        const cy = rowsTop + i * rowHeight + 24;
        const row: Row = { side, account: null, amount: 0, accountBtn: undefined as never, amountBtn: undefined as never };
        row.accountBtn = createMiniButton(scene, x + 122, cy, 240, 44, t('je.pick_account'), 13, () => this.openAccountPicker(row));
        row.amountBtn = createMiniButton(scene, x + 290, cy, 108, 44, t('je.amount'), 14, () => this.openKeypad(row));
        body.add(row.accountBtn.container);
        body.add(row.amountBtn.container);
        this.rows.push(row);
      }
    };
    addRows('debit', this.config.debitCount, leftX);
    addRows('credit', this.config.creditCount, rightX);
  }

  private buildBottomBar(body: Phaser.GameObjects.Container): void {
    const { scene } = this;
    const y = 546;

    if (this.config.hint) {
      const hintBtn = createMiniButton(scene, 110, y, 150, 40, t('je.hint'), 14, () => this.toggleHint());
      body.add(hintBtn.container);
      this.sideButtons.push(hintBtn);
    }
    const resetBtn = createMiniButton(scene, 290, y, 150, 40, t('je.reset'), 14, () => this.reset());
    body.add(resetBtn.container);
    this.sideButtons.push(resetBtn);

    this.submitBtn = createMiniButton(scene, GAME_WIDTH - 130, y, 190, 40, t('je.submit'), 16, () => this.submit());
    this.submitBtn.setBorder(0xffd700);
    body.add(this.submitBtn.container);
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  private toggleHint(): void {
    if (this.submitted) {
      return;
    }
    this.hintShown = !this.hintShown;
    this.noteText?.setColor('#ffd700');
    this.noteText?.setText(this.hintShown ? `${t('je.hint_label')} ${this.config.hint ?? ''}` : '');
  }

  private reset(): void {
    if (this.submitted) {
      return;
    }
    for (const row of this.rows) {
      row.account = null;
      row.amount = 0;
      this.refreshRow(row);
    }
    this.updateSubmitState();
  }

  private refreshRow(row: Row): void {
    const option = this.config.accounts.find(a => a.category === row.account);
    row.accountBtn.setText(option ? option.label : t('je.pick_account'));
    row.accountBtn.setFilled(!!option);
    row.amountBtn.setText(row.amount > 0 ? formatMoney(row.amount) : t('je.amount'));
    row.amountBtn.setFilled(row.amount > 0);
  }

  private isComplete(): boolean {
    return this.rows.every(row => row.account !== null && row.amount > 0);
  }

  private updateSubmitState(): void {
    const complete = this.isComplete();
    this.submitBtn?.setEnabled(complete && !this.submitted);
    if (!this.submitted && this.noteText && !this.hintShown) {
      this.noteText.setColor('#9aa0b5');
      this.noteText.setText(complete ? '' : t('je.fill_all'));
    }
  }

  private submit(): void {
    if (this.submitted || !this.isComplete()) {
      return;
    }
    this.submitted = true;
    const entries: JournalEntryLine[] = this.rows.map(row =>
      row.side === 'debit'
        ? { account: row.account as string, debit: row.amount }
        : { account: row.account as string, credit: row.amount }
    );
    const isCorrect = this.config.onSubmit(entries);

    // Mark each row: does the same side / account / amount exist in the correct entry?
    const remaining = [...this.config.expected];
    for (const row of this.rows) {
      const index = remaining.findIndex(e =>
        e.account === row.account && (row.side === 'debit' ? e.debit : e.credit) === row.amount
      );
      const ok = index >= 0;
      if (ok) {
        remaining.splice(index, 1);
      }
      const color = ok ? 0x22c55e : 0xef4444;
      row.accountBtn.setBorder(color);
      row.amountBtn.setBorder(color);
      row.accountBtn.setEnabled(false);
      row.amountBtn.setEnabled(false);
    }

    const { scene } = this;
    this.sideButtons.forEach(button => button.container.setVisible(false));
    this.noteText?.setFontSize(16);
    this.noteText?.setFontStyle('bold');
    this.noteText?.setColor(isCorrect ? '#22c55e' : '#ffd700');
    this.noteText?.setText(isCorrect ? t('je.correct') : `${t('je.incorrect')}\n${t('je.correct_answer')} ${this.config.correctAnswer}`);

    this.submitBtn?.container.destroy();
    const continueBtn = createMiniButton(scene, GAME_WIDTH - 130, 546, 190, 40, t('je.continue'), 16, () => {
      const result = isCorrect;
      this.hide();
      this.config.onClose(result);
    });
    continueBtn.setBorder(0xffd700);
    this.panelBody?.add(continueBtn.container);
  }

  // ---------------------------------------------------------------------------
  // Account picker
  // ---------------------------------------------------------------------------

  private closePopup(): void {
    if (this.keypadHandler) {
      this.scene.input.keyboard?.off('keydown', this.keypadHandler);
      this.keypadHandler = undefined;
    }
    this.popup?.destroy();
    this.popup = undefined;
  }

  private startPopup(width: number, height: number, title: string): { popup: Phaser.GameObjects.Container; x: number; y: number } {
    const { scene } = this;
    this.closePopup();
    const popup = scene.add.container(0, 0);
    this.popup = popup;
    this.add(popup);

    const dim = scene.add.graphics();
    dim.fillStyle(0x000000, 0.6);
    dim.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);
    dim.on('pointerup', () => this.closePopup());
    popup.add(dim);

    const x = (GAME_WIDTH - width) / 2;
    const y = (GAME_HEIGHT - height) / 2;
    const frame = scene.add.graphics();
    frame.fillStyle(0x23233a, 1);
    frame.fillRoundedRect(x, y, width, height, 8);
    frame.lineStyle(2, COLORS.ASSETS, 1);
    frame.strokeRoundedRect(x, y, width, height, 8);
    // Swallow clicks inside the frame so they do not reach the dim layer
    frame.setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);
    popup.add(frame);

    popup.add(
      scene.add
        .text(GAME_WIDTH / 2, y + 22, title, {
          fontFamily: FONT,
          fontSize: '16px',
          color: '#ffd700',
          fontStyle: 'bold',
          padding: { top: 3, bottom: 3 },
        })
        .setOrigin(0.5)
    );
    return { popup, x, y };
  }

  private openAccountPicker(row: Row): void {
    if (this.submitted) {
      return;
    }
    const width = 700;
    const height = 470;
    const { popup, x, y } = this.startPopup(width, height, t('je.pick_account'));
    const { scene } = this;

    const selected = this.config.accounts.find(a => a.category === row.account);
    let activeType = selected?.type ?? (row.side === 'debit' ? AccountType.ASSET : AccountType.LIABILITY);
    let content: Phaser.GameObjects.Container | undefined;

    const renderTab = (): void => {
      content?.destroy();
      content = scene.add.container(0, 0);
      popup.add(content);

      const options = this.config.accounts.filter(a => a.type === activeType);
      const columns = options.length > 32 ? 5 : 4;
      const gap = 8;
      const gridX = x + 20;
      const gridY = y + 96;
      const cellW = (width - 40 - gap * (columns - 1)) / columns;
      const cellH = 34;

      options.forEach((option, index) => {
        const col = index % columns;
        const line = Math.floor(index / columns);
        const btn = createMiniButton(
          scene,
          gridX + col * (cellW + gap) + cellW / 2,
          gridY + line * (cellH + gap) + cellH / 2,
          cellW,
          cellH,
          option.label,
          12,
          () => {
            row.account = option.category;
            this.refreshRow(row);
            this.updateSubmitState();
            this.closePopup();
          }
        );
        btn.setFilled(option.category === row.account);
        content?.add(btn.container);
      });
    };

    // Tabs by account type
    const tabW = (width - 40 - 4 * 8) / 5;
    const tabButtons: MiniButton[] = [];
    TAB_TYPES.forEach((tab, index) => {
      const btn = createMiniButton(scene, x + 20 + index * (tabW + 8) + tabW / 2, y + 62, tabW, 32, t(tab.key), 14, () => {
        activeType = tab.type;
        tabButtons.forEach((b, i) => b.setBorder(TAB_TYPES[i].type === activeType ? 0xffd700 : 0x5a5a7a));
        renderTab();
      });
      btn.setBorder(tab.type === activeType ? 0xffd700 : 0x5a5a7a);
      tabButtons.push(btn);
      popup.add(btn.container);
    });

    const closeBtn = createMiniButton(scene, x + width - 60, y + height - 26, 90, 32, t('je.cancel'), 13, () => this.closePopup());
    popup.add(closeBtn.container);

    renderTab();
  }

  // ---------------------------------------------------------------------------
  // Amount keypad
  // ---------------------------------------------------------------------------

  private openKeypad(row: Row): void {
    if (this.submitted) {
      return;
    }
    const width = 320;
    const height = 430;
    const { popup, x, y } = this.startPopup(width, height, t('je.enter_amount'));
    const { scene } = this;

    let digits = row.amount > 0 ? String(row.amount) : '';
    const display = scene.add
      .text(GAME_WIDTH / 2, y + 66, '', {
        fontFamily: FONT,
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      })
      .setOrigin(0.5);
    popup.add(display);

    const refresh = (): void => {
      display.setText(digits === '' ? '0' : formatMoney(Number(digits)));
    };
    const press = (key: string): void => {
      if (key === 'back') {
        digits = digits.slice(0, -1);
      } else if (digits.length + key.length <= MAX_AMOUNT_DIGITS) {
        // No leading zeros
        digits = digits === '' && (key === '0' || key === '00') ? '' : digits + key;
      }
      refresh();
    };
    const confirm = (): void => {
      row.amount = Number(digits || '0');
      this.refreshRow(row);
      this.updateSubmitState();
      this.closePopup();
    };

    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '00', '0', 'back'];
    const keyW = 84;
    const keyH = 52;
    keys.forEach((key, index) => {
      const col = index % 3;
      const line = Math.floor(index / 3);
      const btn = createMiniButton(
        scene,
        x + 24 + col * (keyW + 10) + keyW / 2,
        y + 104 + line * (keyH + 10) + keyH / 2,
        keyW,
        keyH,
        key === 'back' ? '⌫' : key,
        20,
        () => press(key)
      );
      popup.add(btn.container);
    });

    popup.add(createMiniButton(scene, x + 24 + 72, y + height - 30, 132, 38, t('je.cancel'), 14, () => this.closePopup()).container);
    const okBtn = createMiniButton(scene, x + width - 24 - 72, y + height - 30, 132, 38, t('je.ok'), 16, confirm);
    okBtn.setBorder(0xffd700);
    popup.add(okBtn.container);

    // Physical keyboard: digits, Backspace, Enter
    this.keypadHandler = (event: KeyboardEvent): void => {
      if (/^[0-9]$/.test(event.key)) {
        press(event.key);
      } else if (event.key === 'Backspace') {
        press('back');
      } else if (event.key === 'Enter') {
        confirm();
      } else if (event.key === 'Escape') {
        this.closePopup();
      }
    };
    scene.input.keyboard?.on('keydown', this.keypadHandler);

    refresh();
  }
}
