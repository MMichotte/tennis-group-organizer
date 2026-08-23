export interface Player {
  id: string;
  name: string;
  /** Dates the player cannot play (value-format from the date picker). */
  excludeDates: Array<Date | string>;
  /** How many times the player has been scheduled to play so far. */
  playCount: number;
  /** Optional contact details. */
  email?: string;
  phone?: string;
}

export interface ReplacementPlayer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface GameSlot {
  id: string;
  name: string;
  isPlaying: boolean;
}

export interface GameDate {
  /** Local date in YYYY-MM-DD format. */
  date: string;
  /** One slot per registered player; isPlaying marks who plays on that date. */
  players: GameSlot[];
}

export interface PlanningDocument {
  /** Document/planning title. */
  title: string;
  /** Optional free-text description. */
  description: string;
}

export const createPlayer = (): Player => ({
  id: crypto.randomUUID(),
  name: '',
  excludeDates: [],
  playCount: 0,
});

export const createReplacementPlayer = (): ReplacementPlayer => ({
  id: crypto.randomUUID(),
  name: '',
});
