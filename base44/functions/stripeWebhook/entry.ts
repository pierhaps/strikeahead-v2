import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Legacy multi-plan price map (kept for backwards compat)
const PRICE_MAP = {
  'price_1TN9RXGoVmyTT5LjvgDEhhHI': { plan: 'angler',  cycle: 'monthly' },
  'price_1TN9RXGoVmyTT5Lj1YHtz6Ql': { plan: 'angler',  cycle: 'annual'  },
  'price_1TN9RXGoVmyTT5LjGSQelTei': { plan: 'pro',     cycle: 'monthly' },
  'price_1TN9RXGoVmyTT5LjwaSzO1nf': { plan: 'pro',     cycle: 'annual'  },
  'price_1TN9RXGoVmyTT5LjBvUVQ92s': { plan: 'legend',  cycle: 'monthly' },
  'price_1TN9RXGoVmyTT5LjjgtieE3I': { plan: 'legend',  cycle: 'annual'  },
  'price_1TN9RXGoVmyTT5LjPL7V4IpL': { plan: 'legend',  cycle: 'lifetime', tier: 1 },
  'price_1TN9RXGoVmyTT5LjBaSEiv3H': { plan: 'legend',  cycle: 'lifetime', tier: 2 },
  'price_1TN9RXGoVmyTT5Lj2rDAWpxg': { plan: 'legend',  cycle: 'lifetime', tier: 3 },
  'price_1TN9RXGoVmyTT5LjZbPBYkVg': { plan: 'legend',  cycle: 'lifetime', tier: 4 },
  // New unified prices
  'price_1TNUCdRfymtZ5rNsoariAJ2o': { plan: 'pro', cycle: 'monthly' },
  'price_1TNUECRfymtZ5rNsxdS4gFbH': { plan: 'pro', cycle: 'annual'  },
};

