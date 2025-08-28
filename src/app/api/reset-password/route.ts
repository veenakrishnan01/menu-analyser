import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { updateUserPassword as updateUserPasswordSupabase } from '@/lib/supabase-auth';

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
    const updated = await updateUserPassword(tokenData.email, newPassword);

    if (!updated) {
      console.error('Failed to update password for user:', tokenData.email);
      // Check if we're in production (Vercel)
      const isProduction = process.env.VERCEL || process.env.VERCEL_ENV;
      const errorMessage = isProduction 
        ? 'Password reset is currently not supported in production. Please contact support.'
        : 'Failed to update password. Please try again.';
      
      return NextResponse.json(
        { error: errorMessage },
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

// Helper function - try Supabase first, fallback to file-based storage
async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  // Try Supabase first
  const supabaseSuccess = await updateUserPasswordSupabase(email, newPassword);
  if (supabaseSuccess) {
    return true;
  }

  console.log('Supabase update failed, trying file-based storage for development');
  // Fallback to file-based storage (for development)
  return updateUserPasswordFile(email, newPassword);
}

function updateUserPasswordFile(email: string, newPassword: string): boolean {
  try {
    const usersFile = path.join(process.cwd(), 'users.json');
    console.log('Looking for users file at:', usersFile);
    
    if (!fs.existsSync(usersFile)) {
      console.error('Users file not found at:', usersFile);
      console.log('Current working directory:', process.cwd());
      console.log('Directory contents:', fs.readdirSync(process.cwd()));
      return false;
    }

    console.log('Reading users file...');
    const fileContent = fs.readFileSync(usersFile, 'utf8');
    console.log('File content length:', fileContent.length);
    
    const users = JSON.parse(fileContent);
    console.log('Number of users found:', users.length);
    console.log('Looking for user with email:', email);
    
    const userIndex = users.findIndex((u: Record<string, unknown>) => u.email === email);
    console.log('User index found:', userIndex);
    
    if (userIndex === -1) {
      console.error('User not found with email:', email);
      console.log('Available users:', users.map((u: Record<string, unknown>) => u.email));
      return false;
    }

    console.log('Updating password for user:', (users[userIndex] as Record<string, unknown>).name);
    
    // In production, you should hash the password
    users[userIndex].password = newPassword;
    
    // Update any reset-related fields
    users[userIndex].resetToken = null;
    users[userIndex].resetTokenExpiry = null;
    
    console.log('Writing updated users back to file...');
    
    // Check if we're in a serverless environment (like Vercel)
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      console.error('Cannot write to filesystem in Vercel serverless environment');
      console.error('Password update requires a database in production, not file-based storage');
      console.error('Consider using Supabase, MongoDB, or another database for production');
      return false;
    }
    
    try {
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      console.log('Password updated successfully for:', email);
      return true;
    } catch (writeError) {
      console.error('Failed to write users file:', writeError);
      return false;
    }
    
  } catch (error) {
    console.error('Error updating password:', error);
    console.error('Error details:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    return false;
  }
}