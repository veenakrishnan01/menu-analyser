"use client";

import { useState } from "react";

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

interface AnalysisResultsProps {
  result: AnalysisResult;
  userInfo: UserInfo;
  onNewAnalysis: () => void;
  analysisId?: string | null;
}

export function AnalysisResults({
  result,
  userInfo,
  onNewAnalysis,
}: AnalysisResultsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick-wins" | "all">(
    "quick-wins"
  );

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, userInfo }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `menu-analysis-${userInfo.businessName || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  // test

  const getScoreBg = (score: number) => {
    if (score >= 80)
      return "bg-gradient-to-br from-green-50 to-green-100 border-green-200";
    if (score >= 60)
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200";
    return "bg-gradient-to-br from-red-50 to-red-100 border-red-200";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Excellent! Your menu is well-optimized";
    if (score >= 60) return "Good foundation with room for improvement";
    return "Significant opportunities for revenue growth";
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Score */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#F38B08] to-orange-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Menu Analysis Complete!
              </h2>
              <p className="text-orange-100 text-lg">
                {userInfo.businessName || userInfo.name}
              </p>
            </div>
            <div
              className={`bg-white rounded-xl p-6 text-center border-2 ${getScoreBg(result.revenue_score)}`}
            >
              <div
                className={`text-5xl font-bold ${getScoreColor(result.revenue_score)}`}
              >
                {result.revenue_score}
              </div>
              <div className="text-sm font-medium text-gray-600 mt-1">
                Revenue Score
              </div>
              <div className="text-xs text-gray-500 mt-2 max-w-[120px]">
                {getScoreMessage(result.revenue_score)}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center mb-3">
            <svg
              className="w-5 h-5 text-[#F38B08] mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Executive Summary
            </h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("quick-wins")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "quick-wins"
                  ? "bg-[#F38B08] text-white border-b-2 border-[#F38B08]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5 inline mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              Quick Wins (Start Here!)
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-[#F38B08] text-white border-b-2 border-[#F38B08]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg
                className="w-5 h-5 inline mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H4a2 2 0 01-2-2V5z"
                  clipRule="evenodd"
                />
              </svg>
              All Recommendations
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "quick-wins" ? (
            <div>
              {/* Quick Wins Highlighted Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white rounded-full p-2 mr-3">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Quick Wins - Immediate Impact
                    </h3>
                    <p className="text-gray-600">
                      Implement these changes first for the fastest revenue
                      boost
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.quick_wins.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border border-green-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 mr-3 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{item}</p>
                          <div className="mt-2 flex items-center text-xs text-green-600">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Can be implemented immediately
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <p className="text-gray-700 text-center">
                  <span className="font-semibold">Pro Tip:</span> Start with
                  Quick Win #1 and work your way down. Most restaurants see
                  results within 2 weeks!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* All Recommendations */}

              {/* Quick Wins */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                    Priority 1
                  </span>
                  Quick Wins - Immediate Impact
                </h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <ul className="space-y-3">
                    {result.quick_wins.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Visual Appeal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                    Design
                  </span>
                  Visual Appeal & Presentation
                </h3>
                <ul className="space-y-3">
                  {result.visual_appeal.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-white rounded-lg p-3 border border-gray-200 hover:border-orange-200 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-[#F38B08] mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategic Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                    Pricing
                  </span>
                  Strategic Pricing & Revenue
                </h3>
                <ul className="space-y-3">
                  {result.strategic_pricing.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-200 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Menu Design */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                    Layout
                  </span>
                  Menu Structure & Organization
                </h3>
                <ul className="space-y-3">
                  {result.menu_design.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-200 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex-1 bg-[#F38B08] text-white py-3 px-6 rounded-lg hover:bg-[#E67A00] focus:outline-none focus:ring-2 focus:ring-[#F38B08] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {isGeneratingPDF
              ? "Generating PDF..."
              : "Download Full Report (PDF)"}
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Analyze Another Menu
          </button>
        </div>
      </div>
    </div>
  );
}
