import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface Analysis {
  id: string;
  user_id: string;
  business_name?: string;
  menu_source: 'file' | 'url' | 'text';
  menu_url?: string;
  revenue_score: number;
  analysis_results: {
    revenue_score: number;
    quick_wins: string[];
    visual_appeal: string[];
    strategic_pricing: string[];
    menu_design: string[];
    summary: string;
  };
  created_at: string;
}

// GET - Get all analyses for the current user
export async function GET(request: NextRequest) {
  try {
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

    // Get user's analyses
    const analyses = getUserAnalyses(user.id);

    return NextResponse.json({
      success: true,
      analyses
    });

  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new analysis
export async function POST(request: NextRequest) {
  try {
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

    const { 
      business_name, 
      menu_source, 
      menu_url, 
      analysis_results 
    } = await request.json();

    if (!analysis_results || !analysis_results.revenue_score) {
      return NextResponse.json(
        { error: 'Invalid analysis data' },
        { status: 400 }
      );
    }

    // Create new analysis
    const newAnalysis: Analysis = {
      id: generateAnalysisId(),
      user_id: user.id,
      business_name,
      menu_source,
      menu_url,
      revenue_score: analysis_results.revenue_score,
      analysis_results,
      created_at: new Date().toISOString()
    };

    // Save analysis
    saveAnalysis(newAnalysis);

    return NextResponse.json({
      success: true,
      analysis: newAnalysis
    });

  } catch (error) {
    console.error('Error saving analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAnalysisId(): string {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2);
}

function getUserAnalyses(userId: string): Analysis[] {
  try {
    const fs = require('fs');
    const path = require('path');
    const analysesFile = path.join(process.cwd(), 'analyses.json');
    
    if (fs.existsSync(analysesFile)) {
      const allAnalyses = JSON.parse(fs.readFileSync(analysesFile, 'utf8')) as Analysis[];
      return allAnalyses.filter(a => a.user_id === userId).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  } catch (error) {
    console.error('Error reading analyses:', error);
  }
  
  return [];
}

function saveAnalysis(analysis: Analysis) {
  try {
    const fs = require('fs');
    const path = require('path');
    const analysesFile = path.join(process.cwd(), 'analyses.json');
    
    let allAnalyses: Analysis[] = [];
    
    if (fs.existsSync(analysesFile)) {
      allAnalyses = JSON.parse(fs.readFileSync(analysesFile, 'utf8'));
    }
    
    allAnalyses.push(analysis);
    fs.writeFileSync(analysesFile, JSON.stringify(allAnalyses, null, 2));
    
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
}