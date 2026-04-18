import { createClient } from 'npm:@base44/sdk@0.8.25';

const PAYPAL_BASE = 'https://api-m.paypal.com';

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

async function getSubscriptionDetails(token, subscriptionId) {
  const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log(`PayPal webhook: ${eventType}`, resource?.id);

    const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });
    const token = await getAccessToken();

    if (
      eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
      eventType === 'BILLING.SUBSCRIPTION.UPDATED'
    ) {
      const subscriptionId = resource.id;
      const sub = await getSubscriptionDetails(token, subscriptionId);
      const userEmail = sub.custom_id || resource.custom_id;

      if (!userEmail) {
        console.error('No user email in subscription custom_id');
        return Response.json({ received: true });
      }

      const planMonthly = Deno.env.get('PAYPAL_PLAN_MONTHLY');
      const cycle = sub.plan_id === planMonthly ? 'monthly' : 'annual';

      const now = new Date();
      const expires = cycle === 'monthly'
        ? new Date(now.setMonth(now.getMonth() + 1))
        : new Date(now.setFullYear(now.getFullYear() + 1));

      const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          is_premium: true,
          premium_plan: 'pro',
          billing_cycle: cycle,
          premium_expires: expires.toISOString(),
          paypal_subscription_id: subscriptionId,
        });
        console.log(`User ${userEmail} activated as premium (${cycle})`);
      }
    }

    if (
      eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
      eventType === 'BILLING.SUBSCRIPTION.EXPIRED'
    ) {
      const subscriptionId = resource.id;
      const sub = await getSubscriptionDetails(token, subscriptionId);
      const userEmail = sub.custom_id || resource.custom_id;

      if (userEmail) {
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            is_premium: false,
            premium_plan: 'free',
          });
          console.log(`User ${userEmail} subscription ${eventType}`);
        }
      }
    }

    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      console.log(`Payment received: ${resource.amount?.total} ${resource.amount?.currency}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('paypalWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});