'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/dashboard/Navbar';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'there'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.businessName 
                ? `Here's how ${user.businessName} is performing` 
                : "Here's your menu analysis dashboard"
              }
            </p>
          </div>

          {/* Stats Overview */}
          <DashboardStats />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Analyses */}
            <div className="lg:col-span-2">
              <RecentAnalyses />
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/analyze"
                    className="w-full bg-[#F38B08] text-white px-4 py-3 rounded-lg hover:bg-[#E67A00] font-medium inline-flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Analyze New Menu
                  </Link>
                  
                  <Link
                    href="/profile"
                    className="w-full bg-white text-gray-700 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium inline-flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  Pro Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#F38B08] mr-2 font-bold">•</span>
                    Upload high-quality menu images for better analysis
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F38B08] mr-2 font-bold">•</span>
                    Compare multiple versions to track improvements
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F38B08] mr-2 font-bold">•</span>
                    Focus on Quick Wins for immediate revenue boost
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#F38B08] mr-2 font-bold">•</span>
                    Analyze competitor menus for market insights
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}