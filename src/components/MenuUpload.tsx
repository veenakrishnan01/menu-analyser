'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

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
  onAnalysisComplete: (result: AnalysisResult, analysisId?: string) => void;
  onAnalyzing: () => void;
  onAnalysisError?: () => void;
  analysisUsed: number;
}

export function MenuUpload({ userInfo, onAnalysisComplete, onAnalyzing, onAnalysisError }: MenuUploadProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [remainingAnalyses, setRemainingAnalyses] = useState(10);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const supabase = createClient();
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    const fetchRemainingAnalyses = async () => {
      if (!user) return;

      try {
        // Get user's session for today
        const today = new Date().toISOString().split('T')[0];
        const { data: session } = await supabase
          .from('user_sessions')
          .select('analyses_used')
          .eq('user_id', user.id)
          .eq('session_date', today)
          .single();

        const used = session?.analyses_used || 0;
        setRemainingAnalyses(Math.max(0, 10 - used)); // 10 free analyses per day
      } catch (error) {
        console.error('Error fetching remaining analyses:', error);
        setRemainingAnalyses(10);
      }
    };

    fetchRemainingAnalyses();
  }, [user, supabase]);

  const updateAnalysisCount = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert user session
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          session_date: today,
          analyses_used: 1,
          last_analysis_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,session_date',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error updating analysis count:', error);
      }
    } catch (error) {
      console.error('Error updating analysis count:', error);
    }
  };

  const saveAnalysisToDatabase = async (
    result: AnalysisResult, 
    menuSource: 'file' | 'url',
    menuUrl?: string,
    fileName?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('menu_analyses')
        .insert({
          user_id: user.id,
          business_name: userInfo.businessName,
          menu_source: menuSource,
          menu_url: menuUrl,
          menu_file_name: fileName,
          analysis_results: result,
          revenue_score: result.revenue_score
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving analysis:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error saving analysis:', error);
      return null;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (remainingAnalyses <= 0) {
      showError('Daily limit reached', 'You have used all your free analyses for today. Please try again tomorrow or upgrade your plan.');
      return;
    }

    setIsAnalyzing(true);
    onAnalyzing();
    showInfo('Analyzing menu', 'Please wait while we analyze your menu...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Better file type detection
      const fileName = file.name.toLowerCase();
      const isPDF = file.type === 'application/pdf' || fileName.endsWith('.pdf');
      const fileType = isPDF ? 'pdf' : 'image';

      formData.append('type', fileType);
      formData.append('userInfo', JSON.stringify(userInfo));

      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Save to database
      const analysisId = await saveAnalysisToDatabase(
        result,
        'file',
        undefined,
        file.name
      );
      
      // Update analysis count
      await updateAnalysisCount();
      setRemainingAnalyses(prev => Math.max(0, prev - 1));

      showSuccess('Analysis complete!', 'Your menu has been successfully analyzed.');
      onAnalysisComplete(result, analysisId || undefined);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze menu. Please try again.';
      showError('Analysis failed', errorMessage);
      setIsAnalyzing(false);
      onAnalysisError?.(); // Reset parent component state
    }
  };

  const handleUrlAnalysis = async () => {
    if (!url.trim()) {
      showError('URL required', 'Please enter a valid menu URL.');
      return;
    }

    if (remainingAnalyses <= 0) {
      showError('Daily limit reached', 'You have used all your free analyses for today.');
      return;
    }

    setIsAnalyzing(true);
    onAnalyzing();
    showInfo('Analyzing menu', 'Fetching and analyzing your online menu...');

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
      
      // Save to database
      const analysisId = await saveAnalysisToDatabase(
        result,
        'url',
        url.trim()
      );
      
      // Update analysis count
      await updateAnalysisCount();
      setRemainingAnalyses(prev => Math.max(0, prev - 1));

      showSuccess('Analysis complete!', 'Your online menu has been successfully analyzed.');
      onAnalysisComplete(result, analysisId || undefined);
      setUrl('');
    } catch (error) {
      console.error('Analysis error:', error);
      showError('Analysis failed', 'Failed to analyze menu from URL. Please check the URL and try again.');
      setIsAnalyzing(false);
      onAnalysisError?.(); // Reset parent component state
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Check both MIME type and file extension for better compatibility
    const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
    const isImage = fileType.startsWith('image/') ||
                   fileName.endsWith('.png') ||
                   fileName.endsWith('.jpg') ||
                   fileName.endsWith('.jpeg') ||
                   fileName.endsWith('.gif') ||
                   fileName.endsWith('.webp');

    if (isPDF || isImage) {
      handleFileUpload(file);
    } else {
      showError('Invalid file type', 'Please upload a PDF or image file (PNG, JPEG, JPG, GIF, WebP).');
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
      const fileName = file.name.toLowerCase();

      // Check both MIME type and file extension for better compatibility
      const isPDF = fileType === 'application/pdf' || fileName.endsWith('.pdf');
      const isImage = fileType.startsWith('image/') ||
                     fileName.endsWith('.png') ||
                     fileName.endsWith('.jpg') ||
                     fileName.endsWith('.jpeg') ||
                     fileName.endsWith('.gif') ||
                     fileName.endsWith('.webp');

      if (isPDF || isImage) {
        handleFileUpload(file);
      } else {
        showError('Invalid file type', 'Please upload a PDF or image file (PNG, JPEG, JPG, GIF, WebP).');
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
          {remainingAnalyses} free analyses remaining today
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
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,image/*,application/pdf"
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
              You&apos;ve used all your free analyses for today. Come back tomorrow for more!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}