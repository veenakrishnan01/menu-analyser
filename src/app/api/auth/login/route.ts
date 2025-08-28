import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
    
    // Get stored users (in production, this would be a database query)
    const storedUsers = getStoredUsers();
    
    // Find user with matching email and password
    const user = storedUsers.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create user session (remove password from response)
    const { password: _, ...userWithoutPassword } = user;
    
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

// Helper functions (in production, these would be in separate modules)
function getStoredUsers(): StoredUser[] {
  // In a real app, this would be a database query
  // For now, we'll simulate with a global variable or file system
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  }
  
  // Server-side storage simulation (in production, use database)
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    }
  } catch (error) {
    console.log('No users file found, returning empty array');
  }
  
  return [];
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function storeSession(token: string, user: any) {
  // In production, store in Redis or database
  // For now, use in-memory storage (will reset on server restart)
  global.sessions = global.sessions || {};
  global.sessions[token] = user;
}