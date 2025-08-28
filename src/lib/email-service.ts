import nodemailer from 'nodemailer';

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetToken: string
) {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
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

    const textContent = `Hi ${userName}, 

We received a request to reset your password for Menu Analyzer. 

Click this link to reset: ${resetLink}

This link expires in 1 hour. If you didn't request this, ignore this email.

Best regards,
The Menu Analyzer Team`;

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `Menu Analyzer <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Reset Your Menu Analyzer Password',
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Gmail password reset error:', error);
    return { success: false, error };
  }
}

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
          
          <p>You've just taken the first step towards transforming your menu into a powerful revenue-generating tool.</p>
          
          <div style="background-color: #FFF7ED; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p>✅ <strong>Identify Revenue Opportunities</strong><br/>
            ✅ <strong>Optimize Pricing Strategy</strong><br/>
            ✅ <strong>Enhance Visual Appeal</strong><br/>
            ✅ <strong>Improve Menu Design</strong></p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background-color: #F38B08; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Start Your First Analysis
            </a>
          </div>

          <p><strong>Get started:</strong><br/>
          1. Upload your menu<br/>
          2. Get AI analysis<br/>
          3. Review recommendations<br/>
          4. Boost your revenue!</p>

          <hr style="margin: 32px 0;">
          <p style="color: #8898aa; font-size: 14px; text-align: center;">
            Best regards,<br><strong>The Menu Analyzer Team</strong>
          </p>
        </div>
      </body>
      </html>
    `;

    const textContent = `Welcome to Menu Analyzer, ${userName}!

${businessName ? `We're excited to help ${businessName} optimize its menu for maximum revenue!` : ''}

Our AI-powered analysis will help you:
• Identify Revenue Opportunities
• Optimize Pricing Strategy  
• Enhance Visual Appeal
• Improve Menu Design

Get started:
1. Upload your menu
2. Get AI analysis
3. Review recommendations
4. Boost your revenue!

Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

Best regards,
The Menu Analyzer Team`;

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `Menu Analyzer <${process.env.GMAIL_USER}>`,
      to,
      subject: `Welcome to Menu Analyzer, ${userName}!`,
      html: htmlContent,
      text: textContent,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Gmail welcome email error:', error);
    return { success: false, error };
  }
}