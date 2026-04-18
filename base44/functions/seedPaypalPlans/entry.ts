import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const token = await getAccessToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // 1. Create Product
    const productRes = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'StrikeAhead Pro',
        type: 'SERVICE',
        description: 'Premium fishing intelligence subscription',
        category: 'SOFTWARE',
      }),
    });
    const product = await productRes.json();
    console.log('Created product:', product.id);

    // 2. Create Monthly Plan (€9.99/month with 7-day free trial)
    const monthlyRes = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_id: product.id,
        name: 'StrikeAhead Pro Monthly',
        description: 'Monthly premium subscription',
        billing_cycles: [
          {
            frequency: { interval_unit: 'DAY', interval_count: 7 },
            tenure_type: 'TRIAL',
            sequence: 1,
            total_cycles: 1,
            pricing_scheme: { fixed_price: { value: '0', currency_code: 'EUR' } },
          },
          {
            frequency: { interval_unit: 'MONTH', interval_count: 1 },
            tenure_type: 'REGULAR',
            sequence: 2,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: '9.99', currency_code: 'EUR' } },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: '0', currency_code: 'EUR' },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      }),
    });
    const monthlyPlan = await monthlyRes.json();
    console.log('Created monthly plan:', monthlyPlan.id);

    // 3. Create Yearly Plan (€79.99/year with 7-day free trial)
    const yearlyRes = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_id: product.id,
        name: 'StrikeAhead Pro Yearly',
        description: 'Yearly premium subscription - save 33%',
        billing_cycles: [
          {
            frequency: { interval_unit: 'DAY', interval_count: 7 },
            tenure_type: 'TRIAL',
            sequence: 1,
            total_cycles: 1,
            pricing_scheme: { fixed_price: { value: '0', currency_code: 'EUR' } },
          },
          {
            frequency: { interval_unit: 'YEAR', interval_count: 1 },
            tenure_type: 'REGULAR',
            sequence: 2,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: '79.99', currency_code: 'EUR' } },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: '0', currency_code: 'EUR' },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      }),
    });
    const yearlyPlan = await yearlyRes.json();
    console.log('Created yearly plan:', yearlyPlan.id);

    return Response.json({
      product_id: product.id,
      monthly_plan_id: monthlyPlan.id,
      yearly_plan_id: yearlyPlan.id,
      message: 'Save these plan IDs! Add them as PAYPAL_PLAN_MONTHLY and PAYPAL_PLAN_YEARLY secrets.',
    });
  } catch (error) {
    console.error('seedPaypalPlans error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});