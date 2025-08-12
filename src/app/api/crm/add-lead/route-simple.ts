import { NextRequest, NextResponse } from 'next/server';

interface UserInfo {
  name: string;
  email: string;
  businessName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userInfo: UserInfo = await request.json();
    
    // For testing without GoHighLevel, just log the lead
    console.log('New lead captured:', {
      name: userInfo.name,
      email: userInfo.email,
      businessName: userInfo.businessName,
      timestamp: new Date().toISOString()
    });
    
    // In production, you'd save this to a database or CRM
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true, 
      message: 'Lead captured successfully (test mode)' 
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}