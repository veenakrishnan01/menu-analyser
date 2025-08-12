'use client';

import { useState } from 'react';
import MenuAnalyzer from '@/components/MenuAnalyzer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Menu <span className="text-[#F38B08]">Analyzer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered restaurant menu analysis to optimize your revenue and average order value. 
            Get actionable insights to boost your restaurant's profitability.
          </p>
        </div>
        <MenuAnalyzer />
      </div>
    </div>
  );
}
