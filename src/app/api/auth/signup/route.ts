import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { sendEmailVerificationEmail } from '@/lib/email-service';
import { createUser, userExists, generateVerificationToken } from '@/lib/supabase-auth';

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

    // Check if user already exists
    const existingUser = await userExists(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user in Supabase
    let newUser;
    try {
      newUser = await createUser({
        email,
        password: hashedPassword,
        name,
        businessName,
        phone,
      });

      if (!newUser) {
        return NextResponse.json(
          { error: 'Failed to create user account. Please check your Supabase configuration.' },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your Supabase configuration.',
          details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        },
        { status: 500 }
      );
    }

    // Generate verification token
    const verificationToken = await generateVerificationToken(email);
    
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Failed to generate verification token. Please try again.' },
        { status: 500 }
      );
    }

    // Send verification email (don't wait for it to complete)
    sendEmailVerificationEmail(email, name, verificationToken).catch(error => {
      console.error('Failed to send verification email:', error);
      // Don't throw error - user account is already created
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account before logging in.',
      redirectTo: '/verify-email',
      email: email
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

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function storeSession(token: string, user: Omit<StoredUser, 'password'>) {
  global.sessions = global.sessions || {};
  global.sessions[token] = user;
}