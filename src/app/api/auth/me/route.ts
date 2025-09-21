import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    try {
      // Verify JWT token
      const payload = verifyToken(token);

      const user = {
        id: payload.userId,
        email: payload.email,
        name: payload.name
      };

      return NextResponse.json({
        success: true,
        user: user
      });
    } catch (tokenError) {
      // Token is invalid or expired
      cookieStore.delete('token');
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}