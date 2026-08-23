import type { Ref } from 'react';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';

import { toDate } from '../helpers/dates';
import type { Player } from '../types';

interface Props {
  players: Player[];
  openPlayerDetails: Set<string>;
  lastPlayerInputRef: Ref<HTMLInputElement>;
  onToggleDetails: (id: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, patch: Partial<Player>) => void;
  onPlayerKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const PlayersForm = ({
  players,
  openPlayerDetails,
  lastPlayerInputRef,
  onToggleDetails,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  onPlayerKeyDown,
}: Props) => (
  <>
    {players.map((player, idx) => {
      const detailsOpen = openPlayerDetails.has(player.id);
      return (
        <div className="player-from" key={player.id}>
          <div className="player-line">
            <input
              className="input player-name"
              type="text"
              placeholder="Player's name"
              autoFocus={idx === 0 && players.length === 1}
              ref={idx === players.length - 1 ? lastPlayerInputRef : undefined}
              value={player.name}
              onChange={(event) => onUpdatePlayer(player.id, { name: event.target.value })}
              onKeyDown={onPlayerKeyDown}
            />
            <DatePicker
              className="red"
              multiple
              sort={true}
              value={player.excludeDates}
              onChange={(dates) =>
                onUpdatePlayer(player.id, {
                  excludeDates: dates.map((date) => toDate(date)),
                })
              }
              placeholder="Exclude dates"
              plugins={[<DatePanel key="date-panel" />]}
            />
            <button
              type="button"
              className="button is-ghost details-toggle"
              title="Contact details"
              onClick={() => onToggleDetails(player.id)}
            >
              <FontAwesomeIcon icon={detailsOpen ? faChevronDown : faChevronRight} />
            </button>
            <button
              type="button"
              className="button is-danger"
              onClick={() => onRemovePlayer(player.id)}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
          {detailsOpen && (
            <div className="player-contact-row">
              <input
                className="input contact-input"
                type="email"
                placeholder="Email (optional)"
                value={player.email ?? ''}
                onChange={(event) => onUpdatePlayer(player.id, { email: event.target.value })}
              />
              <input
                className="input contact-input"
                type="tel"
                placeholder="Phone (optional)"
                value={player.phone ?? ''}
                onChange={(event) => onUpdatePlayer(player.id, { phone: event.target.value })}
              />
            </div>
          )}
        </div>
      );
    })}
    <button className="button is-success" onClick={onAddPlayer}>
      <span>+</span>
    </button>
  </>
);
