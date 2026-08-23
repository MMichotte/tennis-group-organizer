import type { Ref } from 'react';

import { faChevronDown, faChevronRight, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import type { ReplacementPlayer } from '../types';

interface Props {
  replacements: ReplacementPlayer[];
  open: boolean;
  lastReplacementInputRef: Ref<HTMLInputElement>;
  onToggleOpen: () => void;
  onAddReplacement: () => void;
  onRemoveReplacement: (id: string) => void;
  onUpdateReplacement: (id: string, patch: Partial<ReplacementPlayer>) => void;
  onReplacementKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ReplacementsForm = ({
  replacements,
  open,
  lastReplacementInputRef,
  onToggleOpen,
  onAddReplacement,
  onRemoveReplacement,
  onUpdateReplacement,
  onReplacementKeyDown,
}: Props) => (
  <div className="replacements">
    <button type="button" className="collapse-toggle" onClick={onToggleOpen}>
      <FontAwesomeIcon className="fa-inline" icon={open ? faChevronDown : faChevronRight} />
      Replacements
    </button>
    {open && (
      <>
        {replacements.map((replacement, idx) => (
          <div className="player-from player-line" key={replacement.id}>
            <input
              className="input player-name"
              type="text"
              placeholder="Name"
              autoFocus={idx === 0 && replacements.length === 1}
              ref={idx === replacements.length - 1 ? lastReplacementInputRef : undefined}
              value={replacement.name}
              onChange={(event) =>
                onUpdateReplacement(replacement.id, { name: event.target.value })
              }
              onKeyDown={onReplacementKeyDown}
            />
            <input
              className="input contact-input"
              type="email"
              placeholder="Email (optional)"
              value={replacement.email ?? ''}
              onChange={(event) =>
                onUpdateReplacement(replacement.id, { email: event.target.value })
              }
            />
            <input
              className="input contact-input"
              type="tel"
              placeholder="Phone (optional)"
              value={replacement.phone ?? ''}
              onChange={(event) =>
                onUpdateReplacement(replacement.id, { phone: event.target.value })
              }
            />
            <button
              className="button is-danger"
              onClick={() => onRemoveReplacement(replacement.id)}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </div>
        ))}
        <button className="button is-success" onClick={onAddReplacement}>
          <span>+</span>
        </button>
        <div className="hint">Not included in the planning — available as a spare list.</div>
      </>
    )}
  </div>
);
