import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

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

export async function POST(request: NextRequest) {
  try {
    const { result, userInfo }: { result: AnalysisResult; userInfo: UserInfo } = await request.json();

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Menu Analysis Report', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prepared for: ${userInfo.businessName || userInfo.name}`, margin, yPosition);
    yPosition += 10;

    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;

    // Revenue Score Box
    doc.setFillColor(240, 248, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue Score', margin + 10, yPosition + 8);
    
    doc.setFontSize(24);
    const scoreColor = result.revenue_score >= 80 ? [34, 197, 94] : 
                      result.revenue_score >= 60 ? [234, 179, 8] : [239, 68, 68];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${result.revenue_score}/100`, pageWidth - margin - 30, yPosition + 12);
    doc.setTextColor(0, 0, 0);
    
    yPosition += 35;

    // Executive Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(result.summary, margin, yPosition, pageWidth - 2 * margin, 12);
    yPosition += 15;

    // Check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Quick Wins Section
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(220, 252, 231);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
    doc.text('Quick Wins - Immediate Impact', margin + 5, yPosition + 5);
    yPosition += 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    result.quick_wins.forEach((item, index) => {
      checkNewPage(20);
      doc.text(`${index + 1}.`, margin, yPosition);
      yPosition = addWrappedText(item, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12);
      yPosition += 5;
    });
    yPosition += 10;

    // Visual Appeal Section
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(219, 234, 254);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
    doc.text('Visual Appeal - Design & Presentation', margin + 5, yPosition + 5);
    yPosition += 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    result.visual_appeal.forEach((item, index) => {
      checkNewPage(20);
      doc.text(`${index + 1}.`, margin, yPosition);
      yPosition = addWrappedText(item, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12);
      yPosition += 5;
    });
    yPosition += 10;

    // Strategic Pricing Section
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(243, 232, 255);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
    doc.text('Strategic Pricing - Revenue Optimization', margin + 5, yPosition + 5);
    yPosition += 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    result.strategic_pricing.forEach((item, index) => {
      checkNewPage(20);
      doc.text(`${index + 1}.`, margin, yPosition);
      yPosition = addWrappedText(item, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12);
      yPosition += 5;
    });
    yPosition += 10;

    // Menu Design Section
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(255, 237, 213);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
    doc.text('Menu Design - Layout & Structure', margin + 5, yPosition + 5);
    yPosition += 20;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    result.menu_design.forEach((item, index) => {
      checkNewPage(20);
      doc.text(`${index + 1}.`, margin, yPosition);
      yPosition = addWrappedText(item, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12);
      yPosition += 5;
    });

    // Footer
    doc.addPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('This report was generated by Menu Analyzer AI', margin, margin);
    doc.text('For more advanced analysis and consulting, visit our website', margin, margin + 10);
    doc.text(`Report generated for: ${userInfo.email}`, margin, margin + 20);

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="menu-analysis-${userInfo.businessName || 'report'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}