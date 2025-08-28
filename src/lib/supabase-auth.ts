import { createClient } from '@/lib/supabase/server';

export interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  created_at?: string;
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
      created_at: data.created_at
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
      created_at: data.created_at
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
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Update user password
export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword }) // In production, hash this
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
      created_at: data.created_at
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