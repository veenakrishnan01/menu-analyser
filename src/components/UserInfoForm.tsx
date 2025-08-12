'use client';

import { useState } from 'react';

interface UserInfo {
  name: string;
  email: string;
  businessName?: string;
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
}

export function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const [formData, setFormData] = useState<UserInfo>({
    name: '',
    email: '',
    businessName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
    onSubmit(formData);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Free Menu Analysis</h2>
        <p className="text-gray-600">Enter your details to receive your personalized report</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:border-transparent text-gray-900 bg-white"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:border-transparent text-gray-900 bg-white"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant/Business Name (Optional)
          </label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:border-transparent text-gray-900 bg-white"
            placeholder="Enter your business name"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.name || !formData.email}
          className="w-full bg-[#F38B08] text-white py-3 px-4 rounded-md hover:bg-[#E67A00] focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Menu Upload'}
        </button>
      </form>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Your information is secure and will not be shared</span>
        </div>
      </div>
    </div>
  );
}