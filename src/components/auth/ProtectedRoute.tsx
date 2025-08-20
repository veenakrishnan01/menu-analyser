'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F38B08] mx-auto mb-4"></div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Loading...</h3>
            <p className="text-gray-600">Please wait while we load your account</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null; // Redirect will happen in useEffect
  }

  return <>{children}</>;
}