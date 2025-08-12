'use client';

import { useState } from 'react';

interface UserInfo {
  name: string;
  email: string;
  businessName?: string;
}

interface UpsellSectionProps {
  userInfo: UserInfo;
}

interface UpsellService {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const upsellServices: UpsellService[] = [
  {
    id: 'cloud-kitchen',
    name: 'Cloud Kitchen Gap Analysis',
    description: 'Identify profitable cloud kitchen brands you could launch in your area',
    price: 49,
    features: [
      'Market demand analysis for your location',
      'Competitor gap identification',
      'Top 10 cloud kitchen opportunities',
      'Revenue potential estimates',
      'Setup cost breakdown',
      'Recommended delivery platforms'
    ]
  },
  {
    id: 'competitor',
    name: 'Competitor Analysis',
    description: 'Analyze your competitors and find gaps you could fill',
    price: 49,
    features: [
      'Direct competitor identification',
      'Menu comparison analysis',
      'Pricing strategy insights',
      'Market positioning gaps',
      'Customer review analysis',
      'Actionable differentiation strategies'
    ]
  },
  {
    id: 'profitable-items',
    name: '100 Profitable Menu Items',
    description: 'Discover high-margin items you could add to boost profits',
    price: 39,
    features: [
      '100 proven profitable menu items',
      'Cost analysis and profit margins',
      'Seasonal menu suggestions',
      'Trending food items',
      'Easy-to-implement recipes',
      'Supplier recommendations'
    ]
  }
];

const comboOffers = [
  {
    id: 'cloud-competitor-combo',
    name: 'Complete Market Analysis',
    description: 'Cloud Kitchen + Competitor Analysis Bundle',
    originalPrice: 98,
    price: 79,
    savings: 19,
    includes: ['cloud-kitchen', 'competitor']
  },
  {
    id: 'ultimate-combo',
    name: 'Ultimate Restaurant Growth Package',
    description: 'All analyses + 100 profitable items',
    originalPrice: 137,
    price: 99,
    savings: 38,
    includes: ['cloud-kitchen', 'competitor', 'profitable-items']
  }
];

export function UpsellSection({ userInfo }: UpsellSectionProps) {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleServiceToggle = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleComboSelect = (comboId: string) => {
    const combo = comboOffers.find(c => c.id === comboId);
    if (combo) {
      setSelectedServices(new Set(combo.includes));
    }
  };

  const calculateTotal = () => {
    // Check if current selection matches a combo
    const matchingCombo = comboOffers.find(combo => 
      combo.includes.length === selectedServices.size &&
      combo.includes.every(id => selectedServices.has(id))
    );

    if (matchingCombo) {
      return matchingCombo.price;
    }

    return Array.from(selectedServices).reduce((total, serviceId) => {
      const service = upsellServices.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const getSavings = () => {
    const matchingCombo = comboOffers.find(combo => 
      combo.includes.length === selectedServices.size &&
      combo.includes.every(id => selectedServices.has(id))
    );

    return matchingCombo?.savings || 0;
  };

  const handlePurchase = async () => {
    if (selectedServices.size === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: Array.from(selectedServices),
          userInfo,
          total: calculateTotal()
        })
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Take Your Restaurant to the Next Level
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get deeper insights and actionable strategies to maximize your restaurant&apos;s potential
        </p>
      </div>

      {/* Combo Offers */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Popular Bundles</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {comboOffers.map((combo) => (
            <div
              key={combo.id}
              className="bg-white rounded-lg p-6 border-2 border-orange-200 hover:border-[#F38B08] transition-colors cursor-pointer relative"
              onClick={() => handleComboSelect(combo.id)}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Save £{combo.savings}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{combo.name}</h4>
              <p className="text-gray-600 mb-4">{combo.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-[#F38B08]">£{combo.price}</span>
                  <span className="text-gray-500 line-through ml-2">£{combo.originalPrice}</span>
                </div>
                <button className="bg-[#F38B08] text-white px-4 py-2 rounded-lg hover:bg-[#E67A00] text-sm">
                  Select Bundle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Services */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Individual Services</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {upsellServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-lg p-6 border-2 transition-all cursor-pointer ${
                selectedServices.has(service.id)
                  ? 'border-[#F38B08] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleServiceToggle(service.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F38B08]">£{service.price}</div>
                  <input
                    type="checkbox"
                    checked={selectedServices.has(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="mt-2 h-4 w-4 text-[#F38B08] focus:ring-[#F38B08] border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Section */}
      {selectedServices.size > 0 && (
        <div className="bg-white rounded-lg p-6 border-2 border-orange-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Selected Services</h4>
              <p className="text-gray-600">
                {Array.from(selectedServices).map(id => 
                  upsellServices.find(s => s.id === id)?.name
                ).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#F38B08]">£{calculateTotal()}</div>
              {getSavings() > 0 && (
                <div className="text-green-600 font-medium">Save £{getSavings()}</div>
              )}
            </div>
          </div>
          
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-[#F38B08] text-white py-4 px-6 rounded-lg hover:bg-[#E67A00] focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {isProcessing ? 'Processing...' : `Purchase Selected Services - £${calculateTotal()}`}
          </button>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure payment powered by Stripe
          </div>
        </div>
      )}

      {selectedServices.size === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Select the services you&apos;re interested in to get started</p>
        </div>
      )}
    </div>
  );
}