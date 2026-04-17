import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Price IDs for each plan
const PRICES = {
  angler: 'price_1TN9NwGoVmyTT5LjDbIYgvnj',
  pro:    'price_1TN9NwGoVmyTT5LjooLh2yzU',
  legend: 'price_1TN9NwGoVmyTT5LjYt5CnsuH',
  lifetime: 'price_1TN9NwGoVmyTT5Ljhu0kHxmL',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl } = await req.json();

    const priceId = PRICES[plan];
    if (!priceId) {
      return Response.json({ error: `Unknown plan: ${plan}` }, { status: 400 });
    }

    const isLifetime = plan === 'lifetime';

    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: successUrl || 'https://app.strikeahead.com/subscription?success=true',
      cancel_url: cancelUrl || 'https://app.strikeahead.com/subscription?cancelled=true',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});