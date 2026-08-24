import type { Ref } from 'react';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';

import { toDate } from '../helpers/dates';
import { calendarLocales } from '../i18n/calendar-locales';
import { useI18n } from '../i18n/I18nContext';
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
}: Props) => {
  const { locale, t } = useI18n();
  return (
    <>
      {players.map((player, idx) => {
        const detailsOpen = openPlayerDetails.has(player.id);
        return (
          <div className="player-from" key={player.id}>
            <div className="player-line">
              <input
                className="input player-name"
                type="text"
                placeholder={t('playerName')}
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
                locale={calendarLocales[locale]}
                onChange={(dates) =>
                  onUpdatePlayer(player.id, {
                    excludeDates: dates.map((date) => toDate(date)),
                  })
                }
                placeholder={t('excludeDates')}
                plugins={[<DatePanel key="date-panel" header={t('panelDates')} />]}
              />
              <button
                type="button"
                className="button is-ghost details-toggle"
                title={t('contactDetails')}
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
                  placeholder={t('emailOptional')}
                  value={player.email ?? ''}
                  onChange={(event) => onUpdatePlayer(player.id, { email: event.target.value })}
                />
                <input
                  className="input contact-input"
                  type="tel"
                  placeholder={t('phoneOptional')}
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
};
