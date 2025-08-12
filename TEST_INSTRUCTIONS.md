# Testing Instructions

## Fix for "Failed to add lead to CRM" Error

The error has been fixed. The application now:

1. **Works without GoHighLevel API keys** - The CRM integration gracefully falls back to test mode
2. **Saves leads locally** - Leads are saved to `leads-backup.json` file for development
3. **Doesn't block user flow** - Even if CRM fails, users can continue using the app

## To test the application:

1. **Restart the development server** (important!):
   ```bash
   # Press Ctrl+C to stop the current server
   npm run dev
   ```

2. **Clear your browser cache** or open in incognito mode

3. **Test the form**:
   - Go to http://localhost:3000
   - Fill in the name/email form
   - Check the browser console for "Lead successfully captured" message
   - The form should proceed to the upload step without errors

## What's happening now:

- **Without GoHighLevel**: Leads are saved locally and logged to console
- **With GoHighLevel**: Leads are sent to CRM and saved locally as backup
- **No more error popups**: The user experience is smooth regardless of CRM status

## To see captured leads:

Check the `leads-backup.json` file in your project root directory after submitting the form.

## Optional: Add your Anthropic API key

To enable menu analysis, add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE
```

Then restart the server.