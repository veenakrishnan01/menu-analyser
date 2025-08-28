'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

export function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/analyses', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Error fetching analyses:', await response.text());
          return;
        }

        const data = await response.json();
        // Get only the 5 most recent analyses
        const recentAnalyses = (data.analyses || []).slice(0, 5);
        setAnalyses(recentAnalyses);
      } catch (error) {
        console.error('Error fetching recent analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAnalyses();
  }, [user]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Analyses</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-12 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Analyses</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-600 mb-6">Start by analyzing your first menu to see insights here.</p>
          <Link
            href="/analyze"
            className="bg-[#F38B08] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] font-medium inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Analyze Your First Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
        <Link
          href="/analyze"
          className="text-[#F38B08] hover:text-[#E67A00] font-medium text-sm inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Analysis
        </Link>
      </div>

      <div className="space-y-3">
        {analyses.map((analysis) => (
          <Link
            key={analysis.id}
            href={`/analysis/${analysis.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-[#F38B08] hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {analysis.menu_source === 'url' ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    ) : analysis.menu_source === 'file' ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {analysis.business_name || 'Menu Analysis'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString()} at{' '}
                      {new Date(analysis.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.revenue_score)}`}>
                  {analysis.revenue_score}
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {analyses.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            href="/analyses"
            className="text-[#F38B08] hover:text-[#E67A00] font-medium text-sm"
          >
            View All Analyses ({analyses.length}) →
          </Link>
        </div>
      )}
    </div>
  );
}