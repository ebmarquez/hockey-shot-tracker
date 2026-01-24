export type Period = 1 | 2 | 3 | 'OT';
export type Team = 'home' | 'away';
export type ShotType = 'wrist' | 'slap' | 'snap' | 'backhand' | 'tip';
export type ShotResult = 'goal' | 'save' | 'miss' | 'blocked';

export interface Shot {
  id: string;
  period: Period;
  timestamp: number;
  team: Team;
  playerNumber?: number;
  playerName?: string;
  x: number; // 0-100, % from left
  y: number; // 0-100, % from top
  shotType: ShotType;
  result: ShotResult;
}

export interface Player {
  number: number;
  name: string;
}

export interface Game {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  currentPeriod: Period;
  shots: Shot[];
  homePlayers?: Player[];
  awayPlayers?: Player[];
}

export interface GameState {
  game: Game | null;
  isGameActive: boolean;
  selectedTeam: Team | null;
  pendingShot: Partial<Shot> | null;
}

export interface GameStats {
  totalShots: number;
  goals: number;
  saves: number;
  misses: number;
  blocked: number;
  shootingPercentage: number;
  shotsByPeriod: Record<Period, number>;
  shotsByType: Record<ShotType, number>;
}
