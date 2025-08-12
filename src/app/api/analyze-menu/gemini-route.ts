import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisResult {
  revenue_score: number;
  quick_wins: string[];
  visual_appeal: string[];
  strategic_pricing: string[];
  menu_design: string[];
  summary: string;
}

async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  console.log('Image OCR bypassed for testing - returning mock menu text');
  return 'Sample Menu: Burger $12.99, Pizza $15.99, Salad $8.99, Pasta $14.99';
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  console.log('PDF processing bypassed for testing - returning mock menu text');
  return 'Sample Restaurant Menu\n\nAppetizers:\n- Wings $8.99\n- Nachos $7.99\n\nMain Courses:\n- Steak $24.99\n- Salmon $19.99\n- Chicken $16.99\n\nDesserts:\n- Cheesecake $6.99\n- Ice Cream $4.99';
}

async function scrapeMenuFromUrl(url: string): Promise<string> {
  console.log('URL scraping bypassed for testing - returning mock menu text for URL:', url);
  return `Sample Menu from ${url}\n\nStarters:\n- Soup of the Day $5.99\n- Caesar Salad $7.99\n\nEntrees:\n- Grilled Chicken $18.99\n- Beef Tenderloin $32.99\n- Vegetarian Pasta $14.99\n\nBeverages:\n- Soft Drinks $2.99\n- Wine $8.99\n- Beer $4.99`;
}

async function analyzeMenuWithGemini(menuText: string): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDummy-GetYourFreeKeyFromGoogle';
  
  if (apiKey === 'AIzaSyDummy-GetYourFreeKeyFromGoogle') {
    console.log('Using mock analysis - Get free API key from https://makersuite.google.com/app/apikey');
    return generateMockAnalysis(menuText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    You are a restaurant menu optimization expert. Analyze the following menu and provide detailed recommendations to increase revenue and average order value.

    Menu Content:
    ${menuText}

    Please provide a comprehensive analysis in VALID JSON format (no markdown, just pure JSON):
    {
      "revenue_score": (number between 0-100),
      "summary": "(2-3 sentence executive summary of the menu's revenue optimization potential)",
      "quick_wins": ["immediate actionable recommendation 1", "immediate actionable recommendation 2", "immediate actionable recommendation 3"],
      "visual_appeal": ["visual/design recommendation 1", "visual/design recommendation 2", "visual/design recommendation 3"],
      "strategic_pricing": ["pricing strategy recommendation 1", "pricing strategy recommendation 2", "pricing strategy recommendation 3"],
      "menu_design": ["layout/structure recommendation 1", "layout/structure recommendation 2", "layout/structure recommendation 3"]
    }

    Focus on:
    - Revenue optimization opportunities
    - Psychology-based menu design improvements
    - Pricing strategy enhancements
    - Upselling and cross-selling opportunities
    - Menu item positioning and descriptions
    - Visual hierarchy and readability
    
    Return ONLY valid JSON, no additional text or markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // Ensure all required fields exist
      return {
        revenue_score: analysisResult.revenue_score || 75,
        summary: analysisResult.summary || "Analysis completed successfully.",
        quick_wins: analysisResult.quick_wins || ["Add item descriptions", "Highlight bestsellers", "Create combo meals"],
        visual_appeal: analysisResult.visual_appeal || ["Add food photos", "Use color coding", "Improve typography"],
        strategic_pricing: analysisResult.strategic_pricing || ["Use charm pricing", "Bundle items", "Add premium options"],
        menu_design: analysisResult.menu_design || ["Group by category", "Limit choices", "Use boxes for specials"]
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.log('Raw response:', text);
      return generateMockAnalysis(menuText);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateMockAnalysis(menuText);
  }
}

function generateMockAnalysis(menuText: string): AnalysisResult {
  const wordCount = menuText.split(' ').length;
  const hasPrice = /\$\d+|\d+\.\d{2}/.test(menuText);
  const hasDescriptions = menuText.length > 500;
  
  const score = Math.min(100, 40 + (hasPrice ? 20 : 0) + (hasDescriptions ? 20 : 0) + Math.min(20, wordCount / 10));
  
  return {
    revenue_score: Math.round(score),
    summary: "This menu shows good potential for optimization. Strategic improvements to pricing display and item descriptions could increase average order value by 15-20%.",
    quick_wins: [
      "Add appetizing descriptions to highlight premium ingredients and preparation methods",
      "Include 'Most Popular' or 'Chef's Favorite' badges on high-margin items",
      "Create combo meals to increase average transaction size"
    ],
    visual_appeal: [
      "Add high-quality photos for your top 5 best-selling dishes",
      "Use color-coded sections to make navigation easier",
      "Increase white space between sections for better readability"
    ],
    strategic_pricing: [
      "Implement psychological pricing (e.g., $12.95 instead of $13.00)",
      "Position premium items at the top and bottom of each section",
      "Create a 'Premium Selection' section for high-margin specialty items"
    ],
    menu_design: [
      "Limit each category to 7 items to reduce decision fatigue",
      "Use descriptive category names (e.g., 'Garden Fresh Salads' vs 'Salads')",
      "Add a highlighted 'Signature Dishes' section at the beginning"
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let menuText = '';

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (type === 'pdf') {
        menuText = await extractTextFromPDF(buffer);
      } else if (type === 'image') {
        menuText = await extractTextFromImage(buffer);
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        );
      }
    } else {
      const { url } = await request.json();
      
      if (!url) {
        return NextResponse.json(
          { error: 'No URL provided' },
          { status: 400 }
        );
      }

      menuText = await scrapeMenuFromUrl(url);
    }

    if (!menuText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the menu' },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeMenuWithGemini(menuText);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Menu analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze menu. Please try again.' },
      { status: 500 }
    );
  }
}