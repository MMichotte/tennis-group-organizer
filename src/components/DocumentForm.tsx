import { useState } from 'react';

import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useI18n } from '../i18n/I18nContext';

interface Props {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const DocumentForm = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: Props) => {
  const { t } = useI18n();
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  const onOpenDescription = () => {
    setDraftDescription(description);
    setDescriptionOpen(true);
  };

  const onSaveDescription = () => {
    onDescriptionChange(draftDescription.trim());
    setDescriptionOpen(false);
  };

  return (
    <>
      <div className="document-form">
        <div className="form-container document">
          <div className="document-row">
            <input
              className="input title-input"
              type="text"
              placeholder={t('titlePlaceholder')}
              maxLength={120}
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
            />
            <button
              type="button"
              className="button description-button"
              title={description ? t('descriptionTitle') : t('addDescription')}
              onClick={onOpenDescription}
            >
              <FontAwesomeIcon className="fa-inline" icon={faAlignLeft} />
              {description ? t('descriptionTitle') : t('addDescription')}
            </button>
          </div>
        </div>
      </div>

      {descriptionOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDescriptionOpen(false);
          }}
        >
          <div className="modal-box">
            <div className="modal-title">{t('descriptionTitle')}</div>
            <textarea
              className="textarea description-input"
              placeholder={t('descriptionPlaceholder')}
              rows={6}
              autoFocus
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
            />
            <div className="modal-actions">
              <button type="button" className="button is-ghost" onClick={() => setDescriptionOpen(false)}>
                {t('cancel')}
              </button>
              <button type="button" className="button is-success" onClick={onSaveDescription}>
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
