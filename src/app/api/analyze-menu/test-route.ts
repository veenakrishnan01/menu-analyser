import { NextRequest, NextResponse } from 'next/server';

interface AnalysisResult {
  revenue_score: number;
  quick_wins: string[];
  visual_appeal: string[];
  strategic_pricing: string[];
  menu_design: string[];
  summary: string;
}

function generateMockAnalysis(menuText: string): AnalysisResult {
  const wordCount = menuText.split(' ').length;
  const hasPrice = /\$\d+|\d+\.\d{2}/.test(menuText);
  const hasDescriptions = menuText.length > 500;
  
  const score = Math.min(100, 40 + (hasPrice ? 20 : 0) + (hasDescriptions ? 20 : 0) + Math.min(20, wordCount / 10));
  
  return {
    revenue_score: Math.round(score),
    summary: "This is a mock analysis for testing purposes. Your menu shows potential for optimization with strategic improvements to pricing display and item descriptions.",
    quick_wins: [
      "Add descriptive language to highlight premium ingredients",
      "Include calorie counts to appeal to health-conscious diners",
      "Feature 'Chef's Special' or 'Most Popular' badges on high-margin items"
    ],
    visual_appeal: [
      "Use high-quality food photography for key dishes",
      "Implement a clear visual hierarchy with section headers",
      "Add white space between sections for better readability"
    ],
    strategic_pricing: [
      "Implement charm pricing (e.g., $9.99 instead of $10)",
      "Remove dollar signs from prices to reduce price sensitivity",
      "Position high-margin items at the beginning and end of sections"
    ],
    menu_design: [
      "Group items by profit margin rather than just category",
      "Limit each section to 7 items to avoid choice paralysis",
      "Use boxes or borders to highlight signature dishes"
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let menuText = 'Sample menu content for testing';

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (file) {
        menuText = `Uploaded file: ${file.name} (${file.size} bytes)`;
      }
    } else if (contentType?.includes('application/json')) {
      const body = await request.json();
      if (body.url) {
        menuText = `Menu from URL: ${body.url}`;
      } else if (body.text) {
        menuText = body.text;
      }
    }

    // Generate mock analysis
    const analysisResult = generateMockAnalysis(menuText);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Test analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze menu in test mode' },
      { status: 500 }
    );
  }
}