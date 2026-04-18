import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin only
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) {
      return Response.json({ error: 'email is required' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      return Response.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    const updated = await base44.asServiceRole.entities.User.update(users[0].id, {
      is_premium: false,
      premium_plan: '',
      premium_expires: null,
      paypal_subscription_id: '',
      billing_cycle: '',
    });

    console.log(`Reset premium for ${email}`);
    return Response.json({ success: true, user: updated });

  } catch (error) {
    console.error('resetUserPremium error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});