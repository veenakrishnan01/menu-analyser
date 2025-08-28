import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email-service';
import crypto from 'crypto';

// Store for reset tokens (in production, use a database)
const resetTokens = new Map<string, { email: string; expires: number; userName: string }>();

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

// Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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

    // Update user password
    const updated = updateUserPassword(tokenData.email, newPassword);

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Delete used token
    resetTokens.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// Helper functions
function getUserByEmail(email: string) {
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      return users.find((u: any) => u.email === email);
    }
  } catch (error) {
    console.error('Error reading users:', error);
  }
  
  return null;
}

function updateUserPassword(email: string, newPassword: string): boolean {
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      const userIndex = users.findIndex((u: any) => u.email === email);
      
      if (userIndex !== -1) {
        users[userIndex].password = newPassword; // In production, hash this
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return true;
      }
    }
  } catch (error) {
    console.error('Error updating password:', error);
  }
  
  return false;
}