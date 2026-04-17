import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TIERS = [
  { tier: 1, tier_name: 'Founding Angler', price: 79,  max_slots: 100, sold: 0, active: true  },
  { tier: 2, tier_name: 'Early Bird',      price: 119, max_slots: 200, sold: 0, active: false },
  { tier: 3, tier_name: 'Pioneer',         price: 149, max_slots: 300, sold: 0, active: false },
  { tier: 4, tier_name: 'Last Call',       price: 179, max_slots: 400, sold: 0, active: false },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Remove existing
    const existing = await base44.asServiceRole.entities.LifetimeDealCounter.list();
    for (const r of existing) {
      await base44.asServiceRole.entities.LifetimeDealCounter.delete(r.id);
    }

    // Seed fresh
    const created = await base44.asServiceRole.entities.LifetimeDealCounter.bulkCreate(TIERS);
    return Response.json({ success: true, created: created.length });
  } catch (error) {
    console.error('Seed lifetime tiers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});