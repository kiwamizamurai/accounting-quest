import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Creating a Subsidiary ===
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
    textKey: 'ch206.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_3',
    expression: 'thinking',
    next: 'dialog_subsidiary_explain',
  },

  // === Explain Subsidiary Acquisition ===
  {
    id: 'dialog_subsidiary_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_subsidiary_explain',
    expression: 'thinking',
    next: 'dialog_why_acquire',
  },
  {
    id: 'dialog_why_acquire',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_why_acquire',
    expression: 'normal',
    next: 'choice_acquisition',
  },

  // === Acquisition Choice ===
  {
    id: 'choice_acquisition',
    type: 'choice',
    promptKey: 'ch206.choice_acquisition.prompt',
    choices: [
      {
        labelKey: 'ch206.choice_acquisition.0',
        next: 'acquire_full',
        effects: { setFlags: { acquisitionType: 'full' } },
      },
      {
        labelKey: 'ch206.choice_acquisition.1',
        next: 'acquire_full',
        effects: { setFlags: { acquisitionType: 'strategic' } },
      },
    ],
  },
  {
    id: 'acquire_full',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.acquire_full',
    expression: 'normal',
    next: 'acquire_tx',
  },

  // === Acquire 100% of Subsidiary ===
  {
    id: 'acquire_tx',
    type: 'transaction',
    descriptionKey: 'ch206.acquire_tx.desc',
    entries: [
      { account: 'SUBSIDIARY_SECURITIES', debit: 8000 },
      { account: 'CHECKING_ACCOUNT', credit: 8000 },
    ],
    showAnimation: true,
    next: 'dialog_after_acquire',
  },
  {
    id: 'dialog_after_acquire',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_after_acquire',
    expression: 'happy',
    next: 'show_bs_after_acquire',
  },
  {
    id: 'show_bs_after_acquire',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch206.show_bs_after_acquire.msg',
    next: 'goodwill_intro',
  },

  // === Goodwill Recognition (Consolidation Entry) ===
  {
    id: 'goodwill_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.goodwill_intro',
    expression: 'thinking',
    next: 'goodwill_recognition_narration',
  },
  {
    id: 'goodwill_recognition_narration',
    type: 'narration',
    textKey: 'ch206.goodwill_recognition_narration',
    next: 'goodwill_recognition_tx',
  },
  {
    id: 'goodwill_recognition_tx',
    type: 'transaction',
    descriptionKey: 'ch206.goodwill_recognition_tx.desc',
    entries: [
      { account: 'GOODWILL', debit: 2000 },
      { account: 'SUBSIDIARY_SECURITIES', credit: 2000 },
    ],
    showAnimation: true,
    next: 'dialog_goodwill_explain',
  },

  // === Goodwill Explanation ===
  {
    id: 'dialog_goodwill_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_goodwill_explain',
    expression: 'thinking',
    next: 'dialog_goodwill_calc',
  },
  {
    id: 'dialog_goodwill_calc',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_goodwill_calc',
    expression: 'normal',
    next: 'goodwill_narration',
  },
  {
    id: 'goodwill_narration',
    type: 'narration',
    textKey: 'ch206.goodwill_narration',
    next: 'dialog_goodwill_meaning',
  },
  {
    id: 'dialog_goodwill_meaning',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_goodwill_meaning',
    expression: 'normal',
    next: 'quiz_intro',
  },

  // === Quiz: What is Goodwill? ===
  {
    id: 'quiz_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.quiz_intro',
    expression: 'happy',
    next: 'quiz_goodwill',
  },
  {
    id: 'quiz_goodwill',
    type: 'quiz',
    questionKey: 'ch206.quiz_goodwill.question',
    options: [
      { labelKey: 'ch206.quiz_goodwill.0' },
      { labelKey: 'ch206.quiz_goodwill.1' },
      { labelKey: 'ch206.quiz_goodwill.2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch206.quiz_goodwill.correct',
    incorrectFeedbackKey: 'ch206.quiz_goodwill.incorrect',
    expReward: 30,
    next: 'amortize_intro',
  },

  // === Amortize Goodwill ===
  {
    id: 'amortize_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.amortize_intro',
    expression: 'thinking',
    next: 'dialog_amortize_explain',
  },
  {
    id: 'dialog_amortize_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_amortize_explain',
    expression: 'normal',
    next: 'amortize_tx',
  },
  {
    id: 'amortize_tx',
    type: 'transaction',
    descriptionKey: 'ch206.amortize_tx.desc',
    entries: [
      { account: 'GOODWILL_AMORTIZATION', debit: 400 },
      { account: 'GOODWILL', credit: 400 },
    ],
    showAnimation: true,
    next: 'dialog_after_amortize',
  },
  {
    id: 'dialog_after_amortize',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_after_amortize',
    expression: 'normal',
    next: 'show_final_bs',
  },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch206.show_final_bs.msg',
    next: 'show_final_pl',
  },
  {
    id: 'show_final_pl',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch206.show_final_pl.msg',
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_summary',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch206.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 207,
    summaryKey: 'ch206.chapter_end.summary',
  },
];

export const chapter206: ChapterScript = {
  id: 206,
  titleKey: 'ch206.title',
  subtitleKey: 'ch206.subtitle',
  nodes,
};
