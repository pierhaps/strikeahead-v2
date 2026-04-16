// StrikeAhead Achievement Engine
// Evaluates all active Achievement records against a user's catches + social
// state, compares to existing UserAchievement records, and awards any newly
// met conditions.
//
// All rarities (from Species.rarity + FishEncyclopedia.rarity):
//   common=0, uncommon=1, rare=2, epic=3, legendary=4
//
// Usage (after Catch.create):
//   import { evaluateAchievements } from '@/utils/achievementEngine';
//   const newly = await evaluateAchievements({
//     user, catches, achievements, earned, createdCatch, rarityBySpecies,
//   });
//   // newly = [{achievement, progress, xpAwarded, hpAwarded}, ...]
//
// The caller is responsible for:
//   - fetching Achievement.list (cache-able, ~15 rows)
//   - fetching UserAchievement.filter({user_email}) (to skip already earned)
//   - persisting new UserAchievement records via base44.entities.UserAchievement.create
//   - updating user's fish_xp / hook_points via auth.updateMe
//
// This module is pure — no base44 calls — so it's trivially testable.

const RARITY_LEVEL = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

function uniqueSpeciesCount(catches) {
  const s = new Set();
  catches.forEach((c) => {
    const name = c.species || c.species_name;
    if (name) s.add(name.toLowerCase().trim());
  });
  return s.size;
}

function maxWeight(catches) {
  return catches.reduce((max, c) => Math.max(max, c.weight_kg || 0), 0);
}

function maxLength(catches) {
  return catches.reduce((max, c) => Math.max(max, c.length_cm || 0), 0);
}

function releasedCount(catches) {
  return catches.filter((c) => c.released === true).length;
}

function highestRarity(catches, rarityBySpecies) {
  if (!rarityBySpecies) return 0;
  let max = 0;
  catches.forEach((c) => {
    const name = (c.species || c.species_name || '').toLowerCase().trim();
    const r = rarityBySpecies[name];
    if (r !== undefined && RARITY_LEVEL[r] !== undefined) {
      max = Math.max(max, RARITY_LEVEL[r]);
    }
  });
  return max;
}

function evaluateCondition(ach, ctx) {
  const target = Number(ach.condition_value) || 0;
  const { catches, rarityBySpecies, hasPostedInFeed } = ctx;

  switch (ach.condition_type) {
    case 'catch_count': {
      return { met: catches.length >= target, progress: catches.length };
    }
    case 'unique_species': {
      const n = uniqueSpeciesCount(catches);
      return { met: n >= target, progress: n };
    }
    case 'weight_kg_single': {
      const w = maxWeight(catches);
      return { met: w >= target, progress: w };
    }
    case 'length_cm_single': {
      const l = maxLength(catches);
      return { met: l >= target, progress: l };
    }
    case 'released_count': {
      const n = releasedCount(catches);
      return { met: n >= target, progress: n };
    }
    case 'species_rarity': {
      const max = highestRarity(catches, rarityBySpecies);
      return { met: max >= target, progress: max };
    }
    case 'first_post': {
      return { met: Boolean(hasPostedInFeed), progress: hasPostedInFeed ? 1 : 0 };
    }
    case 'streak_days':
    case 'eco_uploads':
    case 'time_of_day':
    case 'moon_phase':
    default:
      // Not yet evaluated here — left for future waves.
      return { met: false, progress: 0 };
  }
}

/**
 * @param {Object} params
 * @param {Object} params.user — current auth user (for user_email)
 * @param {Array}  params.catches — all catches for this user (incl. the new one)
 * @param {Array}  params.achievements — Achievement.list() (is_active=true)
 * @param {Array}  params.earned — UserAchievement.filter({user_email}) codes
 * @param {Object} [params.createdCatch] — the catch that just triggered evaluation
 * @param {Object} [params.rarityBySpecies] — { "hecht": "epic", ... } lowercase keys
 * @param {boolean}[params.hasPostedInFeed] — whether user has any TcPost
 * @returns {Array<{achievement, progress}>}
 */
export function evaluateAchievements({
  user,
  catches = [],
  achievements = [],
  earned = [],
  createdCatch,
  rarityBySpecies,
  hasPostedInFeed = false,
}) {
  const earnedCodes = new Set(earned.map((e) => e.achievement_code || e.code || e));
  const newly = [];
  const ctx = { catches, rarityBySpecies, hasPostedInFeed };

  for (const ach of achievements) {
    if (!ach.is_active && ach.is_active !== undefined) continue;
    if (earnedCodes.has(ach.code)) continue;
    const { met, progress } = evaluateCondition(ach, ctx);
    if (met) {
      newly.push({
        achievement: ach,
        progress,
        xpAwarded: ach.xp_reward || 0,
        hpAwarded: ach.hp_reward || 0,
        triggered_by_catch_id: createdCatch?.id,
        user_email: user?.email,
      });
    }
  }

  return newly;
}

/**
 * Convenience: build rarityBySpecies from a Species or FishEncyclopedia list.
 * Accepts records with either .name, .name_de, or both.
 */
export function buildRarityMap(speciesList = []) {
  const map = {};
  speciesList.forEach((s) => {
    const r = s.rarity || 'common';
    [s.name, s.name_de, s.name_en].forEach((n) => {
      if (n) map[n.toLowerCase().trim()] = r;
    });
  });
  return map;
}

export { RARITY_LEVEL };
