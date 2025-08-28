import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  password: string;
  created_at?: string;
}

// GET - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from session
    global.sessions = global.sessions || {};
    const user = global.sessions[sessionToken];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get full user data from storage
    const fullUser = getUserById(user.id);
    
    if (!fullUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile without password
    const { password, ...profile } = fullUser;

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from session
    global.sessions = global.sessions || {};
    const user = global.sessions[sessionToken];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { name, businessName, phone } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = updateUserProfile(user.id, {
      name: name.trim(),
      businessName: businessName?.trim() || undefined,
      phone: phone?.trim() || undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update session with new user data
    const { password, ...userWithoutPassword } = updatedUser;
    global.sessions[sessionToken] = userWithoutPassword;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getUserById(userId: string): StoredUser | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8')) as StoredUser[];
      return users.find(u => u.id === userId) || null;
    }
  } catch (error) {
    console.error('Error reading user:', error);
  }
  
  return null;
}

function updateUserProfile(userId: string, updates: {
  name: string;
  businessName?: string;
  phone?: string;
}): StoredUser | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const usersFile = path.join(process.cwd(), 'users.json');
    
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8')) as StoredUser[];
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return null;
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        name: updates.name,
        businessName: updates.businessName,
        phone: updates.phone
      };

      // Save back to file
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      
      return users[userIndex];
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  
  return null;
}