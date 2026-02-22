import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Office scene ===
  {
    id: 'start',
    type: 'background',
    background: 'office',
    next: 'mentor_enter',
  },
  {
    id: 'mentor_enter',
    type: 'character_enter',
    character: 'mentor',
    position: 'right',
    expression: 'happy',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_3',
    expression: 'thinking',
    next: 'dialog_4',
  },
  {
    id: 'dialog_4',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_4',
    expression: 'normal',
    next: 'choice_capital',
  },

  // === Initial Capital Choice ===
  {
    id: 'choice_capital',
    type: 'choice',
    speaker: 'mentor',
    promptKey: 'ch101.choice_capital.prompt',
    choices: [
      {
        labelKey: 'ch101.choice_capital.0',
        next: 'invest_5000',
        effects: {
          transaction: {
            entries: [
              { account: 'SAVINGS_ACCOUNT', debit: 5000 },
              { account: 'OWNERS_CAPITAL', credit: 5000 },
            ],
          },
          setFlags: { capitalAmount: 5000 },
        },
      },
      {
        labelKey: 'ch101.choice_capital.1',
        next: 'invest_10000',
        effects: {
          transaction: {
            entries: [
              { account: 'SAVINGS_ACCOUNT', debit: 10000 },
              { account: 'OWNERS_CAPITAL', credit: 10000 },
            ],
          },
          setFlags: { capitalAmount: 10000 },
        },
      },
    ],
  },

  // === Capital Result (5000) ===
  {
    id: 'invest_5000',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.invest_5000',
    expression: 'happy',
    next: 'show_bs_1',
  },

  // === Capital Result (10000) ===
  {
    id: 'invest_10000',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.invest_10000',
    expression: 'surprised',
    next: 'show_bs_1',
  },

  // === First Balance Sheet ===
  {
    id: 'show_bs_1',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch101.show_bs_1.msg',
    next: 'dialog_bank_intro',
  },

  // === Checking Account Setup ===
  {
    id: 'dialog_bank_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_bank_intro',
    expression: 'thinking',
    next: 'banker_enter',
  },
  {
    id: 'banker_enter',
    type: 'character_enter',
    character: 'banker',
    position: 'left',
    expression: 'normal',
    next: 'dialog_bank_1',
  },
  {
    id: 'dialog_bank_1',
    type: 'dialog',
    speaker: 'banker',
    textKey: 'ch101.dialog_bank_1',
    expression: 'happy',
    next: 'dialog_bank_2',
  },
  {
    id: 'dialog_bank_2',
    type: 'dialog',
    speaker: 'banker',
    textKey: 'ch101.dialog_bank_2',
    expression: 'normal',
    next: 'open_checking',
  },
  {
    id: 'open_checking',
    type: 'transaction',
    descriptionKey: 'ch101.open_checking.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 2000 },
      { account: 'SAVINGS_ACCOUNT', credit: 2000 },
    ],
    showAnimation: true,
    next: 'dialog_checking_done',
  },
  {
    id: 'dialog_checking_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_checking_done',
    expression: 'happy',
    next: 'dialog_deposit',
  },

  // === Security Deposit ===
  {
    id: 'dialog_deposit',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_deposit',
    expression: 'thinking',
    next: 'dialog_deposit_2',
  },
  {
    id: 'dialog_deposit_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_deposit_2',
    expression: 'normal',
    next: 'pay_deposit',
  },
  {
    id: 'pay_deposit',
    type: 'transaction',
    descriptionKey: 'ch101.pay_deposit.desc',
    entries: [
      { account: 'SECURITY_DEPOSITS', debit: 500 },
      { account: 'CHECKING_ACCOUNT', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_deposit_explain',
  },
  {
    id: 'dialog_deposit_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_deposit_explain',
    expression: 'normal',
    next: 'banker_exit',
  },
  {
    id: 'banker_exit',
    type: 'character_exit',
    character: 'banker',
    next: 'show_final_bs',
  },

  // === Final Balance Sheet ===
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch101.show_final_bs.msg',
    next: 'quiz_1',
  },

  // === Quiz ===
  {
    id: 'quiz_1',
    type: 'quiz',
    questionKey: 'ch101.quiz_1.question',
    options: [
      { labelKey: 'ch101.quiz_1.option_0' },
      { labelKey: 'ch101.quiz_1.option_1' },
      { labelKey: 'ch101.quiz_1.option_2' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch101.quiz_1.correct',
    incorrectFeedbackKey: 'ch101.quiz_1.incorrect',
    expReward: 10,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_summary',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch101.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 102,
    summaryKey: 'ch101.chapter_end.summary',
  },
];

export const chapter101: ChapterScript = {
  id: 101,
  titleKey: 'ch101.title',
  subtitleKey: 'ch101.subtitle',
  nodes,
};
