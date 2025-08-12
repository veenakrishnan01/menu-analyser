'use client';

import { useState } from 'react';
import { UserInfoForm } from './UserInfoForm';
import { MenuUpload } from './MenuUpload';
import { AnalysisResults } from './AnalysisResults';
import { UpsellSection } from './UpsellSection';

interface UserInfo {
  name: string;
  email: string;
  businessName?: string;
}

interface AnalysisResult {
  revenue_score: number;
  quick_wins: string[];
  visual_appeal: string[];
  strategic_pricing: string[];
  menu_design: string[];
  summary: string;
}

export default function MenuAnalyzer() {
  const [step, setStep] = useState<'userInfo' | 'upload' | 'analyzing' | 'results'>('userInfo');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisUsed, setAnalysisUsed] = useState(0);

  const handleUserInfoSubmit = async (info: UserInfo) => {
    setUserInfo(info);
    
    // Add to GoHighLevel CRM
    try {
      const response = await fetch('/api/crm/add-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.warn('CRM integration response:', data.message);
      } else {
        console.log('Lead successfully captured:', data.message);
      }
    } catch (error) {
      console.error('CRM integration error:', error);
      // Don't show error to user - continue with the flow
    }
    
    setStep('upload');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setAnalysisUsed(prev => prev + 1);
    setStep('results');
  };

  const handleNewAnalysis = () => {
    setStep('upload');
    setAnalysisResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {step === 'userInfo' && (
        <UserInfoForm onSubmit={handleUserInfoSubmit} />
      )}
      
      {step === 'upload' && userInfo && (
        <MenuUpload 
          userInfo={userInfo}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalyzing={() => setStep('analyzing')}
          analysisUsed={analysisUsed}
        />
      )}
      
      {step === 'analyzing' && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your Menu</h3>
          <p className="text-gray-600">Our AI is reviewing your menu and generating insights...</p>
        </div>
      )}
      
      {step === 'results' && analysisResult && userInfo && (
        <div className="space-y-8">
          <AnalysisResults 
            result={analysisResult} 
            userInfo={userInfo}
            onNewAnalysis={handleNewAnalysis}
          />
          <UpsellSection userInfo={userInfo} />
        </div>
      )}
    </div>
  );
}