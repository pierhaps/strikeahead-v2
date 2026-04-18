import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const cookieHeader = req.headers.get('cookie') || '';

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (authHeader && !authHeader.startsWith('Bearer')) {
      token = authHeader;
    }
    if (!token && cookieHeader) {
      const match = cookieHeader.match(/(?:base44_access_token|token)=([^;]+)/);
      if (match) token = match[1];
    }

    let userEmail = null;

    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          userEmail = payload.email || payload.user_email || payload.sub || null;
        }
      } catch (e) {
        console.log('JWT decode failed:', e.message);
      }
    }

    if (!userEmail) {
      try {
        const body = await req.json();
        userEmail = body.email || null;
      } catch (e) {}
    }

    if (!userEmail) {
      console.log('getUserProfile: could not identify user');
      return Response.json({ user: null });
    }

    console.log('getUserProfile: looking up user', userEmail);

    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    const user = users[0] || null;

    if (!user) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        plan: user.plan,
        subscription_plan: user.subscription_plan,
        premium_expires_at: user.premium_expires_at,
        premium_expires: user.premium_expires,
        role: user.role,
        hook_points: user.hook_points,
        is_lifetime: user.is_lifetime,
        profile_image: user.profile_image,
        _app_role: user._app_role,
      }
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    return Response.json({ user: null, error: error.message });
  }
});