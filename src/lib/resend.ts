import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;

// Email sending functions
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  businessName?: string
) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Menu Analyzer</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #F38B08; font-size: 36px; margin: 0;">🍽️ Menu Analyzer</h1>
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome aboard, ${userName}!</h2>
          
          ${businessName ? `<p>We're excited to help <strong>${businessName}</strong> optimize its menu for maximum revenue!</p>` : ''}
          
          <p>You've just taken the first step towards transforming your menu into a powerful revenue-generating tool. Our AI-powered analysis will help you:</p>
          
          <div style="background-color: #FFF7ED; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p>✅ <strong>Identify Revenue Opportunities</strong> - Discover hidden potential in your menu</p>
            <p>✅ <strong>Optimize Pricing Strategy</strong> - Price your items for maximum profitability</p>
            <p>✅ <strong>Enhance Visual Appeal</strong> - Make your menu more appetizing and engaging</p>
            <p>✅ <strong>Improve Menu Design</strong> - Create layouts that drive sales</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background-color: #F38B08; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Start Your First Analysis
            </a>
          </div>

          <p><strong>Here's how to get started:</strong></p>
          <ol style="padding-left: 20px;">
            <li>Upload your menu (PDF, image, or paste text)</li>
            <li>Let our AI analyze your menu in seconds</li>
            <li>Review personalized recommendations</li>
            <li>Implement changes and watch your revenue grow!</li>
          </ol>

          <hr style="border-color: #e6ebf1; margin: 32px 0;">
          
          <p style="color: #8898aa; font-size: 14px; text-align: center;">
            If you have any questions or need assistance, feel free to reach out to our support team.<br>
            We're here to help you succeed!
          </p>
          
          <p style="color: #8898aa; font-size: 14px; text-align: center;">
            Best regards,<br>
            <strong>The Menu Analyzer Team</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Menu Analyzer <onboarding@resend.dev>',
      to,
      subject: 'Welcome to Menu Analyzer - Start Optimizing Your Menu Today!',
      html: htmlContent,
      text: `Welcome to Menu Analyzer, ${userName}!

${businessName ? `We're excited to help ${businessName} optimize its menu for maximum revenue!` : ''}

Our AI-powered analysis will help you:
• Identify Revenue Opportunities
• Optimize Pricing Strategy  
• Enhance Visual Appeal
• Improve Menu Design

Get started:
1. Upload your menu (PDF, image, or paste text)
2. Let our AI analyze your menu in seconds
3. Review personalized recommendations
4. Implement changes and watch your revenue grow!

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

Best regards,
The Menu Analyzer Team`,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetToken: string
) {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Use simple HTML instead of React component for now
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #F38B08;">🍽️ Menu Analyzer</h1>
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #F38B08; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link: ${resetLink}</p>
          <div style="background-color: #FFF7ED; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400E;"><strong>⚠️ This link expires in 1 hour.</strong></p>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">Best regards,<br>The Menu Analyzer Team</p>
        </div>
      </body>
      </html>
    `;
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Menu Analyzer <onboarding@resend.dev>',
      to,
      subject: 'Reset Your Menu Analyzer Password',
      html: htmlContent,
      text: `Hi ${userName}, 

We received a request to reset your password for Menu Analyzer. 

Click this link to reset: ${resetLink}

This link expires in 1 hour. If you didn't request this, ignore this email.

Best regards,
The Menu Analyzer Team`,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}