import { toWeekdayName } from '../helpers/dates';
import type { GameDate, Player } from '../types';

const DATE_COLUMN_WIDTH = '8rem';

interface Props {
  title: string;
  players: Player[];
  gameDates: GameDate[];
}

export const PlanningTable = ({ title, players, gameDates }: Props) => (
  <div className="result-container planning">
    <div className="form-title">{title.trim() || 'Planning'} :</div>
    <table className="table is-striped is-fullwidth" id="planning_table">
      <thead>
        <tr>
          <th style={{ width: DATE_COLUMN_WIDTH }}>Date</th>
          {players.map((player) =>
            player.name.trim() !== '' ? (
              <th key={player.id}>
                {player.name} ({player.playCount})
              </th>
            ) : null,
          )}
        </tr>
      </thead>
      <tbody>
        {gameDates.map((gameDate) => (
          <tr key={gameDate.date}>
            <td style={{ width: DATE_COLUMN_WIDTH }}>
              {gameDate.date} ({toWeekdayName(gameDate.date)})
            </td>
            {gameDate.players.map((slot) => (
              <td key={slot.id}>{slot.isPlaying ? '✅' : '❌'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
