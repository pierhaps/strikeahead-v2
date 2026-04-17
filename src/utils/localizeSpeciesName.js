/**
 * Get the localized species name based on the user's app language.
 * Falls back to name_en if the translation is missing.
 *
 * @param {Object} species - Species object with name_* fields
 * @param {string} langCode - Language code (e.g., 'de', 'es', 'el')
 * @returns {string} - Localized species name
 */
export function getLocalizedSpeciesName(species, langCode) {
  if (!species) return '';

  // Map language codes to species field names
  const langMap = {
    es: 'name_es',
    fr: 'name_fr',
    it: 'name_it',
    hr: 'name_hr',
    pt: 'name_pt',
    nl: 'name_nl',
    tr: 'name_tr',
    el: 'name_el',
    sq: 'name_sq',
    de: 'name_de',
  };

  const fieldName = langMap[langCode];
  const localizedName = fieldName ? species[fieldName] : null;

  // Return localized name if available, otherwise fall back to name_en or generic name
  return localizedName || species.name_en || species.name || '';
}