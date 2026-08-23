import type { Ref } from 'react';

import { faChevronDown, faChevronRight, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useI18n } from '../i18n/I18nContext';
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
}: Props) => {
  const { t } = useI18n();
  return (
    <div className="replacements">
      <button type="button" className="collapse-toggle" onClick={onToggleOpen}>
        <FontAwesomeIcon
          className="fa-inline"
          icon={open ? faChevronDown : faChevronRight}
        />
        {t('replacements')}
      </button>
      {open && (
        <>
          {replacements.map((replacement, idx) => (
            <div className="player-from player-line" key={replacement.id}>
              <input
                className="input player-name"
                type="text"
                placeholder={t('namePlaceholder')}
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
                placeholder={t('emailOptional')}
                value={replacement.email ?? ''}
                onChange={(event) =>
                  onUpdateReplacement(replacement.id, { email: event.target.value })
                }
              />
              <input
                className="input contact-input"
                type="tel"
                placeholder={t('phoneOptional')}
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
          <div className="hint">{t('replacementsHint')}</div>
        </>
      )}
    </div>
  );
};
