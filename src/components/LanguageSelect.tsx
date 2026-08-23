import { LOCALES, type Locale } from '../i18n/translations';
import { useI18n } from '../i18n/I18nContext';

export const LanguageSelect = () => {
  const { locale, setLocale } = useI18n();
  return (
    <select
      className="language-select"
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
    >
      {LOCALES.map((code) => (
        <option key={code} value={code}>
          {code.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
