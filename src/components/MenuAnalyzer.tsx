'use client';

import { useState } from 'react';
import { MenuUpload } from './MenuUpload';
import { AnalysisResults } from './AnalysisResults';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisResult {
  revenue_score: number;
  quick_wins: string[];
  visual_appeal: string[];
  strategic_pricing: string[];
  menu_design: string[];
  summary: string;
}

export default function MenuAnalyzer() {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleAnalysisComplete = (result: AnalysisResult, id?: string) => {
    setAnalysisResult(result);
    setAnalysisId(id || null);
    setStep('results');
  };

  const handleAnalysisError = () => {
    setStep('upload');
  };

  const handleNewAnalysis = () => {
    setStep('upload');
    setAnalysisResult(null);
    setAnalysisId(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {step === 'upload' && user && (
        <MenuUpload
          userInfo={{
            name: user.name || user.email || '',
            email: user.email || '',
            businessName: user.businessName || undefined
          }}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalyzing={() => setStep('analyzing')}
          onAnalysisError={handleAnalysisError}
          analysisUsed={0} // Will be calculated from database
        />
      )}
      
      {step === 'analyzing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F38B08] mx-auto mb-4"></div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your Menu</h3>
          <p className="text-gray-600">Our AI is reviewing your menu and generating insights...</p>
        </div>
      )}
      
      {step === 'results' && analysisResult && user && (
        <AnalysisResults 
          result={analysisResult} 
          userInfo={{
            name: user.name || user.email || '',
            email: user.email || '',
            businessName: user.businessName || undefined
          }}
          onNewAnalysis={handleNewAnalysis}
          analysisId={analysisId}
        />
      )}
    </div>
  );
}