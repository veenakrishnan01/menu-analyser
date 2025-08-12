# 🚀 Menu Analyzer - Quick Deployment Guide

## What You Need to Get Real Output (Priority Order)

### 1️⃣ **Anthropic API Key** (REQUIRED - 5 minutes)
Without this, the app won't analyze menus at all.

```bash
# 1. Sign up at https://console.anthropic.com/
# 2. Create an API key
# 3. Add to .env.local:
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY-HERE

# 4. Restart your dev server
npm run dev
```

### 2️⃣ **Test Locally First** (10 minutes)
```bash
# Run the app
npm run dev

# Test with:
- A restaurant PDF menu
- A photo of a menu
- A restaurant website URL (e.g., https://restaurant.com/menu)
```

### 3️⃣ **Deploy to Vercel** (15 minutes)
```bash
# Option A: Using Vercel CLI
npm i -g vercel
vercel

# Option B: Using GitHub
# 1. Push to GitHub
# 2. Import to Vercel.com
# 3. Add environment variables in Vercel dashboard
```

### 4️⃣ **Environment Variables for Vercel**
Add these in Vercel Dashboard → Settings → Environment Variables:
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## ✅ What's Working Now

- ✅ Lead capture (saves to local file)
- ✅ 10 free analyses per email (using localStorage)
- ✅ Menu analysis with Claude AI
- ✅ PDF report generation
- ✅ Upsell display (payment in test mode)

## 🔄 Optional Later

### GoHighLevel CRM (When you have an account)
```
GHL_API_KEY=your-key
GHL_LOCATION_ID=your-location-id
```

### Stripe Payments (When ready to charge)
```
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

## 🧪 Test Checklist

1. [ ] Form captures name/email
2. [ ] PDF upload works
3. [ ] Image upload works
4. [ ] URL scraping works
5. [ ] Analysis generates results
6. [ ] PDF download works
7. [ ] Upsell section displays
8. [ ] 10 analyses limit enforced

## 📊 Monitor Your Leads

Check `leads-backup.json` in your project root to see all captured leads.

## 🚨 Common Issues

1. **"Failed to analyze menu"**
   - Check Anthropic API key is correct
   - Check you have API credits

2. **PDF/Image not working**
   - File might be too large (keep under 10MB)
   - Try a different format

3. **URL scraping fails**
   - Some sites block scrapers
   - Try a different restaurant site

## 🎯 Next Steps After Deployment

1. Share link with restaurant owners
2. Monitor leads in `leads-backup.json`
3. Follow up with interested leads
4. Add payment processing when ready

---

**Ready to launch?** Just add your Anthropic API key and deploy!