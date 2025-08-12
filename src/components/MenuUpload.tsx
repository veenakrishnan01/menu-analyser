'use client';

import { useState, useRef, useEffect } from 'react';
import { getRemainingAnalyses, updateSession, canAnalyze } from '@/lib/session';

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

interface MenuUploadProps {
  userInfo: UserInfo;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalyzing: () => void;
  analysisUsed: number;
}

export function MenuUpload({ userInfo, onAnalysisComplete, onAnalyzing, analysisUsed }: MenuUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'pdf' | 'image' | 'url' | null>(null);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [remainingAnalyses, setRemainingAnalyses] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update remaining analyses based on user session
    const remaining = getRemainingAnalyses(userInfo.email);
    setRemainingAnalyses(remaining);
  }, [userInfo.email]);

  const handleFileUpload = async (file: File, type: 'pdf' | 'image') => {
    if (remainingAnalyses <= 0) {
      alert('You have used all your free analyses. Please upgrade to continue.');
      return;
    }

    setIsAnalyzing(true);
    onAnalyzing();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('userInfo', JSON.stringify(userInfo));

      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      // Update session with analysis count
      updateSession(userInfo.email);
      setRemainingAnalyses(getRemainingAnalyses(userInfo.email));
      
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze menu. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleUrlAnalysis = async () => {
    if (!url.trim() || remainingAnalyses <= 0) return;

    setIsAnalyzing(true);
    onAnalyzing();

    try {
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          userInfo
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      // Update session with analysis count
      updateSession(userInfo.email);
      setRemainingAnalyses(getRemainingAnalyses(userInfo.email));
      
      onAnalysisComplete(result);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze menu from URL. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    if (fileType.includes('pdf')) {
      handleFileUpload(file, 'pdf');
    } else if (fileType.includes('image')) {
      handleFileUpload(file, 'image');
    } else {
      alert('Please upload a PDF or image file.');
    }
  };

  if (isAnalyzing) {
    return null; // Parent component handles analyzing state
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Menu</h2>
        <p className="text-gray-600">Choose how you'd like to share your menu for analysis</p>
        <div className="mt-2 text-sm text-[#F38B08] font-medium">
          {remainingAnalyses} free analyses remaining
        </div>
      </div>

      {!uploadMethod && (
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => setUploadMethod('pdf')}
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#F38B08] hover:bg-orange-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF</h3>
              <p className="text-sm text-gray-500">Upload your menu as a PDF file</p>
            </div>
          </button>

          <button
            onClick={() => setUploadMethod('image')}
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#F38B08] hover:bg-orange-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Image</h3>
              <p className="text-sm text-gray-500">Upload a photo of your menu</p>
            </div>
          </button>

          <button
            onClick={() => setUploadMethod('url')}
            className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#F38B08] hover:bg-orange-50 transition-colors"
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Website URL</h3>
              <p className="text-sm text-gray-500">Enter your menu website URL</p>
            </div>
          </button>
        </div>
      )}

      {uploadMethod === 'pdf' && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={remainingAnalyses <= 0}
            className="bg-[#F38B08] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select PDF File
          </button>
          <button
            onClick={() => setUploadMethod(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>
      )}

      {uploadMethod === 'image' && (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={remainingAnalyses <= 0}
            className="bg-[#F38B08] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Image File
          </button>
          <button
            onClick={() => setUploadMethod(null)}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>
      )}

      {uploadMethod === 'url' && (
        <div className="max-w-md mx-auto">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourrestaurant.com/menu"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38B08] mb-4 text-gray-900 bg-white"
          />
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleUrlAnalysis}
              disabled={!url.trim() || remainingAnalyses <= 0}
              className="bg-[#F38B08] text-white px-6 py-2 rounded-lg hover:bg-[#E67A00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Menu
            </button>
            <button
              onClick={() => setUploadMethod(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {remainingAnalyses <= 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-center">
            You've used all your free analyses. Upgrade to get unlimited access plus advanced features!
          </p>
        </div>
      )}
    </div>
  );
}