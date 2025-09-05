import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    console.log('=== Email Debug Information ===');
    console.log('GMAIL_USER:', process.env.GMAIL_USER);
    console.log('GMAIL_APP_PASSWORD set:', !!process.env.GMAIL_APP_PASSWORD);
    console.log('GMAIL_APP_PASSWORD length:', process.env.GMAIL_APP_PASSWORD?.length || 0);
    
    // Test Gmail connection
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Verify connection
    try {
      const verified = await transporter.verify();
      console.log('Gmail connection verified:', verified);
      
      return NextResponse.json({
        success: true,
        config: {
          gmailUser: process.env.GMAIL_USER,
          gmailPasswordSet: !!process.env.GMAIL_APP_PASSWORD,
          passwordLength: process.env.GMAIL_APP_PASSWORD?.length || 0,
          connectionVerified: verified
        }
      });
    } catch (verifyError) {
      console.error('Gmail verification failed:', verifyError);
      return NextResponse.json({
        success: false,
        error: 'Gmail verification failed',
        details: verifyError,
        config: {
          gmailUser: process.env.GMAIL_USER,
          gmailPasswordSet: !!process.env.GMAIL_APP_PASSWORD,
          passwordLength: process.env.GMAIL_APP_PASSWORD?.length || 0
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Debug email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error
    }, { status: 500 });
  }
}