async function advanceLifetimeTier(base44, completedTier) {
  try {
    const tiers = await base44.asServiceRole.entities.LifetimeDealCounter.filter({ tier: completedTier });
    if (tiers.length > 0) {
      await base44.asServiceRole.entities.LifetimeDealCounter.update(tiers[0].id, { active: false });
    }
    if (completedTier < 4) {
      const nextTiers = await base44.asServiceRole.entities.LifetimeDealCounter.filter({ tier: completedTier + 1 });
      if (nextTiers.length > 0) {
        await base44.asServiceRole.entities.LifetimeDealCounter.update(nextTiers[0].id, { active: true });
        console.log(`Activated lifetime tier ${completedTier + 1}`);
      }
    } else {
      console.log('All lifetime tiers sold out');
    }
  } catch (err) {
    console.error('Error advancing lifetime tier:', err);
  }
}

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata?.user_email || session.customer_email;

        if (!userEmail) { console.error('No user email in session'); break; }

        // ── HookPoints purchase ──────────────────────────────────────────────
        if (session.metadata?.purchase_type === 'hookpoints') {
          const hpToAdd = parseInt(session.metadata?.hook_points || '0');
          const packageName = session.metadata?.package_name || 'HookPoints';
          if (hpToAdd > 0) {
            const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
            if (users.length > 0) {
              const currentHp = users[0].hook_points || 0;
              const newBalance = currentHp + hpToAdd;
              await base44.asServiceRole.entities.User.update(users[0].id, { hook_points: newBalance });
              await base44.asServiceRole.entities.HookPointTransaction.create({
                user_email: userEmail,
                type: 'purchase',
                amount: hpToAdd,
                balance_after: newBalance,
                description: `${packageName} gekauft`,
                stripe_session_id: session.id,
              });
              console.log(`Added ${hpToAdd} HP to ${userEmail}, new balance: ${newBalance}`);
            } else {
              console.error(`HP purchase: user not found: ${userEmail}`);
            }
          }
          break;
        }

        // ── Subscription purchase ────────────────────────────────────────────
        const metaPlan = session.metadata?.plan;
        const metaCycle = session.metadata?.cycle || session.metadata?.price_key;
        const metaTier = session.metadata?.lifetime_tier ? parseInt(session.metadata.lifetime_tier) : null;

        let plan = metaPlan;
        let cycle = metaCycle;
        let lifetimeTier = metaTier;

        if (!plan) {
          // Try to resolve from line items
          try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const priceId = lineItems?.data?.[0]?.price?.id;
            if (priceId && PRICE_MAP[priceId]) {
              plan = PRICE_MAP[priceId].plan;
              cycle = PRICE_MAP[priceId].cycle;
              lifetimeTier = PRICE_MAP[priceId].tier || null;
            }
          } catch (e) {
            console.warn('Could not fetch line items:', e.message);
          }
        }

        // For new unified checkout, default to 'pro'
        if (!plan) plan = 'pro';

        console.log(`Checkout completed: ${userEmail}, plan=${plan}, cycle=${cycle}`);

        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length === 0) { console.error(`User not found: ${userEmail}`); break; }

        // Determine premium_expires from subscription
        let premiumExpires = null;
        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            if (sub.current_period_end) {
              premiumExpires = new Date(sub.current_period_end * 1000).toISOString();
            }
          } catch (e) {
            console.warn('Could not fetch subscription:', e.message);
          }
        }

        const updateData = {
          premium_plan: plan,
          billing_cycle: cycle || 'monthly',
          stripe_customer_id: session.customer,
          is_premium: true,
          subscription_status: 'active',
        };
        if (session.subscription) updateData.stripe_subscription_id = session.subscription;
        if (premiumExpires) updateData.premium_expires = premiumExpires;
        if (lifetimeTier) updateData.lifetime_tier = lifetimeTier;

        await base44.asServiceRole.entities.User.update(users[0].id, updateData);
        console.log(`Updated user ${userEmail}: plan=${plan}, is_premium=true`);

        // Handle lifetime tier counter
        if (cycle === 'lifetime' && lifetimeTier) {
          const tiers = await base44.asServiceRole.entities.LifetimeDealCounter.filter({ tier: lifetimeTier });
          if (tiers.length > 0) {
            const newSold = (tiers[0].sold || 0) + 1;
            await base44.asServiceRole.entities.LifetimeDealCounter.update(tiers[0].id, { sold: newSold });
            if (newSold >= tiers[0].max_slots) await advanceLifetimeTier(base44, lifetimeTier);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log(`Subscription updated: ${sub.customer}, status=${sub.status}`);

        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: sub.customer });
        if (users.length === 0) { console.warn(`No user for customer ${sub.customer}`); break; }

        const isLifetime = users[0].billing_cycle === 'lifetime';
        if (isLifetime) { console.log('Skipping update for lifetime user'); break; }

        const premiumExpires = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        const updateData = {
          subscription_status: sub.status,
          is_premium: sub.status === 'active' || sub.status === 'trialing',
        };
        if (premiumExpires) updateData.premium_expires = premiumExpires;

        await base44.asServiceRole.entities.User.update(users[0].id, updateData);
        console.log(`Synced subscription for ${users[0].email}: status=${sub.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`Subscription cancelled: ${sub.customer}`);

        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: sub.customer });
        if (users.length > 0) {
          const isLifetime = users[0].billing_cycle === 'lifetime';
          if (!isLifetime) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              premium_plan: 'free',
              billing_cycle: null,
              stripe_subscription_id: null,
              subscription_status: 'cancelled',
              is_premium: false,
            });
            console.log(`Revoked premium for ${users[0].email}`);
          } else {
            console.log(`Skipping revoke for lifetime user ${users[0].email}`);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log(`Invoice paid: ${invoice.customer}`);
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
        if (users.length > 0) {
          const updateData = { subscription_status: 'active', is_premium: true };
          // Sync period end
          if (invoice.lines?.data?.[0]?.period?.end) {
            updateData.premium_expires = new Date(invoice.lines.data[0].period.end * 1000).toISOString();
          }
          await base44.asServiceRole.entities.User.update(users[0].id, updateData);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.warn(`Payment failed: ${invoice.customer}`);
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, { subscription_status: 'past_due' });
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});