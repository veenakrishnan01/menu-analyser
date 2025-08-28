import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email-service';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, businessName, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get existing users
    const storedUsers = getStoredUsers();
    
    // Check if user already exists
    if (storedUsers.some(u => u.email === email)) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this with bcrypt
      name,
      businessName,
      phone,
    };

    // Save user (in production, save to database)
    storedUsers.push(newUser);
    saveUsers(storedUsers);

    // Create session
    const { password: _, ...userWithoutPassword } = newUser;
    const sessionToken = generateSessionToken();
    
    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Store session
    storeSession(sessionToken, userWithoutPassword);

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(email, name, businessName).catch(error => {
      console.error('Failed to send welcome email:', error);
      // Don't throw error - user account is already created
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getStoredUsers(): StoredUser[] {
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    }
  } catch (error) {
    console.log('No users file found, creating new one');
  }
  
  return [];
}

function saveUsers(users: StoredUser[]) {
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function storeSession(token: string, user: any) {
  global.sessions = global.sessions || {};
  global.sessions[token] = user;
}