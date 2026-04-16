// StrikeAhead Trust Engine
// Computes a 0-100 trust score for a catch record based on available evidence.
//
// Scoring model (max 100):
//   Photo evidence        30  (30 for any photo, +5 bonus if 2+ photos, capped at 30)
//   GPS coordinates       20  (has lat/lng within valid range)
//   Timestamp             10  (caught_date AND caught_time present)
//   Weather snapshot      10  (at least 2 of: air_temp, wind_speed, water_temp, pressure)
//   Species identified    10  (species field non-empty)
//   Measurements          10  (weight_kg OR length_cm; both = 10, one = 7)
//   Bait/technique info   10  (technique AND bait_category; either alone = 5)
//
// Returns: { score: number, level: 'unverified'|'photo_verified'|'gps_verified'|'fully_verified', breakdown: {...} }

export const TRUST_LEVELS = {
  UNVERIFIED: 'unverified',
  PHOTO: 'photo_verified',
  GPS: 'gps_verified',
  FULL: 'fully_verified',
};

export function computeTrustScore(c = {}) {
  const breakdown = {
    photo: 0,
    gps: 0,
    timestamp: 0,
    weather: 0,
    species: 0,
    measurements: 0,
    bait: 0,
  };

  // Photos
  const photos = Array.isArray(c.photo_urls) ? c.photo_urls.filter(Boolean) : [];
  if (photos.length >= 1) breakdown.photo = 30;
  // bonus cap — multiple photos still cap at 30 for this revision

  // GPS — accept both naming conventions (latitude/longitude and gps_lat/gps_lon)
  const lat = Number(c.latitude != null ? c.latitude : c.gps_lat);
  const lng = Number(c.longitude != null ? c.longitude : c.gps_lon);
  const validGps = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0 && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (validGps) breakdown.gps = 20;

  // Timestamp
  if (c.caught_date && c.caught_time) breakdown.timestamp = 10;
  else if (c.caught_date) breakdown.timestamp = 5;

  // Weather — accept both pressure_hpa and barometric_pressure_hpa
  const pressure = c.pressure_hpa != null ? c.pressure_hpa : c.barometric_pressure_hpa;
  const weatherHits = [c.air_temp_c, c.water_temp_c, c.wind_speed_kmh, pressure].filter(v => v != null && v !== '').length;
  if (weatherHits >= 2) breakdown.weather = 10;
  else if (weatherHits === 1) breakdown.weather = 5;

  // Species
  if (c.species && String(c.species).trim().length > 0) breakdown.species = 10;

  // Measurements
  const hasWeight = c.weight_kg != null && Number(c.weight_kg) > 0;
  const hasLength = c.length_cm != null && Number(c.length_cm) > 0;
  if (hasWeight && hasLength) breakdown.measurements = 10;
  else if (hasWeight || hasLength) breakdown.measurements = 7;

  // Bait / technique
  const hasTechnique = c.technique && String(c.technique).trim().length > 0;
  const hasBait = c.bait_category && String(c.bait_category).trim().length > 0;
  if (hasTechnique && hasBait) breakdown.bait = 10;
  else if (hasTechnique || hasBait) breakdown.bait = 5;

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let level = TRUST_LEVELS.UNVERIFIED;
  if (score >= 80) level = TRUST_LEVELS.FULL;
  else if (breakdown.gps > 0 && breakdown.photo > 0) level = TRUST_LEVELS.GPS;
  else if (breakdown.photo > 0) level = TRUST_LEVELS.PHOTO;

  return { score, level, breakdown };
}

// Returns tailwind class + i18n key per level
export const trustMeta = {
  unverified:      { color: 'text-foam/40',  border: 'border-foam/20',  key: 'trust.unverified'      },
  photo_verified:  { color: 'text-tide-400', border: 'border-tide-400/40', key: 'trust.photo_verified'  },
  gps_verified:    { color: 'text-tide-300', border: 'border-tide-300/40', key: 'trust.gps_verified'    },
  fully_verified:  { color: 'text-sun-400',  border: 'border-sun-400/50',  key: 'trust.fully_verified'  },
};

// Aggregate trust stats across all catches
export function aggregateTrust(catches = []) {
  if (!catches.length) return { avgScore: 0, fullCount: 0, photoCount: 0, gpsCount: 0, pct: { full: 0, gps: 0, photo: 0, unverified: 0 } };
  let sum = 0;
  const tally = { unverified: 0, photo_verified: 0, gps_verified: 0, fully_verified: 0 };
  for (const c of catches) {
    const { score, level } = computeTrustScore(c);
    sum += score;
    tally[level] = (tally[level] || 0) + 1;
  }
  const total = catches.length;
  return {
    avgScore: Math.round(sum / total),
    fullCount: tally.fully_verified,
    gpsCount: tally.gps_verified,
    photoCount: tally.photo_verified,
    pct: {
      full: Math.round(100 * tally.fully_verified / total),
      gps: Math.round(100 * tally.gps_verified / total),
      photo: Math.round(100 * tally.photo_verified / total),
      unverified: Math.round(100 * tally.unverified / total),
    },
  };
}
