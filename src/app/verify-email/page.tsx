'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'initial'>('initial');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Email verification failed');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">🍽️ Menu Analyzer</h1>
          
          {status === 'initial' && !token && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Check Your Email</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  We&apos;ve sent a verification link to your email address. Please check your email and click the verification link to activate your account.
                </p>
              </div>
              <div className="text-gray-600 text-sm mb-6">
                <p>Didn&apos;t receive the email? Check your spam folder or contact support.</p>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verifying Email...</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <h2 className="text-2xl font-semibold text-green-600 mb-4">✅ Email Verified!</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">{message}</p>
              </div>
              <p className="text-gray-600 mb-4">Redirecting you to login page...</p>
              <Link 
                href="/login"
                className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <h2 className="text-2xl font-semibold text-red-600 mb-4">❌ Verification Failed</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{message}</p>
              </div>
              <div className="space-y-3">
                <Link 
                  href="/signup"
                  className="block w-full bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sign Up Again
                </Link>
                <Link 
                  href="/login"
                  className="block w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}