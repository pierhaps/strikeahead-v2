// StrikeAhead Bait Intelligence
// Recommends baits and techniques based on target species, weather, time-of-day, water type.
//
// Data is curated heuristic — the same rules human anglers use as rule-of-thumb starting points.
// Every recommendation has a `why` key so the UI can explain the reasoning in any language.

// Species → preferred bait categories with weight (higher = stronger recommendation)
const SPECIES_PROFILES = {
  Hecht:             { categories: ['artificial', 'live'], baits: ['Gummifisch Shad 10cm', 'Jerkbait 15cm', 'Spinner Gr. 3', 'Köderfisch (tot)'], techniques: ['spinnfischen', 'jerken', 'trolling'] },
  Zander:            { categories: ['artificial', 'natural'], baits: ['Gummifisch Shad 10cm', 'Jig 20g', 'Köderfisch (tot)', 'Wurm'], techniques: ['faulenzen', 'vertikalangeln'] },
  Barsch:            { categories: ['artificial', 'natural'], baits: ['Twister 5cm', 'Creature Bait Krebs', 'Wurm', 'Made'], techniques: ['dropshot', 'finesse'] },
  Karpfen:           { categories: ['natural'], baits: ['Boilie 20mm', 'Mais', 'Teig', 'Pellet 8mm'], techniques: ['grundangeln', 'method-feeder'] },
  Bachforelle:       { categories: ['artificial', 'natural'], baits: ['Spinner Gr. 3', 'Nymphe', 'Wurm', 'Trockenfliege'], techniques: ['fliegenfischen', 'spinnfischen'] },
  Regenbogenforelle: { categories: ['artificial', 'natural'], baits: ['Spinner Gr. 3', 'Nymphe', 'Teig', 'Made'], techniques: ['fliegenfischen', 'sbirolino'] },
  Wels:              { categories: ['live', 'natural'], baits: ['Köderfisch (lebend)', 'Wurm', 'Tintenfisch-Streifen'], techniques: ['grundangeln', 'klopfen'] },
  Aal:               { categories: ['natural'], baits: ['Wurm', 'Köderfisch (tot)', 'Tintenfisch-Streifen'], techniques: ['grundangeln', 'posenangeln'] },
  Dorsch:            { categories: ['artificial', 'natural'], baits: ['Pilker 100g', 'Wattwurm', 'Sardine'], techniques: ['pilken', 'naturköder'] },
  Makrele:           { categories: ['artificial'], baits: ['Makrelenpaternoster', 'Pilker 100g'], techniques: ['pilken', 'trolling'] },
  Thunfisch:         { categories: ['live', 'artificial'], baits: ['Köderfisch (lebend)', 'Stickbait 12cm', 'Popper'], techniques: ['trolling', 'popping'] },
  Wolfsbarsch:       { categories: ['artificial', 'live'], baits: ['Jerkbait 15cm', 'Gummifisch Shad 10cm', 'Garnele'], techniques: ['spinnfischen', 'brandungsangeln'] },
  Lachs:             { categories: ['artificial'], baits: ['Löffel 20g Silber', 'Wobbler Tief 3m', 'Streamer'], techniques: ['trolling', 'fliegenfischen'] },
  Saibling:          { categories: ['natural', 'artificial'], baits: ['Teig', 'Nymphe', 'Wurm'], techniques: ['fliegenfischen', 'sbirolino'] },
  Hering:            { categories: ['artificial'], baits: ['Heringspaternoster'], techniques: ['paternoster'] },
  Scholle:           { categories: ['natural'], baits: ['Wattwurm', 'Seeringelwurm'], techniques: ['brandungsangeln'] },
  Seezunge:          { categories: ['natural'], baits: ['Wattwurm', 'Garnele'], techniques: ['brandungsangeln'] },
  Goldbrasse:        { categories: ['natural'], baits: ['Garnele', 'Tintenfisch-Streifen', 'Miesmuschel'], techniques: ['brandungsangeln', 'grundangeln'] },
  Seehecht:          { categories: ['natural', 'artificial'], baits: ['Sardine', 'Pilker 100g'], techniques: ['trolling', 'pilken'] },
  Rotbarbe:          { categories: ['natural'], baits: ['Garnele', 'Wurm'], techniques: ['brandungsangeln'] },
  Brasse:            { categories: ['natural'], baits: ['Wurm', 'Mais', 'Made'], techniques: ['feedern', 'posenangeln'] },
  Schleie:           { categories: ['natural'], baits: ['Wurm', 'Mais', 'Boilie 20mm'], techniques: ['posenangeln', 'feedern'] },
  Bonito:            { categories: ['artificial'], baits: ['Löffel 20g Silber', 'Stickbait 12cm'], techniques: ['trolling', 'spinnfischen'] },
  Barrakuda:         { categories: ['artificial'], baits: ['Jerkbait 15cm', 'Stickbait 12cm'], techniques: ['popping', 'trolling'] },
};

