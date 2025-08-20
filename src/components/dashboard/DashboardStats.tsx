'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StatsData {
  totalAnalyses: number;
  averageScore: number;
  lastAnalysisDate: string | null;
  analysesThisMonth: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalAnalyses: 0,
    averageScore: 0,
    lastAnalysisDate: null,
    analysesThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch all user's analyses
        const { data: analyses, error } = await supabase
          .from('menu_analyses')
          .select('revenue_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching stats:', error);
          return;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalAnalyses = analyses?.length || 0;
        const averageScore = analyses?.length 
          ? Math.round(analyses.reduce((sum, a) => sum + a.revenue_score, 0) / analyses.length)
          : 0;
        const lastAnalysisDate = analyses?.[0]?.created_at || null;
        const analysesThisMonth = analyses?.filter(a => {
          const date = new Date(a.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length || 0;

        setStats({
          totalAnalyses,
          averageScore,
          lastAnalysisDate,
          analysesThisMonth
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: 'Total Analyses',
      value: stats.totalAnalyses,
      icon: '📊',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Average Score',
      value: stats.averageScore,
      icon: '⭐',
      color: 'bg-green-50 text-green-600',
      suffix: '/100'
    },
    {
      title: 'This Month',
      value: stats.analysesThisMonth,
      icon: '📈',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Last Analysis',
      value: stats.lastAnalysisDate 
        ? new Date(stats.lastAnalysisDate).toLocaleDateString()
        : 'Never',
      icon: '🕐',
      color: 'bg-orange-50 text-orange-600',
      isDate: true
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {card.isDate ? card.value : `${card.value}${card.suffix || ''}`}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.color}`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}