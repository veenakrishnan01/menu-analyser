# Email Service Setup Guide

This application uses **Resend** for sending transactional emails (welcome emails and password reset emails).

## Quick Setup

### 1. Sign up for Resend
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key
1. After signing in, go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Menu Analyzer")
4. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Add your Resend API key:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here

# For development, use the default Resend email
RESEND_FROM_EMAIL=Menu Analyzer <onboarding@resend.dev>

# Your app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test the Setup
1. Start the development server: `npm run dev`
2. Sign up for a new account
3. Check your email for the welcome message
4. Test password reset from the login page

## Email Templates

The application includes two beautiful email templates:

### Welcome Email
- Sent automatically when a user signs up
- Includes personalized greeting with user's name
- Shows business name if provided
- Lists key features and benefits
- Call-to-action button to start first analysis

### Password Reset Email
- Sent when user requests password reset
- Secure token-based reset link
- 1-hour expiration for security
- Clear instructions and security tips
- Fallback plain text version

## Production Setup

### 1. Verify Your Domain
For production, you should verify your own domain:

1. Go to [Domains](https://resend.com/domains) in Resend
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually takes a few minutes)

### 2. Update Environment Variables
```env
# Use your verified domain email
RESEND_FROM_EMAIL=Menu Analyzer <noreply@yourdomain.com>

# Update to your production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Free Tier Limits
Resend's free tier includes:
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ Custom domain support
- ✅ Webhooks and analytics

## Troubleshooting

### Emails Not Sending
1. Check your API key is correct in `.env.local`
2. Ensure you're using the correct FROM email address
3. Check Resend dashboard for any errors
4. Look at console logs for error messages

### Development Testing
- Use `onboarding@resend.dev` as the FROM address for development
- This works without domain verification
- Emails are actually sent (not just logged)

### Rate Limiting
- Resend automatically handles rate limiting
- Failed emails will be retried automatically
- Check the Resend dashboard for delivery status

## Alternative Email Services

If you prefer a different email service, you can easily switch:

### SendGrid
1. Install: `npm install @sendgrid/mail`
2. Update `/src/lib/resend.ts` to use SendGrid API
3. Similar free tier (100 emails/day)

### AWS SES
1. Install: `npm install @aws-sdk/client-ses`
2. More complex setup but very cost-effective
3. $0.10 per 1000 emails

### Nodemailer + Gmail
1. Already installed: `nodemailer`
2. Good for development only
3. Not recommended for production

## Security Best Practices

1. **Never commit API keys** - Always use environment variables
2. **Use verified domains** in production
3. **Implement rate limiting** for password reset requests
4. **Set short expiration times** for reset tokens (currently 1 hour)
5. **Don't reveal user existence** in password reset responses
6. **Use HTTPS** in production for all links

## Support

- Resend Documentation: [https://resend.com/docs](https://resend.com/docs)
- Resend Status: [https://status.resend.com](https://status.resend.com)
- GitHub Issues: Report any issues with the implementation