// Time-of-day windows
export function getTimeOfDay(hour = new Date().getHours()) {
  if (hour >= 4 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

// Weather condition classification
export function classifyWeather(w = {}) {
  const pressure = Number(w.pressure_hpa);
  const airTemp = Number(w.air_temp_c);
  const wind = Number(w.wind_speed_kmh);
  const cloud = Number(w.cloud_cover_pct);

  const tags = [];
  if (Number.isFinite(pressure)) {
    if (pressure >= 1020) tags.push('high_pressure');
    else if (pressure <= 1005) tags.push('low_pressure');
    else tags.push('neutral_pressure');
  }
  if (Number.isFinite(airTemp)) {
    if (airTemp <= 5) tags.push('cold');
    else if (airTemp >= 25) tags.push('hot');
    else tags.push('mild');
  }
  if (Number.isFinite(wind)) {
    if (wind >= 25) tags.push('windy');
    else if (wind <= 5) tags.push('calm');
  }
  if (Number.isFinite(cloud)) {
    if (cloud >= 70) tags.push('overcast');
    else if (cloud <= 20) tags.push('sunny');
  }
  return tags;
}

// Returns array of bait recommendations with reasoning
export function recommendBaits({ species, weather = {}, hour = new Date().getHours(), water_type = null, limit = 5 } = {}) {
  const tod = getTimeOfDay(hour);
  const weatherTags = classifyWeather(weather);
  const profile = species && SPECIES_PROFILES[species] ? SPECIES_PROFILES[species] : null;

  // Score every bait the species profile suggests
  const results = [];
  if (profile) {
    profile.baits.forEach((name, idx) => {
      let score = 100 - idx * 5;
      const reasons = [];

      // Species affinity is the primary driver
      reasons.push({ key: 'bait.reason.species_match', vars: { species } });

      // Weather modifiers
      if (weatherTags.includes('low_pressure')) {
        // Fish often feed aggressively before fronts — boost active lures
        if (['artificial'].includes(inferCategory(name))) {
          score += 8;
          reasons.push({ key: 'bait.reason.low_pressure_active' });
        }
      }
      if (weatherTags.includes('high_pressure')) {
        if (inferCategory(name) === 'natural') {
          score += 5;
          reasons.push({ key: 'bait.reason.high_pressure_slow' });
        }
      }
      if (weatherTags.includes('overcast')) {
        if (['Gummifisch Shad 10cm', 'Jerkbait 15cm', 'Spinner Gr. 3'].includes(name)) {
          score += 5;
          reasons.push({ key: 'bait.reason.overcast_aggressive' });
        }
      }
      if (weatherTags.includes('cold')) {
        if (['Wurm', 'Made', 'Köderfisch (tot)', 'Boilie 20mm'].includes(name)) {
          score += 6;
          reasons.push({ key: 'bait.reason.cold_natural' });
        }
      }

      // Time-of-day modifiers
      if (['dawn', 'dusk'].includes(tod)) {
        if (['Jerkbait 15cm', 'Gummifisch Shad 10cm', 'Popper', 'Stickbait 12cm'].includes(name)) {
          score += 7;
          reasons.push({ key: 'bait.reason.golden_hour' });
        }
      }
      if (tod === 'night') {
        if (['Wurm', 'Köderfisch (tot)', 'Köderfisch (lebend)'].includes(name)) {
          score += 7;
          reasons.push({ key: 'bait.reason.night_natural' });
        }
      }

      results.push({ name, score, reasons, category: inferCategory(name) });
    });
  }

  results.sort((a, b) => b.score - a.score);
  return {
    species,
    tod,
    weatherTags,
    techniques: profile ? profile.techniques : [],
    baits: results.slice(0, limit),
  };
}

function inferCategory(name) {
  if (!name) return 'artificial';
  const n = String(name).toLowerCase();
  if (n.includes('gummi') || n.includes('jerk') || n.includes('spinner') || n.includes('löffel') || n.includes('wobbler') || n.includes('popper') || n.includes('stick') || n.includes('twister') || n.includes('jig') || n.includes('pilker') || n.includes('crank') || n.includes('creature') || n.includes('streamer') || n.includes('nymphe') || n.includes('trockenfliege') || n.includes('paternoster')) return 'artificial';
  if (n.includes('lebend')) return 'live';
  return 'natural';
}

// Given catches, return "what's working for you" summary
export function topPersonalBaits(catches = [], limit = 3) {
  const tally = {};
  catches.forEach(c => {
    const k = c.bait_model || c.model || c.bait_category;
    if (!k) return;
    tally[k] = (tally[k] || 0) + 1;
  });
  return Object.entries(tally)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Today's hot species based on recent catches
export function todaysHotSpecies(catches = [], days = 14) {
  const cutoff = Date.now() - days * 86400_000;
  const tally = {};
  catches.forEach(c => {
    if (!c.species) return;
    const t = c.caught_date ? new Date(c.caught_date).getTime() : null;
    if (t != null && t < cutoff) return;
    tally[c.species] = (tally[c.species] || 0) + 1;
  });
  return Object.entries(tally)
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count);
}
