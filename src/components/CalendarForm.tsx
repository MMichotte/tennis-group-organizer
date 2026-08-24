import { Calendar } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';

import { calendarLocales } from '../i18n/calendar-locales';
import { useI18n } from '../i18n/I18nContext';
import { toDate } from '../helpers/dates';

const MIN_PLAYERS_PER_GAME = 2;
const MAX_PLAYERS_PER_GAME = 32;

interface Props {
  playDates: Date[];
  playersPerGame: number;
  onSetPlayDates: (dates: Date[]) => void;
  onPlayersPerGameChange: (value: number) => void;
}

export const CalendarForm = ({
  playDates,
  playersPerGame,
  onSetPlayDates,
  onPlayersPerGameChange,
}: Props) => {
  const { locale, t } = useI18n();
  return (
    <div className="form-container date-picker">
      <div className="form-title">{t('playDates')}</div>
      <div className="num-players-container">
        <span className="num-players-label">{t('playersPerGame')}</span>
        <input
          type="number"
          className="input num-players-input"
          min={MIN_PLAYERS_PER_GAME}
          max={MAX_PLAYERS_PER_GAME}
          value={playersPerGame}
          onChange={(event) => {
            const value = Math.trunc(Number(event.target.value));
            if (Number.isNaN(value)) return;
            onPlayersPerGameChange(
              Math.min(MAX_PLAYERS_PER_GAME, Math.max(MIN_PLAYERS_PER_GAME, value)),
            );
          }}
        />
      </div>
      <Calendar
        multiple
        sort={true}
        value={playDates}
        locale={calendarLocales[locale]}
        onChange={(dates) => onSetPlayDates(dates.map((date) => toDate(date)))}
        plugins={[<DatePanel key="date-panel" header={t('panelDates')} />]}
      />
    </div>
  );
};
