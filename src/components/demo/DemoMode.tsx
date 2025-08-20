'use client';

import { useState } from 'react';
import MenuAnalyzerDemo from '@/components/MenuAnalyzerDemo';

export function DemoMode() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Demo Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-yellow-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Demo Mode</span>
            <span className="text-sm">- Analysis results won't be saved</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Menu <span className="text-[#F38B08]">Analyzer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered restaurant menu analysis to optimize your revenue and average order value. 
            Get actionable insights to boost your restaurant&apos;s profitability.
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800">
              <strong>Note:</strong> This is demo mode. To save your analysis results and access advanced features,
              please set up Supabase authentication.
            </p>
          </div>
        </div>
        <MenuAnalyzerDemo />
      </div>
    </div>
  );
}