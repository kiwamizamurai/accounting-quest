export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  concepts: string[];
  mapId: string;
  requiredLevel: number;
  unlocked: boolean;
}

export interface ChapterProgress {
  chapterId: number;
  started: boolean;
  completed: boolean;
  questsCompleted: number;
  totalQuests: number;
  conceptsLearned: string[];
  score: number;
  maxScore: number;
}

export interface Quest {
  id: string;
  chapterId: number;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  dialogueKey: string;
  completed: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: QuestObjectiveType;
  target: number;
  current: number;
  completed: boolean;
}

export enum QuestObjectiveType {
  RECORD_TRANSACTION = 'RECORD_TRANSACTION',
  BALANCE_EQUATION = 'BALANCE_EQUATION',
  ANSWER_QUIZ = 'ANSWER_QUIZ',
  EARN_PROFIT = 'EARN_PROFIT',
  COLLECT_ITEMS = 'COLLECT_ITEMS',
  TALK_TO_NPC = 'TALK_TO_NPC',
  REACH_LOCATION = 'REACH_LOCATION',
}

export interface QuestReward {
  gold: number;
  exp: number;
  items?: string[];
  conceptsUnlocked?: string[];
}
