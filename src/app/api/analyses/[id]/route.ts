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

// GET - Get a specific analysis (only if it belongs to the current user)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    const analysis = getAnalysisById(analysisId);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Check if the analysis belongs to the current user
    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only view your own analyses.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific analysis (only if it belongs to the current user)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const analysisId = resolvedParams.id;
    const analysis = getAnalysisById(analysisId);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Check if the analysis belongs to the current user
    if (analysis.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied. You can only delete your own analyses.' },
        { status: 403 }
      );
    }

    // Delete the analysis
    deleteAnalysis(analysisId);

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getAnalysisById(id: string): Analysis | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const analysesFile = path.join(process.cwd(), 'analyses.json');
    
    if (fs.existsSync(analysesFile)) {
      const allAnalyses = JSON.parse(fs.readFileSync(analysesFile, 'utf8')) as Analysis[];
      return allAnalyses.find(a => a.id === id) || null;
    }
  } catch (error) {
    console.error('Error reading analysis:', error);
  }
  
  return null;
}

function deleteAnalysis(id: string) {
  try {
    const fs = require('fs');
    const path = require('path');
    const analysesFile = path.join(process.cwd(), 'analyses.json');
    
    if (fs.existsSync(analysesFile)) {
      const allAnalyses = JSON.parse(fs.readFileSync(analysesFile, 'utf8')) as Analysis[];
      const filteredAnalyses = allAnalyses.filter(a => a.id !== id);
      fs.writeFileSync(analysesFile, JSON.stringify(filteredAnalyses, null, 2));
    }
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
}