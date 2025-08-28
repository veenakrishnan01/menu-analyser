import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email-service';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Store for reset tokens (in production, use a database)
// Use global storage to share between endpoints
const resetTokens = global.resetTokens || new Map<string, { email: string; expires: number; userName: string }>();
if (!global.resetTokens) {
  global.resetTokens = resetTokens;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Password reset requested for:', email);

    // Get user from storage
    const user = getUserByEmail(email);
    
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({
        success: false,
        error: 'No account found with this email address. Please check your email or sign up for a new account.'
      }, { status: 404 });
    }

    console.log('User found:', user.name, user.email);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour from now

    // Store token
    resetTokens.set(resetToken, {
      email: user.email,
      userName: user.name,
      expires
    });

    console.log('Sending password reset email...');

    // Send reset email
    const result = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (!result.success) {
      console.error('Failed to send password reset email:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send reset email. Please try again later.',
          details: result.error
        },
        { status: 500 }
      );
    }

    console.log('Password reset email sent successfully, messageId:', result.messageId);

    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been sent to ${user.email}. Please check your email.`
    });

  } catch (error) {
    console.error('Error in password reset request:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Verify reset token endpoint
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      email: tokenData.email
    });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}


// Helper functions
function getUserByEmail(email: string) {
  try {
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      return users.find((u: Record<string, unknown>) => u.email === email);
    }
  } catch (error) {
    console.error('Error reading users:', error);
  }
  
  return null;
}

