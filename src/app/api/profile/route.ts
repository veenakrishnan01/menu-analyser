import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, updateUserProfile } from '@/lib/supabase-auth';

// Interface defined in supabase-auth.ts

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from session
    global.sessions = global.sessions || {};
    const user = global.sessions[sessionToken];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get full user data from storage
    const fullUser = await getUserById(user.id as string);
    
    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...profile } = fullUser;

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from session
    global.sessions = global.sessions || {};
    const user = global.sessions[sessionToken];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { name, businessName, phone } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await updateUserProfile(user.id as string, {
      name: name.trim(),
      businessName: businessName?.trim() || undefined,
      phone: phone?.trim() || undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update session with new user data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password2, ...userWithoutPassword } = updatedUser;
    global.sessions[sessionToken] = userWithoutPassword;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: User functions now handled by Supabase via imported functions