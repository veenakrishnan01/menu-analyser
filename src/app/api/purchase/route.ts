import { NextRequest, NextResponse } from 'next/server';

interface UserInfo {
  name: string;
  email: string;
  businessName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { services, userInfo, total }: { 
      services: string[]; 
      userInfo: UserInfo; 
      total: number; 
    } = await request.json();

    // In production, you would integrate with Stripe or another payment processor
    // For now, we'll create a mock checkout URL
    
    const serviceNames = {
      'cloud-kitchen': 'Cloud Kitchen Gap Analysis',
      'competitor': 'Competitor Analysis', 
      'profitable-items': '100 Profitable Menu Items'
    };

    // Create line items for Stripe (mock implementation)
    const lineItems = services.map(serviceId => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: serviceNames[serviceId as keyof typeof serviceNames] || serviceId,
          description: `Advanced restaurant analysis service`
        },
        unit_amount: getServicePrice(serviceId) * 100, // Stripe uses cents
      },
      quantity: 1,
    }));

    // Mock Stripe session creation
    const mockCheckoutSession = {
      id: 'cs_' + Math.random().toString(36).substr(2, 9),
      url: `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substr(2, 9)}#fidkdWxOYHwnPyd1blpxYHZxWjA0TXRINEddcnFOSzVANXVfNFMxUU10SVU8PEFkcVNHdWZVNVdQUGdNSWJIVktJbVV9UzNLVnJTYU1RTnJAbE50SUJkb0xxS19WTDBGZFN1VGlTNUJHamdLcXJ8VTAwMzRPUVwid`
    };

    // In production, you would:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: lineItems,
    //   mode: 'payment',
    //   success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${request.nextUrl.origin}/`,
    //   customer_email: userInfo.email,
    //   metadata: {
    //     services: services.join(','),
    //     customer_name: userInfo.name,
    //     business_name: userInfo.businessName || ''
    //   }
    // });

    // Log purchase attempt for analytics
    console.log('Purchase attempt:', {
      services,
      userInfo: { ...userInfo, email: userInfo.email.replace(/(.{2}).*(@.*)/, '$1***$2') },
      total,
      timestamp: new Date().toISOString()
    });

    // Add to CRM with purchase intent tag
    try {
      await fetch(`${request.nextUrl.origin}/api/crm/add-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userInfo,
          tags: ['purchase-intent', ...services]
        })
      });
    } catch (crmError) {
      console.warn('Failed to update CRM:', crmError);
    }

    // For testing without Stripe, just show an alert
    const testCheckoutUrl = `${request.nextUrl.origin}/?payment=test&services=${services.join(',')}&total=${total}`;
    
    return NextResponse.json({
      checkoutUrl: testCheckoutUrl,
      sessionId: mockCheckoutSession.id,
      testMode: true
    });

  } catch (error) {
    console.error('Purchase processing error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

function getServicePrice(serviceId: string): number {
  const prices: Record<string, number> = {
    'cloud-kitchen': 49,
    'competitor': 49,
    'profitable-items': 39
  };
  return prices[serviceId] || 0;
}