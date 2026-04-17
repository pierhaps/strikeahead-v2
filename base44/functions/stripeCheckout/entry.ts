import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Price IDs — monthly, annual, lifetime tiers
const PRICES = {
  angler_monthly:  'price_1TN9RXGoVmyTT5LjvgDEhhHI',
  angler_annual:   'price_1TN9RXGoVmyTT5Lj1YHtz6Ql',
  pro_monthly:     'price_1TN9RXGoVmyTT5LjGSQelTei',
  pro_annual:      'price_1TN9RXGoVmyTT5LjwaSzO1nf',
  legend_monthly:  'price_1TN9RXGoVmyTT5LjBvUVQ92s',
  legend_annual:   'price_1TN9RXGoVmyTT5LjjgtieE3I',
  lifetime_1:      'price_1TN9RXGoVmyTT5LjPL7V4IpL',
  lifetime_2:      'price_1TN9RXGoVmyTT5LjBaSEiv3H',
  lifetime_3:      'price_1TN9RXGoVmyTT5Lj2rDAWpxg',
  lifetime_4:      'price_1TN9RXGoVmyTT5LjZbPBYkVg',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, cycle, lifetimeTier, successUrl, cancelUrl } = await req.json();

    let priceId;
    let isLifetime = false;

    if (plan === 'lifetime' && lifetimeTier >= 1 && lifetimeTier <= 4) {
      priceId = PRICES[`lifetime_${lifetimeTier}`];
      isLifetime = true;
    } else if (plan && cycle) {
      priceId = PRICES[`${plan}_${cycle}`];
    }

    if (!priceId) {
      console.error(`Unknown plan/cycle: ${plan}/${cycle}, lifetimeTier: ${lifetimeTier}`);
      return Response.json({ error: `Unknown plan configuration` }, { status: 400 });
    }

    const origin = successUrl ? new URL(successUrl).origin : 'https://app.strikeahead.com';

    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: successUrl || `${origin}/subscription?success=true`,
      cancel_url: cancelUrl || `${origin}/subscription?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan: plan,
        cycle: isLifetime ? 'lifetime' : cycle,
        lifetime_tier: lifetimeTier ? String(lifetimeTier) : '',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});