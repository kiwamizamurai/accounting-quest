import Phaser from 'phaser';
import { COLORS, DEPTH, FONT_FAMILY } from '../../config/constants';
import { HUD_HEIGHT, VIEW_WIDTH, getViewHeight } from '../../config/layout';
import { ScrollArea } from '../components/ScrollArea';
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
  onClick: () => void,
  isBlocked?: () => boolean
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
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, hover && enabled ? COLORS.ASSETS : border, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
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
    if (enabled && !isBlocked?.()) {
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
 *
 * The form is one vertical page under the top bar: the situation on top, then the debit lines,
 * then the credit lines, and the action buttons at the bottom where the thumb rests. Picking an
 * account or typing an amount opens a sheet that rises from the bottom.
 */
export class JournalEntryPanel extends Phaser.GameObjects.Container {
  private config!: JournalEntryPanelConfig;
  private rows: Row[] = [];
  private panelBody?: Phaser.GameObjects.Container;
  private popup?: Phaser.GameObjects.Container;
  private popupScroll?: ScrollArea;
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
    const height = getViewHeight();
    const top = HUD_HEIGHT;
    const body = scene.add.container(0, 0);
    this.panelBody = body;
    this.add(body);

    // A page under the top bar; it swallows taps so they do not reach the scene behind
    const page = scene.add.graphics();
    page.fillStyle(0x12122a, 1);
    page.fillRect(0, top, VIEW_WIDTH, height - top);
    page.setInteractive(new Phaser.Geom.Rectangle(0, top, VIEW_WIDTH, height - top), Phaser.Geom.Rectangle.Contains);
    body.add(page);

    body.add(
      scene.add.text(16, top + 10, t('je.title'), {
        fontFamily: FONT,
        fontSize: '18px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      })
    );

    // The situation, on a card
    const promptText = scene.add.text(24, top + 50, this.config.prompt, {
      fontFamily: FONT,
      fontSize: '15px',
      color: '#ffffff',
      wordWrap: { width: VIEW_WIDTH - 48, useAdvancedWrap: true },
      lineSpacing: 5,
      padding: { top: 2, bottom: 2 },
    });
    const cardHeight = promptText.height + 20;
    const card = scene.add.graphics();
    card.fillStyle(0x1e1e38, 1);
    card.fillRoundedRect(10, top + 42, VIEW_WIDTH - 20, cardHeight, 10);
    card.lineStyle(1, 0x3a3a5a, 1);
    card.strokeRoundedRect(10, top + 42, VIEW_WIDTH - 20, cardHeight, 10);
    body.add(card);
    body.add(promptText);

    // Room for the hint / result text (up to 4 lines) and the action buttons at the bottom
    const barY = height - 12 - 44;
    const noteHeight = 76;
    const noteY = barY - 6 - noteHeight;
    this.noteText = scene.add.text(16, noteY, '', {
      fontFamily: FONT,
      fontSize: '13px',
      color: '#ffd700',
      wordWrap: { width: VIEW_WIDTH - 32, useAdvancedWrap: true },
      lineSpacing: 3,
      padding: { top: 2, bottom: 2 },
    });
    body.add(this.noteText);

    // The note (hint / result) sits right under the last line
    const sectionsEnd = this.buildSections(body, top + 42 + cardHeight + 10, noteY - 4);
    this.noteText.setY(Math.min(sectionsEnd + 2, noteY));
    this.buildBottomBar(body, barY + 22);
    this.updateSubmitState();
  }

  /** Debit lines, then credit lines, sized to fill the space between the card and the note. Returns the y below them. */
  private buildSections(body: Phaser.GameObjects.Container, startY: number, endY: number): number {
    const { scene } = this;
    const sectionHeader = 30;
    const sectionGap = 10;
    const lineCount = Math.max(1, this.config.debitCount) + Math.max(1, this.config.creditCount);
    const room = endY - startY - 2 * (sectionHeader + 4) - sectionGap;
    const rowHeight = Math.max(40, Math.min(60, Math.floor(room / lineCount)));
    const accountWidth = 200;
    const amountWidth = 128;
    const left = 12;

    let y = startY;
    const addSection = (side: Side, count: number, color: number, label: string): void => {
      const header = scene.add.graphics();
      header.fillStyle(color, 0.25);
      header.fillRoundedRect(10, y, VIEW_WIDTH - 20, sectionHeader, 8);
      header.lineStyle(2, color, 1);
      header.strokeRoundedRect(10, y, VIEW_WIDTH - 20, sectionHeader, 8);
      body.add(header);
      body.add(
        scene.add
          .text(VIEW_WIDTH / 2, y + sectionHeader / 2, label, {
            fontFamily: FONT,
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold',
            padding: { top: 3, bottom: 3 },
          })
          .setOrigin(0.5)
      );
      y += sectionHeader + 4;

      for (let i = 0; i < Math.max(1, count); i++) {
        const cy = y + rowHeight / 2;
        const row: Row = { side, account: null, amount: 0, accountBtn: undefined as never, amountBtn: undefined as never };
        row.accountBtn = createMiniButton(scene, left + accountWidth / 2, cy, accountWidth, rowHeight - 6, t('je.pick_account'), 14, () => this.openAccountPicker(row));
        row.amountBtn = createMiniButton(scene, left + accountWidth + 8 + amountWidth / 2, cy, amountWidth, rowHeight - 6, t('je.amount'), 15, () => this.openKeypad(row));
        body.add(row.accountBtn.container);
        body.add(row.amountBtn.container);
        this.rows.push(row);
        y += rowHeight;
      }
      y += sectionGap;
    };
    addSection('debit', this.config.debitCount, COLORS.ASSETS, t('je.debit'));
    addSection('credit', this.config.creditCount, COLORS.LIABILITIES, t('je.credit'));
    return y;
  }

  private buildBottomBar(body: Phaser.GameObjects.Container, centerY: number): void {
    const { scene } = this;
    let x = 10;

    if (this.config.hint) {
      const hintBtn = createMiniButton(scene, x + 48, centerY, 96, 44, t('je.hint'), 14, () => this.toggleHint());
      body.add(hintBtn.container);
      this.sideButtons.push(hintBtn);
      x += 102;
    }
    const resetBtn = createMiniButton(scene, x + 48, centerY, 96, 44, t('je.reset'), 14, () => this.reset());
    body.add(resetBtn.container);
    this.sideButtons.push(resetBtn);

    this.submitBtn = createMiniButton(scene, VIEW_WIDTH - 10 - 70, centerY, 140, 44, t('je.submit'), 16, () => this.submit());
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
    this.noteText?.setFontSize(15);
    this.noteText?.setFontStyle('bold');
    this.noteText?.setColor(isCorrect ? '#22c55e' : '#ffd700');
    this.noteText?.setText(isCorrect ? t('je.correct') : `${t('je.incorrect')}\n${t('je.correct_answer')} ${this.config.correctAnswer}`);

    this.submitBtn?.container.destroy();
    const continueBtn = createMiniButton(scene, VIEW_WIDTH - 10 - 70, getViewHeight() - 12 - 22, 140, 44, t('je.continue'), 16, () => {
      const result = isCorrect;
      this.hide();
      this.config.onClose(result);
    });
    continueBtn.setBorder(0xffd700);
    this.panelBody?.add(continueBtn.container);
  }

  // ---------------------------------------------------------------------------
  // Bottom sheets (account picker, keypad)
  // ---------------------------------------------------------------------------

  private closePopup(): void {
    if (this.keypadHandler) {
      this.scene.input.keyboard?.off('keydown', this.keypadHandler);
      this.keypadHandler = undefined;
    }
    this.popupScroll?.destroy();
    this.popupScroll = undefined;
    this.popup?.destroy();
    this.popup = undefined;
  }

  /** A sheet rising from the bottom edge, over a dimmed page. `top` is its top edge. */
  private startSheet(sheetHeight: number, title: string): { popup: Phaser.GameObjects.Container; top: number } {
    const { scene } = this;
    const height = getViewHeight();
    this.closePopup();
    const popup = scene.add.container(0, 0);
    this.popup = popup;
    this.add(popup);

    const dim = scene.add.graphics();
    dim.fillStyle(0x000000, 0.6);
    dim.fillRect(0, 0, VIEW_WIDTH, height);
    dim.setInteractive(new Phaser.Geom.Rectangle(0, 0, VIEW_WIDTH, height), Phaser.Geom.Rectangle.Contains);
    dim.on('pointerup', () => this.closePopup());
    popup.add(dim);

    const top = height - sheetHeight;
    const frame = scene.add.graphics();
    frame.fillStyle(0x23233a, 1);
    frame.fillRoundedRect(0, top, VIEW_WIDTH, sheetHeight + 16, 16);
    frame.lineStyle(2, COLORS.ASSETS, 1);
    frame.strokeRoundedRect(0, top, VIEW_WIDTH, sheetHeight + 16, 16);
    // Swallow taps inside the sheet so they do not reach the dim layer
    frame.setInteractive(new Phaser.Geom.Rectangle(0, top, VIEW_WIDTH, sheetHeight), Phaser.Geom.Rectangle.Contains);
    popup.add(frame);

    popup.add(
      scene.add
        .text(VIEW_WIDTH / 2, top + 22, title, {
          fontFamily: FONT,
          fontSize: '16px',
          color: '#ffd700',
          fontStyle: 'bold',
          padding: { top: 3, bottom: 3 },
        })
        .setOrigin(0.5)
    );
    return { popup, top };
  }

  private openAccountPicker(row: Row): void {
    if (this.submitted) {
      return;
    }
    const height = getViewHeight();
    const sheetHeight = Math.min(height - HUD_HEIGHT - 16, 500);
    const sideLabel = row.side === 'debit' ? t('je.debit') : t('je.credit');
    const { popup, top } = this.startSheet(sheetHeight, `${sideLabel}: ${t('je.pick_account')}`);
    const { scene } = this;

    const selected = this.config.accounts.find(a => a.category === row.account);
    let activeType = selected?.type ?? (row.side === 'debit' ? AccountType.ASSET : AccountType.LIABILITY);

    // Tabs by account type
    const tabGap = 6;
    const tabW = (VIEW_WIDTH - 20 - 4 * tabGap) / 5;
    const tabButtons: MiniButton[] = [];

    // The account grid scrolls when a type has many accounts
    const gridTop = top + 42 + 42;
    const gridRect = { x: 10, y: gridTop, w: VIEW_WIDTH - 20, h: top + sheetHeight - 56 - gridTop };
    this.popupScroll = new ScrollArea(scene, gridRect, popup);
    const scroll = this.popupScroll;
    let content: Phaser.GameObjects.Container | undefined;

    const renderTab = (): void => {
      content?.destroy();
      content = scene.add.container(0, 0);
      scroll.content.add(content);

      const options = this.config.accounts.filter(a => a.type === activeType);
      const columns = 2;
      const gap = 8;
      const cellW = (gridRect.w - 6 - gap * (columns - 1)) / columns;
      const cellH = 42;

      options.forEach((option, index) => {
        const col = index % columns;
        const line = Math.floor(index / columns);
        const btn = createMiniButton(
          scene,
          gridRect.x + col * (cellW + gap) + cellW / 2,
          gridRect.y + 4 + line * (cellH + gap) + cellH / 2,
          cellW,
          cellH,
          option.label,
          14,
          () => {
            row.account = option.category;
            this.refreshRow(row);
            this.updateSubmitState();
            this.closePopup();
          },
          () => scroll.moved
        );
        btn.setFilled(option.category === row.account);
        content?.add(btn.container);
      });
      const lines = Math.ceil(options.length / columns);
      scroll.setContentHeight(4 + lines * (cellH + gap) + 4);
      scroll.scrollTo(0);
    };

    TAB_TYPES.forEach((tab, index) => {
      const btn = createMiniButton(scene, 10 + index * (tabW + tabGap) + tabW / 2, top + 62, tabW, 34, t(tab.key), 14, () => {
        activeType = tab.type;
        tabButtons.forEach((b, i) => b.setBorder(TAB_TYPES[i].type === activeType ? 0xffd700 : 0x5a5a7a));
        renderTab();
      });
      btn.setBorder(tab.type === activeType ? 0xffd700 : 0x5a5a7a);
      tabButtons.push(btn);
      popup.add(btn.container);
    });

    popup.add(createMiniButton(scene, VIEW_WIDTH / 2, top + sheetHeight - 26, 160, 40, t('je.cancel'), 14, () => this.closePopup()).container);

    renderTab();
  }

  // ---------------------------------------------------------------------------
  // Amount keypad
  // ---------------------------------------------------------------------------

  private openKeypad(row: Row): void {
    if (this.submitted) {
      return;
    }
    const keyH = 48;
    const keyGap = 8;
    const sheetHeight = 40 + 58 + 4 * (keyH + keyGap) + 56;
    const sideLabel = row.side === 'debit' ? t('je.debit') : t('je.credit');
    const accountLabel = this.config.accounts.find(a => a.category === row.account)?.label;
    const { popup, top } = this.startSheet(sheetHeight, `${sideLabel}${accountLabel ? ` ${accountLabel}` : ''}: ${t('je.enter_amount')}`);
    const { scene } = this;

    let digits = row.amount > 0 ? String(row.amount) : '';
    const display = scene.add
      .text(VIEW_WIDTH / 2, top + 66, '', {
        fontFamily: FONT,
        fontSize: '26px',
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
    const keyW = (VIEW_WIDTH - 20 - 2 * keyGap) / 3;
    keys.forEach((key, index) => {
      const col = index % 3;
      const line = Math.floor(index / 3);
      const btn = createMiniButton(
        scene,
        10 + col * (keyW + keyGap) + keyW / 2,
        top + 98 + line * (keyH + keyGap) + keyH / 2,
        keyW,
        keyH,
        key === 'back' ? '⌫' : key,
        22,
        () => press(key)
      );
      popup.add(btn.container);
    });

    const bottomY = top + sheetHeight - 30;
    popup.add(createMiniButton(scene, 10 + 50, bottomY, 100, 44, t('je.cancel'), 14, () => this.closePopup()).container);
    const okBtn = createMiniButton(scene, VIEW_WIDTH - 10 - 110, bottomY, 220, 44, t('je.ok'), 16, confirm);
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
