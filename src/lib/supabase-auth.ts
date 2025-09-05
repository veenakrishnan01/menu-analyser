import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  created_at?: string;
  email_verified?: boolean;
  verification_token?: string;
  verification_token_expires?: string;
}

export interface StoredUser extends User {
  password: string;
}

// Get user by email
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      console.log('User not found:', email);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      businessName: data.business_name,
      phone: data.phone,
      created_at: data.created_at,
      email_verified: data.email_verified,
      verification_token: data.verification_token,
      verification_token_expires: data.verification_token_expires
    };
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<StoredUser | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.log('User not found with ID:', id);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      businessName: data.business_name,
      phone: data.phone,
      created_at: data.created_at,
      email_verified: data.email_verified,
      verification_token: data.verification_token,
      verification_token_expires: data.verification_token_expires
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

// Create new user
export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  businessName?: string;
  phone?: string;
}): Promise<StoredUser | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        password: userData.password, // In production, hash this
        name: userData.name,
        business_name: userData.businessName,
        phone: userData.phone
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating user:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      businessName: data.business_name,
      phone: data.phone,
      created_at: data.created_at,
      email_verified: data.email_verified,
      verification_token: data.verification_token,
      verification_token_expires: data.verification_token_expires
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Update user password
export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    // Hash the new password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (error) {
      console.error('Error updating password:', error);
      return false;
    }

    console.log('Password updated successfully for:', email);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string, 
  updates: { name?: string; businessName?: string; phone?: string }
): Promise<StoredUser | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        business_name: updates.businessName,
        phone: updates.phone
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      businessName: data.business_name,
      phone: data.phone,
      created_at: data.created_at,
      email_verified: data.email_verified,
      verification_token: data.verification_token,
      verification_token_expires: data.verification_token_expires
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

// Check if user exists
export async function userExists(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email);
    return user !== null;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

// Generate verification token and update user
export async function generateVerificationToken(email: string): Promise<string | null> {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .update({ 
        verification_token: token,
        verification_token_expires: expires.toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error generating verification token:', error);
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error generating verification token:', error);
    return null;
  }
}

// Verify email token
export async function verifyEmailToken(token: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !data) {
      return false;
    }

    // Check if token is expired
    if (new Date() > new Date(data.verification_token_expires)) {
      return false;
    }

    // Mark email as verified and clear token
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        verification_token: null,
        verification_token_expires: null
      })
      .eq('verification_token', token);

    if (updateError) {
      console.error('Error verifying email:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying email token:', error);
    return false;
  }
}