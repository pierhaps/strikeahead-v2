import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_IDS = {
  monthly: 'price_1TNUCdRfymtZ5rNsoariAJ2o',
  yearly:  'price_1TNUECRfymtZ5rNsxdS4gFbH',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceKey = 'yearly', lang = 'de' } = await req.json();

    const priceId = PRICE_IDS[priceKey];
    if (!priceId) {
      return Response.json({ error: `Invalid priceKey: ${priceKey}` }, { status: 400 });
    }

    // Resolve or create Stripe customer
    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email,
        metadata: { base44_user_email: user.email },
      });
      stripeCustomerId = customer.id;

      // Persist to user record
      await base44.auth.updateMe({ stripe_customer_id: stripeCustomerId });
      console.log(`Created Stripe customer ${stripeCustomerId} for ${user.email}`);
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_email: user.email,
          price_key: priceKey,
        },
      },
      payment_method_types: ['card', 'sepa_debit'],
      success_url: `${origin}/subscription?success=1`,
      cancel_url: `${origin}/subscription?cancelled=1`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        price_key: priceKey,
      },
      locale: lang === 'de' ? 'de' : lang === 'fr' ? 'fr' : lang === 'es' ? 'es' : lang === 'it' ? 'it' : lang === 'nl' ? 'nl' : lang === 'pt' ? 'pt' : lang === 'tr' ? 'tr' : lang === 'el' ? 'el' : lang === 'ru' ? 'ru' : 'en',
    });

    console.log(`Created checkout session ${session.id} for ${user.email}, priceKey=${priceKey}`);
    return Response.json({ url: session.url });

  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});