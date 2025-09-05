import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { getUserByEmail } from '@/lib/supabase-auth';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // In a real application, you would query a database here
    // For now, we'll simulate database operations with localStorage-like behavior
    
    // Get user from Supabase
    const user = await getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user session (remove password from response)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    
    // In production, you would:
    // 1. Create a JWT token
    // 2. Store session in database
    // 3. Set secure httpOnly cookies
    
    // For now, we'll use a simple approach
    const sessionToken = generateSessionToken();
    
    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Store session mapping (in production, use Redis or database)
    storeSession(sessionToken, userWithoutPassword);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Note: User storage now handled by Supabase

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function storeSession(token: string, user: Omit<StoredUser, 'password'>) {
  // In production, store in Redis or database
  // For now, use in-memory storage (will reset on server restart)
  global.sessions = global.sessions || {};
  global.sessions[token] = user;
}