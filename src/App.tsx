import { useCallback, useRef, useState } from 'react';

import { faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faDownload, faFileImport, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker, { Calendar } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import 'react-multi-date-picker/styles/colors/red.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'bulma/css/bulma.min.css';
import './App.scss';

import { toDate, toDateKey } from './helpers/dates';
import { generatePlanning } from './helpers/generate-planning';
import { exportToExcel, importSpreadsheet } from './helpers/spreadsheet';
import type { GameDate, Player } from './types';

const createPlayer = (): Player => ({
  id: crypto.randomUUID(),
  name: '',
  excludeDates: [],
  playCount: 0,
});

const normalizeName = (name: string): string => name.trim().toLowerCase();

const DATE_COLUMN_WIDTH = '8rem';
const MIN_PLAYERS_PER_GAME = 2;
const MAX_PLAYERS_PER_GAME = 32;

function App() {
  const [playDates, setPlayDates] = useState<Date[]>([]);
  const [gameDates, setGameDates] = useState<GameDate[]>([]);
  const [players, setPlayers] = useState<Player[]>([createPlayer()]);
  const [playersPerGame, setPlayersPerGame] = useState(4);
  const [canExport, setCanExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPlayerInputRef = useRef<HTMLInputElement>(null);

  const hasError = players.some(
    (player) =>
      player.name.trim() !== '' &&
      players.filter((p) => normalizeName(p.name) === normalizeName(player.name)).length >
        1,
  );
  const namedPlayerCount = players.filter((p) => p.name.trim() !== '').length;
  const canGenerate = namedPlayerCount >= 1 && !hasError;

  const resetSchedule = useCallback(() => {
    setGameDates((prev) => prev.map((gd) => ({ ...gd, players: [] })));
    setCanExport(false);
  }, []);

  const onSetPlayDates = useCallback(
    (dates: Date[]) => {
      setPlayDates(dates);
      setGameDates(dates.map((date) => ({ date: toDateKey(date), players: [] })));
      setCanExport(false);
    },
    [],
  );

  const onAddPlayer = useCallback(() => {
    setPlayers((prev) => [...prev, createPlayer()]);
    resetSchedule();
    // Focus the new player's name field once it has rendered.
    requestAnimationFrame(() => lastPlayerInputRef.current?.focus());
  }, [resetSchedule]);

  const onRemovePlayer = useCallback(
    (id: string) => {
      setPlayers((prev) => {
        const remaining = prev.filter((player) => player.id !== id);
        return remaining.length === 0 ? [createPlayer()] : remaining;
      });
      resetSchedule();
    },
    [resetSchedule],
  );

  const onUpdatePlayer = useCallback(
    (id: string, patch: Partial<Player>) => {
      const duplicateName = (() => {
        const nextName = patch.name ?? '';
        if (nextName.trim() === '') return false;
        return players.some(
          (player) =>
            player.id !== id && normalizeName(player.name) === normalizeName(nextName),
        );
      })();

      if (duplicateName) {
        toast.error('Player names must be unique.', { autoClose: 5000 });
        return;
      }

      setPlayers((prev) =>
        prev.map((player) => (player.id === id ? { ...player, ...patch } : player)),
      );
      resetSchedule();
    },
    [players, resetSchedule],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onAddPlayer();
      }
    },
    [onAddPlayer],
  );

  const onGenerate = useCallback(() => {
    const namedPlayers = players.filter((player) => player.name.trim() !== '');
    if (namedPlayers.length === 0) return;

    const result = generatePlanning(namedPlayers, gameDates, playersPerGame);
    setPlayers(result.players);
    setGameDates(result.gameDates);
    setCanExport(true);

    if (result.warnings.length > 0) {
      toast.warn(
        <div>
          {result.warnings.map((warning, idx) => (
            <div key={idx}>{warning}</div>
          ))}
        </div>,
        { autoClose: 10000 },
      );
    }
  }, [gameDates, players, playersPerGame]);

  const onExportExcel = useCallback(() => {
    exportToExcel('planning_table', 'Planning', 'Tennis_Planning.xlsx').catch((error) => {
      console.error(error);
      toast.error('Could not export the planning to Excel.', { autoClose: 5000 });
    });
  }, []);

  const onImportFile = useCallback(
    async (input: React.ChangeEvent<HTMLInputElement>) => {
      const file = input.target.files?.[0];
      input.target.value = '';
      if (!file) return;

      try {
        const imported = await importSpreadsheet(file);
        setPlayers(imported.players);
        setPlayDates(imported.playDates);
        setGameDates(imported.gameDates);
        setCanExport(true);
        toast.success(
          `Imported ${imported.gameDates.length} dates for ${imported.players.length} players.`,
          { autoClose: 5000 },
        );
      } catch (error) {
        console.error(error);
        toast.error(
          `Could not import the file. Use a planning exported by this app (Excel/CSV). ${
            error instanceof Error ? error.message : ''
          }`,
          { autoClose: 7000 },
        );
      }
    },
    [],
  );

  return (
    <>
      <ToastContainer
        position="top-right"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="header">
        <span>Tennis Group Organizer</span>
      </div>

      <div className="main-content">
        <div className="settings">
          <div className="form-container date-picker">
            <div className="form-title">Play dates :</div>
            <div className="num-players-container">
              <span className="num-players-label">N° of players/game :</span>
              <input
                type="number"
                className="input num-players-input"
                min={MIN_PLAYERS_PER_GAME}
                max={MAX_PLAYERS_PER_GAME}
                value={playersPerGame}
                onChange={(event) => {
                  const value = Math.trunc(Number(event.target.value));
                  if (Number.isNaN(value)) return;
                  setPlayersPerGame(
                    Math.min(MAX_PLAYERS_PER_GAME, Math.max(MIN_PLAYERS_PER_GAME, value)),
                  );
                }}
              />
            </div>
            <Calendar
              multiple
              sort={true}
              value={playDates}
              onChange={(dates) => onSetPlayDates(dates.map((date) => toDate(date)))}
              plugins={[<DatePanel key="date-panel" />]}
            />
          </div>

          <div className="form-container players">
            <div className="form-title">Players :</div>
            {players.map((player, idx) => (
              <div className="player-from" key={player.id}>
                <input
                  className="input player-name"
                  type="text"
                  placeholder="Player's name"
                  autoFocus={idx === 0 && players.length === 1}
                  ref={idx === players.length - 1 ? lastPlayerInputRef : undefined}
                  value={player.name}
                  onChange={(event) =>
                    onUpdatePlayer(player.id, { name: event.target.value })
                  }
                  onKeyDown={onKeyDown}
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
                <button className="button is-danger" onClick={() => onRemovePlayer(player.id)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>
            ))}
            <button className="button is-success" onClick={onAddPlayer}>
              <span>+</span>
            </button>
          </div>
        </div>

        <div className="controls">
          <button className="button is-success" onClick={onGenerate} disabled={!canGenerate}>
            <FontAwesomeIcon className="fa-inline" icon={faWrench} />
            Generate Planning
          </button>
          <button className="button is-info" onClick={onExportExcel} disabled={!canExport}>
            <FontAwesomeIcon className="fa-inline" icon={faDownload} />
            Export to Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onImportFile}
            hidden
          />
          <button
            className="button is-warning"
            onClick={() => fileInputRef.current?.click()}
          >
            <FontAwesomeIcon className="fa-inline" icon={faFileImport} />
            Import Planning
          </button>
        </div>

        <div className="result">
          <div className="result-container planning">
            <div className="form-title">Planning :</div>
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
                    <td style={{ width: DATE_COLUMN_WIDTH }}>{gameDate.date}</td>
                    {gameDate.players.map((slot) => (
                      <td key={slot.id}>{slot.isPlaying ? '✅' : '❌'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
