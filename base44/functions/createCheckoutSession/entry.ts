const PAYPAL_BASE = 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

const LOCALE_MAP = {
  de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR',
  it: 'it-IT', nl: 'nl-NL', tr: 'tr-TR', hr: 'hr-HR',
  pt: 'pt-PT', el: 'el-GR', ru: 'ru-RU',
};

Deno.serve(async (req) => {
  try {
    const { priceKey = 'yearly', lang = 'de', email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const planId = priceKey === 'monthly'
      ? Deno.env.get('PAYPAL_PLAN_MONTHLY')
      : Deno.env.get('PAYPAL_PLAN_YEARLY');

    if (!planId) {
      return Response.json({ error: `No plan configured for: ${priceKey}. Run seedPaypalPlans first.` }, { status: 400 });
    }

    const token = await getAccessToken();
    const origin = req.headers.get('origin') || 'https://app.base44.com';

    const subRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: email,
        application_context: {
          brand_name: 'StrikeAhead',
          locale: LOCALE_MAP[lang] || 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${origin}/subscription?success=1`,
          cancel_url: `${origin}/subscription?cancelled=1`,
        },
      }),
    });

    const subscription = await subRes.json();

    if (subscription.error) {
      console.error('PayPal error:', JSON.stringify(subscription));
      return Response.json({ error: subscription.error.message || 'PayPal error' }, { status: 500 });
    }

    const approveLink = subscription.links?.find((l) => l.rel === 'approve');
    if (!approveLink) {
      console.error('No approval URL in PayPal response:', JSON.stringify(subscription));
      return Response.json({ error: 'No approval URL returned from PayPal' }, { status: 500 });
    }

    console.log(`Created PayPal subscription ${subscription.id} for ${email}, plan=${priceKey}`);
    return Response.json({ url: approveLink.href });

  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});