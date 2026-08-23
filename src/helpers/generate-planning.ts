import arrayShuffle from 'array-shuffle';

import type { GameDate, Player } from '../types';
import { toDateKey } from './dates';

export interface PlanningResult {
  gameDates: GameDate[];
  players: Player[];
  warnings: string[];
}

interface Attempt {
  gameDates: GameDate[];
  players: Player[];
  /** Total number of unfilled player slots across all dates. */
  missingSlots: number;
  /** How far play counts deviate from the ideal, availability-adjusted share. */
  imbalance: number;
}

/** Number of randomized greedy passes; the best scoring result wins. */
const ATTEMPTS = 25;

const buildAttempt = (
  source: Player[],
  gameDates: GameDate[],
  perGame: number,
): Attempt => {
  const players = source.map((player) => ({ ...player }));
  const planning = gameDates.map((gd) => ({
    date: gd.date,
    players: players.map((player) => ({
      id: player.id,
      name: player.name,
      isPlaying: false,
    })),
  }));

  let missingSlots = 0;

  planning.forEach((gd, dateIndex) => {
    // Least-flexible-first: among players with the same play count, those
    // that can show up on the fewest remaining dates get to play first.
    const futureAvailability = (player: Player): number =>
      gameDates
        .slice(dateIndex + 1)
        .filter((future) => !player.excludeDates.includes(future.date)).length;

    const candidates = arrayShuffle(players)
      .filter((player) => !player.excludeDates.includes(gd.date))
      .sort(
        (a, b) =>
          a.playCount - b.playCount ||
          futureAvailability(a) - futureAvailability(b),
      );

    const scheduled = candidates.slice(0, perGame);
    scheduled.forEach((player) => {
      player.playCount += 1;
      const slot = gd.players.find((candidate) => candidate.id === player.id);
      if (slot) {
        slot.isPlaying = true;
      }
    });

    if (scheduled.length < perGame) {
      missingSlots += perGame - scheduled.length;
    }
  });

  // Fairness target: each player gets a share of the total slots proportional
  // to how many dates they are actually available for. This means a player
  // with exclusions gets fewer games — but not fewer than their schedules
  // allow for.
  const availability = players.map(
    (player) =>
      gameDates.filter((gd) => !player.excludeDates.includes(gd.date)).length,
  );
  const availabilitySum = availability.reduce((sum, count) => sum + count, 0);
  const totalSlots = perGame * gameDates.length;
  const imbalance =
    availabilitySum > 0
      ? players.reduce((sum, player, idx) => {
          const ideal =
            availability[idx] > 0 ? (totalSlots * availability[idx]) / availabilitySum : 0;
          return sum + Math.abs(player.playCount - ideal);
        }, 0)
      : 0;

  return { gameDates: planning, players, missingSlots, imbalance };
};

const isBetter = (candidate: Attempt, current: Attempt): boolean =>
  candidate.missingSlots < current.missingSlots ||
  (candidate.missingSlots === current.missingSlots && candidate.imbalance < current.imbalance);

/**
 * Builds the planning: which players play on each play date.
 *
 * The schedule is approximated by running several randomized greedy passes
 * (each date picks players in ascending play-count order, favoring the
 * least-flexible ones) and keeping the attempt with the best score: first
 * minimal missing slots (every date filled), then minimal availability-
 * adjusted play-count imbalance.
 */
export const generatePlanning = (
  players: Player[],
  gameDates: GameDate[],
  playersPerGame: number,
): PlanningResult => {
  const perGame = Math.max(1, Math.trunc(playersPerGame) || 1);
  if (!gameDates.length) {
    return { gameDates: [], players, warnings: [] };
  }

  const normalizedPlayers = players.map((player) => ({
    ...player,
    excludeDates: player.excludeDates.map((date) => toDateKey(date)),
    playCount: 0,
  }));

  let best = buildAttempt(normalizedPlayers, gameDates, perGame);
  for (let attemptNo = 1; attemptNo < ATTEMPTS; attemptNo += 1) {
    const attempt = buildAttempt(normalizedPlayers, gameDates, perGame);
    if (isBetter(attempt, best)) {
      best = attempt;
    }
  }

  const warnings = best.gameDates.flatMap((gd) => {
    const scheduled = gd.players.filter((player) => player.isPlaying).length;
    return scheduled < perGame
      ? [`Not enough available players for ${gd.date} - ${scheduled}/${perGame} scheduled`]
      : [];
  });

  return { gameDates: best.gameDates, players: best.players, warnings };
};
