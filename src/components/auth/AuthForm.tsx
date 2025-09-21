'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '@/styles/phone-input.css';
import { useForm, Controller } from 'react-hook-form';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

type SignInFormData = {
  email: string;
  password: string;
};

type SignUpFormData = {
  email: string;
  password: string;
  name: string;
  businessName?: string;
  phoneNumber: string;
};


export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<SignUpFormData>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'signup' && {
        name: '',
        businessName: '',
        phoneNumber: '',
      }),
    },
  });

  // Clear form and errors when mode changes
  useEffect(() => {
    reset();
    clearErrors();
    setError(null);
    setShowPassword(false);
  }, [mode, reset, clearErrors]);

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        showInfo('Creating account', 'Setting up your new account...');
        const signupData = data as SignUpFormData;
        const formattedPhone = signupData.phoneNumber ? `+${signupData.phoneNumber}` : '';
        await signUp(
          signupData.email,
          signupData.password,
          signupData.name,
          signupData.businessName || '',
          formattedPhone
        );
        showSuccess('Account created!', 'Welcome to MenuAnalyzer! You can now start analyzing your menus.');
      } else {
        showInfo('Signing in', 'Verifying your credentials...');
        const signinData = data as SignInFormData;
        await signIn(signinData.email, signinData.password);
        showSuccess('Welcome back!', 'Successfully signed in to your account.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      showError(mode === 'signup' ? 'Account creation failed' : 'Sign in failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const emailValidation = {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  };

  const passwordValidation = {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
    ...(mode === 'signup' && {
      validate: {
        hasUpperCase: (value: string) =>
          /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
        hasLowerCase: (value: string) =>
          /[a-z]/.test(value) || 'Password must contain at least one lowercase letter',
        hasNumber: (value: string) =>
          /[0-9]/.test(value) || 'Password must contain at least one number',
      },
    }),
  };

  const nameValidation = {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
  };

  const phoneValidation = {
    required: 'Phone number is required',
    minLength: {
      value: 10,
      message: 'Please enter a valid phone number',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'signin' ? 'Welcome Back!' : 'Get Started'}
          </h2>
          <p className="text-gray-600">
            {mode === 'signin' 
              ? 'Sign in to access your menu analyses' 
              : 'Create your account to start analyzing menus'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name', nameValidation)}
                  className={`w-full px-4 py-3 border ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-[#F38B08]'
                  } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  {...register('businessName')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:border-transparent"
                  placeholder="Your restaurant name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Controller
                  name={'phoneNumber'}
                  control={control}
                  rules={phoneValidation}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PhoneInput
                      country={'us'}
                      value={value as string}
                      onChange={onChange}
                      onBlur={onBlur}
                      inputProps={{
                        className: `w-full pl-12 pr-4 py-3 border ${
                          errors.phoneNumber 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#F38B08]'
                        } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`,
                      }}
                      containerClass="phone-input-container"
                      buttonClass="phone-input-button"
                      dropdownClass="phone-input-dropdown"
                      enableSearch={false}
                      disableSearchIcon={true}
                      specialLabel=""
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              {...register('email', emailValidation)}
              className={`w-full px-4 py-3 border ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-[#F38B08]'
              } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password', passwordValidation)}
                className={`w-full px-4 py-3 pr-12 border ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-[#F38B08]'
                } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent`}
                placeholder={mode === 'signup' ? "Min 6 chars, 1 upper, 1 lower, 1 number" : "Enter your password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
            {mode === 'signin' && (
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#F38B08] hover:text-[#E67A00] font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F38B08] text-white py-3 px-4 rounded-lg hover:bg-[#E67A00] focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setError(null);
              onModeChange(mode === 'signin' ? 'signup' : 'signin');
            }}
            className="text-[#F38B08] hover:text-[#E67A00] font-medium"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </div>
    </div>
  );
}