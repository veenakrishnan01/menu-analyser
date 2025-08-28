'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, businessName?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name: string; businessName?: string; phone?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  requestPasswordReset: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    
    // Migrate old localStorage analyses to new system
    await migrateOldAnalyses();
  };

  const signUp = async (email: string, password: string, name: string, businessName?: string, phone?: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, name, businessName, phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    setUser(data.user);
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    // Send password reset request to API
    const response = await fetch('/api/send-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send reset email');
    }

    console.log('Password reset email sent successfully');
  };

  const resetPassword = async (token: string, newPassword: string) => {
    // Reset password via API
    const response = await fetch('/api/send-reset-email', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to reset password');
    }

    console.log('Password reset successful');
  };

  const updateProfile = async (data: { name: string; businessName?: string; phone?: string }) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Profile update failed');
    }

    setUser(result.profile);
  };

  const refreshProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.profile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


// Migration function to convert old analyses to new system
async function migrateOldAnalyses() {
  try {
    // Check if we have old analyses in localStorage that need migration
    const oldAnalyses = localStorage.getItem('userAnalyses') || localStorage.getItem('analyses');
    if (!oldAnalyses) return;

    const parsedAnalyses = JSON.parse(oldAnalyses);
    if (!Array.isArray(parsedAnalyses) || parsedAnalyses.length === 0) return;

    // Migrate each old analysis to the new system
    for (const oldAnalysis of parsedAnalyses) {
      try {
        // Convert old analysis format to new format
        const migratedAnalysis = {
          business_name: oldAnalysis.businessName || oldAnalysis.business_name || 'Migrated Analysis',
          menu_source: oldAnalysis.source || oldAnalysis.menu_source || 'text',
          menu_url: oldAnalysis.url || oldAnalysis.menu_url,
          analysis_results: {
            revenue_score: oldAnalysis.revenueScore || oldAnalysis.revenue_score || 75,
            quick_wins: oldAnalysis.quickWins || oldAnalysis.quick_wins || [],
            visual_appeal: oldAnalysis.visualAppeal || oldAnalysis.visual_appeal || [],
            strategic_pricing: oldAnalysis.strategicPricing || oldAnalysis.strategic_pricing || [],
            menu_design: oldAnalysis.menuDesign || oldAnalysis.menu_design || [],
            summary: oldAnalysis.summary || 'Migrated from previous system'
          }
        };

        // Save to new system via API
        await fetch('/api/analyses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(migratedAnalysis),
        });
      } catch (error) {
        console.error('Error migrating individual analysis:', error);
      }
    }

    // Clear old localStorage after successful migration
    localStorage.removeItem('userAnalyses');
    localStorage.removeItem('analyses');
    
    console.log(`Successfully migrated ${parsedAnalyses.length} analyses to new system`);
  } catch (error) {
    console.error('Error during analysis migration:', error);
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};