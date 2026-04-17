import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PACKAGES = [
  { name: 'Starter',      hook_points: 100,  price_eur: 2.99,  bonus_percent: 0,  popular: false, icon: '🪝', active: true, sort_order: 1 },
  { name: 'Angler Pack',  hook_points: 300,  price_eur: 6.99,  bonus_percent: 10, popular: false, icon: '🎣', active: true, sort_order: 2 },
  { name: 'Pro Bundle',   hook_points: 750,  price_eur: 12.99, bonus_percent: 20, popular: true,  icon: '⚡', active: true, sort_order: 3 },
  { name: 'Legend Chest', hook_points: 2000, price_eur: 19.99, bonus_percent: 35, popular: false, icon: '👑', active: true, sort_order: 4 },
];

const REWARDS = [
  { name: '24h Pro-Zugang',          cost_hp: 50,  reward_type: 'temp_premium',       grants_plan: 'pro', duration_hours: 24,  icon: '⏱️', active: true, sort_order: 1 },
  { name: '7 Tage Pro-Zugang',       cost_hp: 200, reward_type: 'temp_premium',       grants_plan: 'pro', duration_hours: 168, icon: '📅', active: true, sort_order: 2 },
  { name: '30 Tage Pro-Zugang',      cost_hp: 500, reward_type: 'temp_premium',       grants_plan: 'pro', duration_hours: 720, icon: '🏆', active: true, sort_order: 3 },
  { name: 'KI-Fischbestimmung (1x)', cost_hp: 25,  reward_type: 'single_use_feature', grants_plan: null,  duration_hours: null, icon: '🤖', active: true, sort_order: 4 },
  { name: 'Exklusives Badge',        cost_hp: 150, reward_type: 'cosmetic',           grants_plan: null,  duration_hours: null, icon: '🎖️', active: true, sort_order: 5 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Clear existing
    const existingPkgs = await base44.asServiceRole.entities.HookPointPackage.list();
    for (const p of existingPkgs) {
      await base44.asServiceRole.entities.HookPointPackage.delete(p.id);
    }
    const existingRwds = await base44.asServiceRole.entities.HookPointReward.list();
    for (const r of existingRwds) {
      await base44.asServiceRole.entities.HookPointReward.delete(r.id);
    }

    // Seed
    const createdPkgs = await base44.asServiceRole.entities.HookPointPackage.bulkCreate(PACKAGES);
    const createdRwds = await base44.asServiceRole.entities.HookPointReward.bulkCreate(REWARDS);

    return Response.json({ 
      success: true, 
      packages: createdPkgs.length, 
      rewards: createdRwds.length 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});