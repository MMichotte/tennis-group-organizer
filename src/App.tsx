import { useCallback, useRef, useState } from 'react';

import {
  faDownload,
  faFileImport,
  faFilePdf,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'bulma/css/bulma.min.css';
import './App.scss';

import { CalendarForm } from './components/CalendarForm';
import { DocumentForm } from './components/DocumentForm';
import { LanguageSelect } from './components/LanguageSelect';
import { PlanningTable } from './components/PlanningTable';
import { PlayersForm } from './components/PlayersForm';
import { ReplacementsForm } from './components/ReplacementsForm';
import { toDateKey } from './helpers/dates';
import { exportToPdf } from './helpers/export-to-pdf';
import { generatePlanning } from './helpers/generate-planning';
import { exportToExcel, importSpreadsheet, SpreadsheetError } from './helpers/spreadsheet';
import { useI18n } from './i18n/I18nContext';
import type { MessageKey } from './i18n/translations';
import { createPlayer, createReplacementPlayer } from './types';
import type { GameDate, Player, ReplacementPlayer } from './types';

const normalizeName = (name: string): string => name.trim().toLowerCase();

const toFileName = (title: string, extension: string): string => {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'tennis-planning'}.${extension}`;
};

function App() {
  const { locale, t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [playDates, setPlayDates] = useState<Date[]>([]);
  const [gameDates, setGameDates] = useState<GameDate[]>([]);
  const [players, setPlayers] = useState<Player[]>([createPlayer()]);
  const [replacements, setReplacements] = useState<ReplacementPlayer[]>([
    createReplacementPlayer(),
  ]);
  const [playersPerGame, setPlayersPerGame] = useState(4);
  const [canExport, setCanExport] = useState(false);
  const [openPlayerDetails, setOpenPlayerDetails] = useState<Set<string>>(new Set());
  const [replacementsOpen, setReplacementsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPlayerInputRef = useRef<HTMLInputElement>(null);
  const lastReplacementInputRef = useRef<HTMLInputElement>(null);

  const hasDuplicatePlayers = players.some(
    (player) =>
      player.name.trim() !== '' &&
      players.filter((p) => normalizeName(p.name) === normalizeName(player.name)).length >
        1,
  );
  const namedPlayerCount = players.filter((p) => p.name.trim() !== '').length;
  const canGenerate = title.trim() !== '' && namedPlayerCount >= 1 && !hasDuplicatePlayers;

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
        toast.error(t('toastUniqueNames'), { autoClose: 5000 });
        return;
      }

      setPlayers((prev) =>
        prev.map((player) => (player.id === id ? { ...player, ...patch } : player)),
      );
      if (patch.name !== undefined) {
        resetSchedule();
      }
    },
    [players, resetSchedule],
  );

  const onPlayerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onAddPlayer();
      }
    },
    [onAddPlayer],
  );

  const togglePlayerDetails = useCallback((id: string) => {
    setOpenPlayerDetails((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const onAddReplacement = useCallback(() => {
    setReplacements((prev) => [...prev, createReplacementPlayer()]);
    // Focus the new replacement's name field once it has rendered.
    requestAnimationFrame(() => lastReplacementInputRef.current?.focus());
  }, []);

  const onRemoveReplacement = useCallback((id: string) => {
    setReplacements((prev) => {
      const remaining = prev.filter((replacement) => replacement.id !== id);
      return remaining.length === 0 ? [createReplacementPlayer()] : remaining;
    });
  }, []);

  const onUpdateReplacement = useCallback(
    (id: string, patch: Partial<ReplacementPlayer>) => {
      setReplacements((prev) =>
        prev.map((replacement) =>
          replacement.id === id ? { ...replacement, ...patch } : replacement,
        ),
      );
    },
    [],
  );

  const onReplacementKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onAddReplacement();
      }
    },
    [onAddReplacement],
  );

  const onGenerate = useCallback(() => {
    const namedPlayers = players.filter((player) => player.name.trim() !== '');
    if (namedPlayers.length === 0) return;

    const result = generatePlanning(namedPlayers, gameDates, playersPerGame);
    setPlayers(result.players);
    setGameDates(result.gameDates);
    setCanExport(true);

    if (result.shortages.length > 0) {
      toast.warn(
        <div>
          {result.shortages.map((shortage, idx) => (
            <div key={idx}>
              {t('warningNotEnough', {
                date: shortage.date,
                scheduled: shortage.scheduled,
                requested: shortage.requested,
              })}
            </div>
          ))}
        </div>,
        { autoClose: 10000 },
      );
    }
  }, [gameDates, players, playersPerGame, t]);

  const onExportExcel = useCallback(() => {
    exportToExcel('planning_table', toFileName(title, 'xlsx'), {
      title,
      description,
      players,
      replacements,
    }, locale).catch((error) => {
      console.error(error);
      toast.error(t('toastExportExcelError'), { autoClose: 5000 });
    });
  }, [description, locale, players, replacements, title, t]);

  const onExportPdf = useCallback(() => {
    exportToPdf(
      { title, description, players, replacements, gameDates },
      toFileName(title, 'pdf'),
      locale,
    ).catch((error) => {
      console.error(error);
      toast.error(t('toastExportPdfError'), { autoClose: 5000 });
    });
  }, [description, gameDates, locale, players, replacements, title, t]);

  const onImportFile = useCallback(
    async (input: React.ChangeEvent<HTMLInputElement>) => {
      const file = input.target.files?.[0];
      input.target.value = '';
      if (!file) return;

      try {
        const imported = await importSpreadsheet(file);
        setTitle(imported.title);
        setDescription(imported.description);
        setPlayers(imported.players);
        setReplacements(
          imported.replacements.length > 0 ? imported.replacements : [createReplacementPlayer()],
        );
        setPlayDates(imported.playDates);
        setGameDates(imported.gameDates);
        setCanExport(true);
        toast.success(
          t('toastImportSuccess', {
            dates: imported.gameDates.length,
            players: imported.players.length,
          }),
          { autoClose: 5000 },
        );
      } catch (error) {
        console.error(error);
        const message =
          error instanceof SpreadsheetError
            ? t(error.code as MessageKey, error.params)
            : '';
        toast.error(
          t('toastImportError', { message }),
          { autoClose: 7000 },
        );
      }
    },
    [t],
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
        <LanguageSelect />
      </div>

      <div className="main-content">
        <DocumentForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
        />

        <div className="settings">
          <CalendarForm
            playDates={playDates}
            playersPerGame={playersPerGame}
            onSetPlayDates={onSetPlayDates}
            onPlayersPerGameChange={setPlayersPerGame}
          />

          <div className="form-container players">
            <div className="form-title">{t('players')}</div>
            <PlayersForm
              players={players}
              openPlayerDetails={openPlayerDetails}
              lastPlayerInputRef={lastPlayerInputRef}
              onToggleDetails={togglePlayerDetails}
              onAddPlayer={onAddPlayer}
              onRemovePlayer={onRemovePlayer}
              onUpdatePlayer={onUpdatePlayer}
              onPlayerKeyDown={onPlayerKeyDown}
            />
            <ReplacementsForm
              replacements={replacements}
              open={replacementsOpen}
              lastReplacementInputRef={lastReplacementInputRef}
              onToggleOpen={() => setReplacementsOpen((open) => !open)}
              onAddReplacement={onAddReplacement}
              onRemoveReplacement={onRemoveReplacement}
              onUpdateReplacement={onUpdateReplacement}
              onReplacementKeyDown={onReplacementKeyDown}
            />
          </div>
        </div>

        <div className="controls">
          <button className="button is-success" onClick={onGenerate} disabled={!canGenerate}>
            <FontAwesomeIcon className="fa-inline" icon={faWrench} />
            {t('generatePlanning')}
          </button>
          <button className="button is-info" onClick={onExportExcel} disabled={!canExport}>
            <FontAwesomeIcon className="fa-inline" icon={faDownload} />
            {t('exportExcel')}
          </button>
          <button className="button is-info" onClick={onExportPdf} disabled={!canExport}>
            <FontAwesomeIcon className="fa-inline" icon={faFilePdf} />
            {t('exportPdf')}
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
            {t('importPlanning')}
          </button>
        </div>

        <div className="result">
          <PlanningTable title={title} players={players} gameDates={gameDates} />
        </div>
      </div>
    </>
  );
}

export default App;
