'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/dashboard/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { MenuAnalysis } from '@/lib/types/database';
import Link from 'next/link';

export default function AnalysesPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<MenuAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'this-month' | 'last-week'>('all');
  
  const supabase = createClient();

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('menu_analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filter === 'this-month') {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          query = query.gte('created_at', startOfMonth.toISOString());
        } else if (filter === 'last-week') {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          query = query.gte('created_at', lastWeek.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching analyses:', error);
          return;
        }

        setAnalyses(data || []);
      } catch (error) {
        console.error('Error fetching analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [user, filter, supabase]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F38B08] mx-auto mb-4"></div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Loading Analyses...</h3>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Analyses</h1>
            <p className="text-gray-600">View and manage your menu analysis history</p>
          </div>

          {/* Filters and Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <span className="text-sm font-medium text-gray-700">Filter:</span>
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All Time' },
                    { key: 'this-month', label: 'This Month' },
                    { key: 'last-week', label: 'Last Week' }
                  ].map((filterOption) => (
                    <button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key as typeof filter)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filter === filterOption.key
                          ? 'bg-[#F38B08] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📊 {analyses.length} total analyses</span>
                {analyses.length > 0 && (
                  <span>
                    📈 Avg Score: {Math.round(analyses.reduce((sum, a) => sum + a.revenue_score, 0) / analyses.length)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Analyses Grid */}
          {analyses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analyses Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't analyzed any menus yet. Start with your first analysis!" 
                  : `No analyses found for the selected time period.`
                }
              </p>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/analysis/${analysis.id}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-[#F38B08] hover:shadow-md transition-all p-6 block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {analysis.business_name || 'Menu Analysis'}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        {analysis.menu_source === 'url' ? (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                        <span>{analysis.menu_source === 'url' ? 'URL' : 'File'}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(analysis.revenue_score)}`}>
                      {analysis.revenue_score}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Quick Wins:</span>
                      <span>{analysis.analysis_results.quick_wins?.length || 0} items</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${getScoreColor(analysis.revenue_score)} inline-block`}>
                      {getScoreBadge(analysis.revenue_score)}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-3">
                    <div>📅 {new Date(analysis.created_at).toLocaleDateString()}</div>
                    <div>🕐 {new Date(analysis.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</div>
                  </div>

                  <div className="mt-3 flex items-center text-sm text-[#F38B08] font-medium">
                    View Analysis
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}