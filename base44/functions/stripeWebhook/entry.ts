import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// Map Stripe price IDs to app plan names
const PRICE_TO_PLAN = {
  'price_1TN9NwGoVmyTT5LjDbIYgvnj': 'angler',
  'price_1TN9NwGoVmyTT5LjooLh2yzU': 'pro',
  'price_1TN9NwGoVmyTT5LjYt5CnsuH': 'legend',
  'price_1TN9NwGoVmyTT5Ljhu0kHxmL': 'lifetime',
};

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
        const plan = session.metadata?.plan;
        if (!userEmail || !plan) break;

        console.log(`Checkout completed for ${userEmail}, plan: ${plan}`);

        // Update user role/plan in the database
        const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            role: plan === 'lifetime' ? 'pro' : plan,
            subscription_plan: plan,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customerId = sub.customer;
        console.log(`Subscription cancelled for customer: ${customerId}`);

        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            role: 'user',
            subscription_plan: 'free',
            subscription_status: 'cancelled',
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        console.log(`Invoice paid for customer: ${customerId}`);

        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: 'active',
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        console.warn(`Payment failed for customer: ${customerId}`);

        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: 'past_due',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});