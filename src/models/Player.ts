export interface Player {
  name: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  gold: number;

  // Position
  x: number;
  y: number;
  direction: Direction;
  currentMap: string;

  // Progression
  currentChapter: number;
  completedChapters: number[];
  unlockedMaps: string[];

  // Stats (accounting mastery)
  masteredConcepts: string[];
  quizScore: number;
  totalQuizQuestions: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export function createNewPlayer(name: string): Player {
  return {
    name,
    level: 1,
    exp: 0,
    expToNextLevel: 100,
    gold: 0,
    x: 400,
    y: 300,
    direction: 'down',
    currentMap: 'village',
    currentChapter: 1,
    completedChapters: [],
    unlockedMaps: ['village'],
    masteredConcepts: [],
    quizScore: 0,
    totalQuizQuestions: 0,
  };
}

export function calculateExpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function addExp(player: Player, amount: number): { leveledUp: boolean; newLevel: number } {
  player.exp += amount;

  let leveledUp = false;
  while (player.exp >= player.expToNextLevel) {
    player.exp -= player.expToNextLevel;
    player.level++;
    player.expToNextLevel = calculateExpToNextLevel(player.level);
    leveledUp = true;
  }

  return { leveledUp, newLevel: player.level };
}
