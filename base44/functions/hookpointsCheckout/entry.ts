import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { package_id, success_url, cancel_url } = await req.json();

    if (!package_id) {
      return Response.json({ error: 'package_id required' }, { status: 400 });
    }

    // Load the package
    const packages = await base44.asServiceRole.entities.HookPointPackage.filter({ id: package_id });
    if (!packages.length) {
      return Response.json({ error: 'Package not found' }, { status: 404 });
    }
    const pkg = packages[0];

    if (!pkg.active) {
      return Response.json({ error: 'Package is not active' }, { status: 400 });
    }

    const bonusHp = Math.floor((pkg.hook_points * (pkg.bonus_percent || 0)) / 100);
    const totalHp = pkg.hook_points + bonusHp;

    const priceInCents = Math.round(pkg.price_eur * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: priceInCents,
            product_data: {
              name: `${pkg.icon || '🪝'} ${pkg.name} — ${totalHp} HookPoints`,
              description: bonusHp > 0
                ? `${pkg.hook_points} HP + ${bonusHp} Bonus-HP (${pkg.bonus_percent}%)`
                : `${pkg.hook_points} HookPoints`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        purchase_type: 'hookpoints',
        user_email: user.email,
        package_id: pkg.id,
        package_name: pkg.name,
        hook_points: String(totalHp),
      },
      customer_email: user.email,
      success_url: success_url || `${req.headers.get('origin')}/hookpoints-shop?success=1`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/hookpoints-shop?cancelled=1`,
    });

    console.log(`HookPoints checkout created: ${session.id} for ${user.email}, ${totalHp} HP`);
    return Response.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('hookpointsCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});