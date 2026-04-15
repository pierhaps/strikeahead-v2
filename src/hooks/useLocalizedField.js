import { useTranslation } from 'react-i18next';

/**
 * Returns the best localized value for a given field on an entity.
 * Fallback chain: lang_field → en_field → de_field → field
 * Albanian (sq) explicitly: sq → en → de
 */
export function useLocalizedField() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'de';

  const getField = (entity, fieldName) => {
    if (!entity) return '';
    const candidates = [
      entity[`${fieldName}_${lang}`],
      entity[`${fieldName}_en`],
      entity[`${fieldName}_de`],
      entity[fieldName],
    ];
    return candidates.find(v => v != null && v !== '') ?? '';
  };

  return getField;
}

export default useLocalizedField;