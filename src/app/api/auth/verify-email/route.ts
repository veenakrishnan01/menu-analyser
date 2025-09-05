import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/supabase-auth';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    console.log('Email verification attempt with token:', token ? 'Present' : 'Missing');

    const isVerified = await verifyEmailToken(token);

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification email.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token from URL
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    console.log('Email verification attempt with token:', token ? 'Present' : 'Missing');

    const isVerified = await verifyEmailToken(token);

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification email.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification. Please try again.' },
      { status: 500 }
    );
  }
}