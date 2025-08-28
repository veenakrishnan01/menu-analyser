'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/dashboard/Navbar';
import { AnalysisResults } from '@/components/AnalysisResults';
import { useAuth } from '@/contexts/AuthContext';

interface Analysis {
  id: string;
  user_id: string;
  business_name?: string;
  menu_source: 'file' | 'url' | 'text';
  menu_url?: string;
  revenue_score: number;
  analysis_results: {
    revenue_score: number;
    quick_wins: string[];
    visual_appeal: string[];
    strategic_pricing: string[];
    menu_design: string[];
    summary: string;
  };
  created_at: string;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const analysisId = params.id as string;

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!user || !analysisId) return;

      try {
        const response = await fetch(`/api/analyses/${analysisId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Analysis not found.');
          } else if (response.status === 403) {
            setError('Access denied. You can only view your own analyses.');
          } else {
            setError('Failed to load analysis. Please try again.');
          }
          return;
        }

        const data = await response.json();
        setAnalysis(data.analysis);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user, analysisId]);

  const handleNewAnalysis = () => {
    router.push('/analyze');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F38B08] mx-auto mb-4"></div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Loading Analysis...</h3>
              <p className="text-gray-600">Please wait while we load your analysis report</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !analysis) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analysis Not Found</h3>
              <p className="text-gray-600 mb-6">
                {error || 'The analysis you\'re looking for doesn\'t exist or has been removed.'}
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleBackToDashboard}
                  className="bg-[#F38B08] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={handleBackToDashboard}
                className="hover:text-[#F38B08] transition-colors"
              >
                Dashboard
              </button>
              <span>→</span>
              <span className="text-gray-900 font-medium">
                {analysis.business_name || 'Menu Analysis'}
              </span>
            </nav>
          </div>

          {/* Analysis Details Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {analysis.business_name || 'Menu Analysis'}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>
                    📅 {new Date(analysis.created_at).toLocaleDateString()} at{' '}
                    {new Date(analysis.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span>
                    {analysis.menu_source === 'url' ? '🔗 URL Analysis' : 
                     analysis.menu_source === 'file' ? '📄 File Analysis' : '📝 Text Analysis'}
                  </span>
                  {analysis.menu_url && (
                    <a 
                      href={analysis.menu_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#F38B08] hover:underline"
                    >
                      View Original Menu
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#F38B08]">
                  {analysis.revenue_score}
                </div>
                <div className="text-sm text-gray-600">Revenue Score</div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <AnalysisResults
            result={analysis.analysis_results}
            userInfo={{
              name: user?.name || '',
              email: user?.email || '',
              businessName: user?.businessName || analysis.business_name || undefined
            }}
            onNewAnalysis={handleNewAnalysis}
            analysisId={analysis.id}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}