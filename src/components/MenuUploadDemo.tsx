'use client';

import { useState, useRef } from 'react';

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

interface MenuUploadDemoProps {
  userInfo: UserInfo;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalyzing: () => void;
  analysisUsed: number;
}

export function MenuUploadDemo({ userInfo, onAnalysisComplete, onAnalyzing, analysisUsed }: MenuUploadDemoProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const remainingAnalyses = Math.max(0, 10 - analysisUsed);

  const handleFileUpload = async (file: File) => {
    if (remainingAnalyses <= 0) {
      alert('You have used all your free analyses for this session.');
      return;
    }

    setIsAnalyzing(true);
    onAnalyzing();

    try {
      const formData = new FormData();
      formData.append('file', file);
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      formData.append('type', fileType);
      formData.append('userInfo', JSON.stringify(userInfo));

      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
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
    if (fileType.includes('pdf') || fileType.includes('image') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('jpg')) {
      handleFileUpload(file);
    } else {
      alert('Please upload a PDF or image file (PNG, JPEG, JPG).');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileType = file.type;
      if (fileType.includes('pdf') || fileType.includes('image') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('jpg')) {
        handleFileUpload(file);
      } else {
        alert('Please upload a PDF or image file (PNG, JPEG, JPG).');
      }
    }
  };

  if (isAnalyzing) {
    return null; // Parent component handles analyzing state
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Your Menu</h2>
        <p className="text-lg text-gray-600 mb-2">Drop your menu file or paste a URL below</p>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-[#F38B08] font-medium text-sm">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7a1 1 0 012 0v4a1 1 0 01-2 0V7zm1 7a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
          {remainingAnalyses} free analyses remaining (demo session)
        </div>
      </div>

      {/* Single Upload Box */}
      <div className="max-w-2xl mx-auto">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive 
              ? 'border-[#F38B08] bg-orange-50' 
              : 'border-gray-300 hover:border-[#F38B08] hover:bg-orange-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drag & Drop Menu File Here
            </h3>
            <p className="text-gray-600 mb-4">
              Supports PDF, PNG, JPEG formats
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={remainingAnalyses <= 0}
              className="bg-[#F38B08] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Browse Files
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Menu URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourrestaurant.com/menu"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:border-transparent text-gray-900 bg-white"
              />
              <button
                onClick={handleUrlAnalysis}
                disabled={!url.trim() || remainingAnalyses <= 0}
                className="bg-[#F38B08] text-white px-6 py-3 rounded-lg hover:bg-[#E67A00] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Analyze
              </button>
            </div>
          </div>
        </div>

        {/* Supported Formats Info */}
        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Accepted formats: PDF, PNG, JPEG, JPG or website URL
        </div>

        {remainingAnalyses <= 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-center flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              You&apos;ve used all your demo analyses. Set up Supabase for unlimited access!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}