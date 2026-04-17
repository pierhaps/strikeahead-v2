import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Map price IDs to plan names and billing cycles
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
};

async function advanceLifetimeTier(base44, completedTier) {
  try {
    // Mark current tier as inactive
    const tiers = await base44.asServiceRole.entities.LifetimeDealCounter.filter({ tier: completedTier });
    if (tiers.length > 0) {
      await base44.asServiceRole.entities.LifetimeDealCounter.update(tiers[0].id, { active: false });
    }
    // Activate next tier if it exists
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
        const metaCycle = session.metadata?.cycle;
        const metaTier = session.metadata?.lifetime_tier ? parseInt(session.metadata.lifetime_tier) : null;

        console.log(`Checkout completed: ${userEmail}, plan=${metaPlan}, cycle=${metaCycle}, tier=${metaTier}`);

        // Resolve plan from price if metadata is missing
        let plan = metaPlan;
        let cycle = metaCycle;
        let lifetimeTier = metaTier;

        if (!plan && session.line_items) {
          const priceId = session.line_items?.data?.[0]?.price?.id;
          if (priceId && PRICE_MAP[priceId]) {
            plan = PRICE_MAP[priceId].plan;
            cycle = PRICE_MAP[priceId].cycle;
            lifetimeTier = PRICE_MAP[priceId].tier || null;
          }
        }

        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length === 0) { console.error(`User not found: ${userEmail}`); break; }

        const updateData = {
          premium_plan: plan || 'legend',
          billing_cycle: cycle || 'monthly',
          stripe_customer_id: session.customer,
          subscription_status: 'active',
        };
        if (session.subscription) updateData.stripe_subscription_id = session.subscription;
        if (lifetimeTier) updateData.lifetime_tier = lifetimeTier;

        await base44.asServiceRole.entities.User.update(users[0].id, updateData);
        console.log(`Updated user ${userEmail}: plan=${plan}, cycle=${cycle}`);

        // Handle lifetime tier counter
        if (cycle === 'lifetime' && lifetimeTier) {
          const tiers = await base44.asServiceRole.entities.LifetimeDealCounter.filter({ tier: lifetimeTier });
          if (tiers.length > 0) {
            const newSold = (tiers[0].sold || 0) + 1;
            await base44.asServiceRole.entities.LifetimeDealCounter.update(tiers[0].id, { sold: newSold });
            console.log(`Tier ${lifetimeTier} sold: ${newSold}/${tiers[0].max_slots}`);
            if (newSold >= tiers[0].max_slots) {
              await advanceLifetimeTier(base44, lifetimeTier);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`Subscription cancelled: ${sub.customer}`);
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: sub.customer });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            premium_plan: 'free',
            billing_cycle: null,
            stripe_subscription_id: null,
            subscription_status: 'cancelled',
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log(`Invoice paid: ${invoice.customer}`);
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: invoice.customer });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, { subscription_status: 'active' });
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