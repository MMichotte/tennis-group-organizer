export interface Player {
  id: string;
  name: string;
  /** Dates the player cannot play (value-format from the date picker). */
  excludeDates: Array<Date | string>;
  /** How many times the player has been scheduled to play so far. */
  playCount: number;
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
