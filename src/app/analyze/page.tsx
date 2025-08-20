'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/dashboard/Navbar';
import MenuAnalyzer from '@/components/MenuAnalyzer';

export default function AnalyzePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MenuAnalyzer />
        </div>
      </div>
    </ProtectedRoute>
  );
}