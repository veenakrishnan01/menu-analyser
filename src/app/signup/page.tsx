'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignupPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  return <AuthForm mode={mode} onModeChange={setMode} />;
}