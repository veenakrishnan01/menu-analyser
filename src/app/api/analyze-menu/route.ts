import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface AnalysisResult {
  revenue_score: number;
  quick_wins: string[];
  visual_appeal: string[];
  strategic_pricing: string[];
  menu_design: string[];
  summary: string;
}

async function extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<string> {
  // Convert to base64 and send to Gemini for OCR
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is required');
  }

  console.log('Processing image, buffer size:', imageBuffer.length, 'MIME type:', mimeType);

  // Check if buffer is valid
  if (imageBuffer.length === 0) {
    throw new Error('Image file is empty or corrupted');
  }

  const base64Image = imageBuffer.toString('base64');

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = 'Extract all text from this menu image, including menu items, prices, and descriptions. Return only the text content, formatted as it appears on the menu:';

  try {
    console.log('Sending image to Gemini for OCR processing...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const extractedText = response.text();

    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error('No readable text found in image. Please ensure the image is clear and contains text.');
    }

    console.log('Successfully extracted text from image, length:', extractedText.length);
    return extractedText;
  } catch (geminiError: unknown) {
    console.error('Gemini image processing error:', geminiError);

    // More specific error messages
    const error = geminiError as Error;
    if (error?.message?.includes('quota')) {
      throw new Error('AI service quota exceeded. Please try again later.');
    } else if (error?.message?.includes('invalid')) {
      throw new Error('Image format not supported. Please try PNG or JPEG format.');
    } else {
      throw new Error('Failed to process image. Please ensure the image is clear and try again.');
    }
  }
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // Use Gemini's vision API to extract text from PDF
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is required');
  }

  console.log('Using Gemini for PDF text extraction, buffer size:', pdfBuffer.length);

  // Check if buffer is valid
  if (pdfBuffer.length === 0) {
    throw new Error('PDF file is empty or corrupted');
  }

  // Check PDF header
  const pdfHeader = pdfBuffer.slice(0, 4).toString();
  console.log('PDF header check:', pdfHeader);
  if (pdfHeader !== '%PDF') {
    throw new Error('Invalid PDF file format');
  }

  // Check file size limit (Gemini has a ~20MB limit for files)
  if (pdfBuffer.length > 15 * 1024 * 1024) {
    throw new Error('PDF file too large. Please upload a file smaller than 15MB.');
  }

  const base64Pdf = pdfBuffer.toString('base64');
  console.log('Base64 PDF length:', base64Pdf.length);

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = 'Extract all text from this PDF document, including menu items, prices, and descriptions. Return only the text content, formatted as it appears on the menu:';

  try {
    console.log('Sending PDF to Gemini for processing...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Pdf
        }
      }
    ]);

    console.log('Gemini processing completed, getting response...');
    const response = await result.response;
    const extractedText = response.text();

    console.log('Extracted text preview:', extractedText.substring(0, 200));

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error('No readable text found in PDF. The PDF might be an image-based document.');
    }

    console.log('Successfully extracted text from PDF, length:', extractedText.length);
    return extractedText;
  } catch (geminiError: unknown) {
    const error = geminiError as Error;
    console.error('Gemini PDF processing error details:', {
      message: error?.message,
      status: (error as unknown as Record<string, unknown>)?.status,
      code: (error as unknown as Record<string, unknown>)?.code,
      cause: (geminiError as Error)?.cause,
      stack: (geminiError as Error)?.stack
    });

    // More specific error messages based on actual error patterns
    if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
      throw new Error('AI service quota exceeded. Please try again later.');
    } else if (error?.message?.includes('unsupported') || error?.message?.includes('invalid')) {
      throw new Error('PDF format not supported. Please try uploading as an image (PNG/JPEG).');
    } else if (error?.message?.includes('size') || error?.message?.includes('large')) {
      throw new Error('PDF file too large. Please try uploading as an image (PNG/JPEG) or reduce file size.');
    } else if ((geminiError as unknown as Record<string, unknown>)?.status === 400) {
      throw new Error('Invalid PDF format. Please try uploading as an image (PNG/JPEG).');
    } else if ((geminiError as unknown as Record<string, unknown>)?.status === 429) {
      throw new Error('API rate limit exceeded. Please try again in a moment.');
    } else {
      throw new Error(`Failed to process PDF: ${error?.message || 'Unknown error'}. Please try uploading as an image (PNG/JPEG) instead.`);
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
  You are a restaurant menu optimization expert. First, CAREFULLY examine if the provided content is actually a restaurant menu with real food items and prices.

  CRITICAL VALIDATION: Check for these RED FLAGS that indicate non-menu content:
  - Sample/dummy text (lorem ipsum, placeholder text, test content)
  - Repetitive or meaningless content
  - Legal documents, manuals, or reports
  - Content without food items and prices
  - Generic text samples or demonstration content

  IMPORTANT: If the content is NOT a legitimate restaurant menu, you MUST return this exact JSON:
  {
    "revenue_score": 0,
    "summary": "This document does not contain a valid restaurant menu. Please upload an actual menu with real food items and prices.",
    "quick_wins": ["Upload a real restaurant menu with food items and prices"],
    "visual_appeal": ["Cannot analyze - no menu content detected"],
    "strategic_pricing": ["Cannot analyze - no pricing information found"],
    "menu_design": ["Cannot analyze - no menu structure detected"]
  }

  Menu Content to Analyze:
  ${menuText}

  STRICT VALIDATION CRITERIA - The content MUST have ALL of these:
  - Real food/beverage items with descriptive names
  - Clear prices in currency format
  - Restaurant/food service context
  - At least 3-5 different menu items
  - Meaningful food descriptions (not placeholder text)
  - Realistic menu structure and organization

  REJECT if content contains:
  - Dummy text or sample content
  - Repetitive meaningless text
  - No clear food items or prices
  - Generic placeholder content
  - Non-food related documents

  If the content passes ALL validation checks as a legitimate restaurant menu, provide comprehensive analysis in VALID JSON format:
  {
    "revenue_score": (number between 1-100 based on current menu optimization level - never 0 for real menus),
    "summary": "(2-3 sentence executive summary of the menu's revenue optimization potential)",
    "quick_wins": ["specific actionable recommendation 1", "specific actionable recommendation 2", "specific actionable recommendation 3"],
    "visual_appeal": ["specific visual/design recommendation 1", "specific visual/design recommendation 2", "specific visual/design recommendation 3"],
    "strategic_pricing": ["specific pricing strategy recommendation 1", "specific pricing strategy recommendation 2", "specific pricing strategy recommendation 3"],
    "menu_design": ["specific layout/structure recommendation 1", "specific layout/structure recommendation 2", "specific layout/structure recommendation 3"]
  }

  Base your analysis on:
  - The actual food items and prices in the menu
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
    // Check authentication
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from session
    global.sessions = global.sessions || {};
    const user = global.sessions[sessionToken];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type');
    let menuText = '';
    let menuSource: 'file' | 'url' | 'text' = 'text';
    let fileType: string | undefined;
    let menuUrl: string | undefined;
    let businessName: string | undefined;

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;
      fileType = type;
      businessName = formData.get('businessName') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Please upload a file smaller than 10MB.' },
          { status: 400 }
        );
      }

      console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

      const buffer = Buffer.from(await file.arrayBuffer());
      menuSource = 'file';

      try {
        if (type === 'pdf') {
          console.log('Attempting PDF extraction...');
          menuText = await extractTextFromPDF(buffer);
        } else if (type === 'image') {
          console.log('Attempting image extraction...');
          menuText = await extractTextFromImage(buffer, file.type);
        } else {
          return NextResponse.json(
            { error: 'Unsupported file type. Please upload a PDF or image file.' },
            { status: 400 }
          );
        }
        console.log('Text extraction successful, length:', menuText.length);
      } catch (extractionError: unknown) {
        console.error('File extraction error:', extractionError);
        const error = extractionError as Error;
        return NextResponse.json(
          { error: error?.message || 'Failed to extract text from file' },
          { status: 400 }
        );
      }
    } else {
      const { url, text, businessName: reqBusinessName } = await request.json();
      businessName = reqBusinessName;
      
      if (url) {
        menuText = await scrapeMenuFromUrl(url);
        menuSource = 'url';
        menuUrl = url;
      } else if (text) {
        menuText = text;
        menuSource = 'text';
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

    // Enhanced content validation - check if it looks like a menu
    // Be very lenient with images since OCR might not extract text perfectly
    const isImageFile = fileType === 'image';

    console.log('Content validation - File type:', fileType, 'Text length:', menuText.length);
    console.log('Extracted text preview:', menuText.substring(0, 200));

    // For images, only do minimal validation
    if (isImageFile) {
      const menuText_lower = menuText.toLowerCase();

      if (menuText.trim().length < 10) {
        return NextResponse.json(
          { error: 'Could not extract readable text from the image. Please ensure the image is clear and contains visible text.' },
          { status: 400 }
        );
      }

      // Check if it's a legitimate menu even if it has lorem ipsum descriptions
      const hasMenuItems = menuText_lower.includes('menu') ||
                          menuText_lower.includes('restaurant') ||
                          menuText_lower.includes('biryani') ||
                          menuText_lower.includes('chicken') ||
                          menuText_lower.includes('curry') ||
                          menuText_lower.includes('rice') ||
                          menuText_lower.includes('pizza') ||
                          menuText_lower.includes('burger') ||
                          menuText_lower.includes('salad');

      const hasPrices = /\$\d+\.?\d*/.test(menuText) ||
                       /£\d+\.?\d*/.test(menuText) ||
                       /€\d+\.?\d*/.test(menuText) ||
                       /\d+\.?\d*\s*\$/.test(menuText);

      // Only block if it's clearly not a menu (no menu items AND no prices)
      if (!hasMenuItems && !hasPrices) {
        // Check for pure dummy content (no real menu structure)
        const isPureDummyContent = (menuText_lower.includes('lorem ipsum') ||
                                   menuText_lower.includes('sample text') ||
                                   menuText_lower.includes('dummy text') ||
                                   menuText_lower.includes('test document')) &&
                                   !menuText_lower.includes('biryani') &&
                                   !menuText_lower.includes('chicken') &&
                                   !menuText_lower.includes('curry') &&
                                   !menuText_lower.includes('rice') &&
                                   !hasPrices;

        if (isPureDummyContent) {
          return NextResponse.json(
            { error: 'This appears to be sample or placeholder content. Please upload an actual restaurant menu with food items and prices.' },
            { status: 400 }
          );
        }
      }

      // Allow images through if they have menu structure, even with lorem ipsum descriptions
      console.log('Image file passed validation, proceeding to analysis');
    } else {
      // Apply stricter validation for PDFs
      const menuText_lower = menuText.toLowerCase();

      // Menu-related keywords that should be present
      const menuKeywords = [
        'menu', 'price', '$', '£', '€', '¥', 'food', 'drink', 'restaurant',
        'appetizer', 'main', 'dessert', 'beverage', 'coffee', 'tea', 'pizza',
        'burger', 'salad', 'soup', 'pasta', 'chicken', 'beef', 'fish', 'starter',
        'entree', 'wine', 'beer', 'dish', 'special', 'served', 'grilled', 'fried'
      ];

      // Common dummy/sample content patterns
      const dummyPatterns = [
        'lorem ipsum', 'dolor sit amet', 'consectetur adipiscing',
        'sample text', 'dummy text', 'placeholder text', 'test document',
        'example text', 'sample document', 'this is a test', 'sample pdf',
        'dummy pdf', 'test pdf', 'example pdf', 'sample content',
        'demonstration', 'demo text', 'sample file', 'test file',
        'quick brown fox', 'jumps over', 'lazy dog', 'the five boxing',
        'pack my box', 'sphinx of black', 'wizard of oz'
      ];

      // Document type indicators (non-menu documents)
      const nonMenuIndicators = [
        'privacy policy', 'terms of service', 'user agreement', 'license agreement',
        'copyright notice', 'legal document', 'contract', 'invoice', 'receipt',
        'manual', 'instruction', 'tutorial', 'guide', 'specification',
        'report', 'analysis', 'research', 'study', 'article', 'news',
        'blog post', 'chapter', 'section', 'page number', 'table of contents'
      ];

      const hasMenuKeywords = menuKeywords.some(keyword => menuText_lower.includes(keyword));
      const hasDummyContent = dummyPatterns.some(pattern => menuText_lower.includes(pattern));
      const hasNonMenuContent = nonMenuIndicators.some(indicator => menuText_lower.includes(indicator));

      // Check for repetitive or meaningless content
      const words = menuText_lower.split(/\s+/);
      const uniqueWords = new Set(words);
      const repetitiveContent = words.length > 50 && (uniqueWords.size / words.length) < 0.2;

      // Check for very short content or content with no numbers (prices)
      const hasNumbers = /\d/.test(menuText);
      const tooShort = menuText.trim().length < 100;

      let errorMessage = '';

      if (hasDummyContent) {
        errorMessage = 'This appears to be sample or placeholder content. Please upload an actual restaurant menu with food items and prices.';
      } else if (hasNonMenuContent) {
        errorMessage = 'This document does not appear to be a restaurant menu. Please upload a menu with food items and prices.';
      } else if (repetitiveContent) {
        errorMessage = 'This document contains repetitive or dummy content. Please upload a real restaurant menu.';
      } else if (tooShort) {
        errorMessage = 'The document content is too short to be a complete menu. Please upload a full menu with multiple items.';
      } else if (!hasNumbers && menuText.length < 500) {
        errorMessage = 'No prices found in the document. Please upload a menu that includes food items with prices.';
      } else if (!hasMenuKeywords && menuText.length < 200) {
        errorMessage = 'This document does not contain menu-related content. Please upload a restaurant menu with food items and prices.';
      }

      if (errorMessage) {
        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        );
      }
    }

    // Analyze with Gemini AI
    const analysisResult = await analyzeMenuWithGemini(menuText);

    // Save the analysis to user's history
    try {
      await saveAnalysisToHistory(user.id as string, {
        business_name: businessName,
        menu_source: menuSource,
        menu_url: menuUrl,
        analysis_results: analysisResult
      });
    } catch (saveError) {
      console.error('Error saving analysis:', saveError);
      // Don't fail the request if saving fails
    }

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

// Helper function to save analysis to user's history
async function saveAnalysisToHistory(userId: string, data: {
  business_name?: string;
  menu_source: 'file' | 'url' | 'text';
  menu_url?: string;
  analysis_results: AnalysisResult;
}) {
  try {
    const analysesFile = path.join(process.cwd(), 'analyses.json');
    
    const analysis = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2),
      user_id: userId,
      business_name: data.business_name,
      menu_source: data.menu_source,
      menu_url: data.menu_url,
      revenue_score: data.analysis_results.revenue_score,
      analysis_results: data.analysis_results,
      created_at: new Date().toISOString()
    };
    
    let allAnalyses = [];
    
    if (fs.existsSync(analysesFile)) {
      allAnalyses = JSON.parse(fs.readFileSync(analysesFile, 'utf8'));
    }
    
    allAnalyses.push(analysis);
    fs.writeFileSync(analysesFile, JSON.stringify(allAnalyses, null, 2));
    
  } catch (error) {
    console.error('Error saving analysis to history:', error);
    throw error;
  }
}