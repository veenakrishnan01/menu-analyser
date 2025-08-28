import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This should match the resetTokens from send-reset-email
// In production, this would be stored in a database
const resetTokens = global.resetTokens || new Map<string, { email: string; expires: number; userName: string }>();
if (!global.resetTokens) {
  global.resetTokens = resetTokens;
}

// Reset password with token
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    console.log('Password reset attempt with token:', token ? 'Present' : 'Missing');
    console.log('New password provided:', newPassword ? 'Yes' : 'No');

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
    console.log('Token data found:', tokenData ? 'Yes' : 'No');

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token);
      console.log('Token expired for email:', tokenData.email);
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    console.log('Updating password for user:', tokenData.email);

    // Update user password
    const updated = updateUserPassword(tokenData.email, newPassword);

    if (!updated) {
      console.error('Failed to update password for user:', tokenData.email);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    // Delete used token
    resetTokens.delete(token);
    console.log('Password reset successful for:', tokenData.email);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password. Please try again.' },
      { status: 500 }
    );
  }
}

// Verify reset token
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
      email: tokenData.email,
      userName: tokenData.userName
    });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

// Helper function
function updateUserPassword(email: string, newPassword: string): boolean {
  try {
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      console.error('Users file not found');
      return false;
    }

    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const userIndex = users.findIndex((u: Record<string, unknown>) => u.email === email);
    
    if (userIndex === -1) {
      console.error('User not found:', email);
      return false;
    }

    // In production, you should hash the password
    users[userIndex].password = newPassword;
    
    // Update any reset-related fields
    users[userIndex].resetToken = null;
    users[userIndex].resetTokenExpiry = null;
    
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('Password updated successfully for:', email);
    return true;
    
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}