# Menu Analyzer - AI-Powered Restaurant Menu Optimization

A Next.js 15 web application that provides AI-powered restaurant menu analysis to help restaurant owners optimize their menus for increased revenue and average order value (AOV).

## Features

### Core Functionality
- **Menu Input**: Accepts menus via PDF upload, image upload, or URL scraping
- **AI Analysis**: Uses Claude (Anthropic) API to analyze menu content and provide detailed recommendations
- **OCR Processing**: Tesseract.js extracts text from images
- **Web Scraping**: Cheerio and Puppeteer handle URL-based menu extraction
- **PDF Report Generation**: Creates downloadable analysis reports

### Key Features
- ✅ Name and email capture with GoHighLevel CRM integration
- ✅ 10 free analyses per user
- ✅ Categorized improvement suggestions (Quick Wins, Visual Appeal, Strategic Pricing, Menu Design)
- ✅ Revenue score calculation
- ✅ Professional PDF report generation
- ✅ Responsive UI with Tailwind CSS

### Premium Services (Upsells)
- **Cloud Kitchen Gap Analysis** (£49): Identify profitable cloud kitchen brands you could launch in your area
- **Competitor Analysis** (£49): Analyse your competitors and find gaps you could fill
- **100 Profitable Menu Items** (£39): High-margin items you could add to boost profits
- **Bundle Deals**: 
  - Complete Market Analysis (Cloud Kitchen + Competitor) - £79 (Save £19)
  - Ultimate Restaurant Growth Package (All services) - £99 (Save £38)

## Tech Stack

- **Frontend**: React 19, Next.js 15.4, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude SDK
- **Processing**: Tesseract.js (OCR), Puppeteer (PDF), Cheerio (scraping)
- **PDF Generation**: jsPDF
- **CRM**: GoHighLevel API integration
- **Payment**: Stripe (for premium services)
- **Deployment**: Configured for Vercel

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd menu-analyzer
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# GoHighLevel CRM Integration
GHL_API_KEY=your_gohighlevel_api_key_here
GHL_LOCATION_ID=your_gohighlevel_location_id_here
GHL_WELCOME_CAMPAIGN_ID=your_welcome_campaign_id_here

# Stripe Payment Processing (for paid features)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. API Keys Setup

#### Anthropic Claude API
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `ANTHROPIC_API_KEY`

#### GoHighLevel CRM
1. Log into your GoHighLevel account
2. Navigate to Settings → Integrations → API
3. Create an API key and note your Location ID
4. Add to `GHL_API_KEY` and `GHL_LOCATION_ID`

#### Stripe (Optional - for premium features)
1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your publishable and secret keys
3. Add to Stripe environment variables

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-menu/     # Menu analysis endpoint
│   │   ├── crm/              # GoHighLevel CRM integration
│   │   ├── generate-pdf/     # PDF report generation
│   │   └── purchase/         # Payment processing
│   ├── layout.tsx
│   └── page.tsx              # Main landing page
├── components/
│   ├── MenuAnalyzer.tsx      # Main application component
│   ├── UserInfoForm.tsx      # Name/email capture form
│   ├── MenuUpload.tsx        # File upload and URL input
│   ├── AnalysisResults.tsx   # Display analysis results
│   └── UpsellSection.tsx     # Premium services upsell
```

## Features Implementation

### Lead Capture & CRM Integration
- Users must provide name and email before analysis
- Automatic integration with GoHighLevel CRM
- Tags leads appropriately for follow-up marketing

### Menu Analysis Process
1. **Input Processing**: 
   - PDF text extraction using pdf-parse
   - Image OCR using Tesseract.js
   - URL scraping using Puppeteer and Cheerio

2. **AI Analysis**: 
   - Claude API analyzes menu content
   - Generates revenue score (0-100)
   - Provides categorized recommendations

3. **Report Generation**: 
   - Interactive web report
   - Downloadable PDF report
   - Professional formatting

### Premium Services Upsell
- Displays after free analysis completion
- Multiple service options with bundles
- Stripe payment integration
- Automatic CRM tagging for sales follow-up

## Deployment

### Vercel Deployment

1. Push code to GitHub repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Add Anthropic API key
- Configure GoHighLevel credentials
- Set up Stripe keys for payments
- Update `NEXT_PUBLIC_APP_URL` to production URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
