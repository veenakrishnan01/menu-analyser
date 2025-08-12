import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface AnalysisResult {
  revenue_score: number;
  quick_wins: string[];
  visual_appeal: string[];
  strategic_pricing: string[];
  menu_design: string[];
  summary: string;
}

async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  // For now, we'll just convert to base64 and send to Gemini for OCR
  const base64Image = imageBuffer.toString('base64');
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is required');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = 'Extract all text from this menu image. Return only the text content, formatted as it appears on the menu:';
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    }
  ]);
  
  const response = await result.response;
  return response.text();
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Convert PDF to base64 and use Gemini to extract text
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is required');
  }

  try {
    // Try pdf-parse first (works on Vercel)
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(pdfBuffer);
    return data.text;
  } catch {
    // Fallback: Use Gemini's vision API to extract text from PDF as image
    console.log('Using Gemini for PDF text extraction');
    const base64Pdf = pdfBuffer.toString('base64');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = 'Extract all text from this PDF document. Return only the text content, formatted as it appears:';
    
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf
          }
        }
      ]);
      
      const response = await result.response;
      return response.text();
    } catch (geminiError) {
      console.error('Gemini PDF processing error:', geminiError);
      throw new Error('Failed to parse PDF. Please try uploading as an image instead.');
    }
  }
}

async function scrapeMenuFromUrl(url: string): Promise<string> {
  try {
    // Simple fetch to get HTML content
    const response = await fetch(url);
    const html = await response.text();
    
    // Remove HTML tags and get text content
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (!text || text.length < 50) {
      throw new Error('Could not extract sufficient menu content from URL');
    }
    
    return text;
  } catch (error) {
    console.error('URL scraping error:', error);
    throw new Error(`Failed to fetch menu from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function analyzeMenuWithGemini(menuText: string): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
  You are a restaurant menu optimization expert. Analyze the following menu and provide detailed recommendations to increase revenue and average order value.

  Menu Content:
  ${menuText}

  Please provide a comprehensive analysis in VALID JSON format (no markdown, no code blocks, just pure JSON):
  {
    "revenue_score": (number between 0-100 based on current menu optimization level),
    "summary": "(2-3 sentence executive summary of the menu's revenue optimization potential)",
    "quick_wins": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
    "visual_appeal": ["specific visual/design recommendation 1", "specific visual/design recommendation 2", "specific visual/design recommendation 3"],
    "strategic_pricing": ["specific pricing strategy recommendation 1", "specific pricing strategy recommendation 2", "specific pricing strategy recommendation 3"],
    "menu_design": ["specific layout/structure recommendation 1", "specific layout/structure recommendation 2", "specific layout/structure recommendation 3"]
  }

  Base your analysis on:
  - The actual items and prices in the menu
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
    // Clean the response to extract JSON
    const cleanedText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }
    
    const analysisResult = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!analysisResult.revenue_score || !analysisResult.summary || 
        !analysisResult.quick_wins || !analysisResult.visual_appeal || 
        !analysisResult.strategic_pricing || !analysisResult.menu_design) {
      throw new Error('Invalid response structure from Gemini');
    }
    
    return analysisResult;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', parseError);
    console.error('Raw response:', text);
    throw new Error('Failed to parse AI analysis. Please try again.');
  }
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
          { error: 'Unsupported file type. Please upload a PDF or image file.' },
          { status: 400 }
        );
      }
    } else {
      const { url, text } = await request.json();
      
      if (url) {
        menuText = await scrapeMenuFromUrl(url);
      } else if (text) {
        menuText = text;
      } else {
        return NextResponse.json(
          { error: 'No URL or text provided' },
          { status: 400 }
        );
      }
    }

    if (!menuText || menuText.trim().length < 10) {
      return NextResponse.json(
        { error: 'No valid menu content could be extracted' },
        { status: 400 }
      );
    }

    // Analyze with Gemini AI
    const analysisResult = await analyzeMenuWithGemini(menuText);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Menu analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze menu';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}