# Gmail Email Service Setup

This application uses Gmail with Nodemailer for sending transactional emails.

## Setup Instructions

### 1. Enable 2-Factor Authentication on Gmail
1. Go to your [Google Account Settings](https://myaccount.google.com/)
2. Select "Security" from the left menu
3. Under "Signing in to Google", enable "2-Step Verification"

### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and name it "Menu Analyzer"
4. Click "Generate"
5. Copy the 16-character password (remove spaces)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. For Vercel Deployment

Add the same environment variables in Vercel:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `GMAIL_USER` = your Gmail address
   - `GMAIL_APP_PASSWORD` = your 16-character app password
   - `NEXT_PUBLIC_APP_URL` = https://menu-analyser.vercel.app

5. Redeploy your application

## Important Security Notes

⚠️ **Never commit your Gmail credentials to Git**
⚠️ **Use App Password, not your regular Gmail password**
⚠️ **Keep your app password secure**

## Gmail Limits

- Gmail has a limit of 500 emails per day for free accounts
- 2000 emails per day for Google Workspace accounts
- Rate limit: ~20 emails per second

## Testing

After setup, test the email functionality:

1. Sign up for a new account (tests welcome email)
2. Request a password reset (tests reset email)

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password, not your regular password
- Check that 2-Factor Authentication is enabled
- Verify the email address is correct

### "Connection timeout" error
- Check your internet connection
- Verify Gmail is not blocking the connection
- Try enabling "Less secure app access" (not recommended for production)

### Emails not being received
- Check spam/junk folder
- Verify the recipient email is correct
- Check Gmail's sent folder to confirm email was sent

## Alternative: Use Without Email (Development)

If you want to develop without email functionality:
- The app will still work
- Console logs will show where emails would be sent
- User registration and password reset will function (without actual emails)