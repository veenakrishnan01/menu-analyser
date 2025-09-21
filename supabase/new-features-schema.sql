-- Schema for new premium features: Offers and Ad Campaigns

-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  features TEXT[] NOT NULL,
  max_offers_per_month INTEGER DEFAULT 10,
  max_campaigns_per_month INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, tier_id)
);

-- Create generated_offers table
CREATE TABLE public.generated_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  menu_analysis_id UUID REFERENCES public.menu_analyses ON DELETE CASCADE,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('percentage_discount', 'bogo', 'bundle', 'time_limited', 'loyalty', 'seasonal')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percentage DECIMAL(5,2),
  conditions TEXT,
  target_audience JSONB, -- demographic and behavioral targeting data
  suggested_duration_days INTEGER DEFAULT 7,
  estimated_redemption_rate DECIMAL(5,2), -- predicted redemption rate
  estimated_revenue_impact DECIMAL(10,2), -- predicted revenue impact
  ai_reasoning TEXT, -- explanation of why this offer was suggested
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  performance_metrics JSONB DEFAULT '{}', -- track actual performance vs predictions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create ad_campaigns table  
CREATE TABLE public.ad_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.generated_offers ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  platforms TEXT[] NOT NULL, -- ['facebook', 'instagram', 'google', 'tiktok', 'email', 'sms', 'whatsapp']
  target_audience JSONB NOT NULL, -- detailed targeting parameters
  creative_assets JSONB, -- generated ad copy, images, videos
  budget_total DECIMAL(10,2),
  budget_daily DECIMAL(10,2),
  duration_days INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'active', 'paused', 'completed', 'cancelled')),
  performance_predictions JSONB, -- AI predictions for reach, clicks, conversions
  actual_performance JSONB DEFAULT '{}', -- real performance data when available
  ai_optimization_suggestions JSONB DEFAULT '{}', -- ongoing AI recommendations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create campaign_creatives table for managing ad assets
CREATE TABLE public.campaign_creatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  creative_type TEXT NOT NULL CHECK (creative_type IN ('image', 'video', 'carousel', 'text', 'story')),
  headline TEXT,
  description TEXT,
  call_to_action TEXT,
  asset_url TEXT, -- URL to generated image/video
  dimensions TEXT, -- e.g., "1080x1080", "1920x1080"
  ai_generated BOOLEAN DEFAULT true,
  performance_score DECIMAL(3,2), -- 0-1 score for creative effectiveness
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create usage tracking for premium features
CREATE TABLE public.premium_feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('offer_generation', 'campaign_creation', 'creative_generation')),
  month_year TEXT NOT NULL, -- format: "2024-01"
  usage_count INTEGER DEFAULT 0,
  tier_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, feature_type, month_year)
);

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_generated_offers_user_id ON public.generated_offers(user_id);
CREATE INDEX idx_generated_offers_status ON public.generated_offers(status);
CREATE INDEX idx_ad_campaigns_user_id ON public.ad_campaigns(user_id);
CREATE INDEX idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX idx_campaign_creatives_campaign_id ON public.campaign_creatives(campaign_id);
CREATE INDEX idx_premium_usage_user_feature ON public.premium_feature_usage(user_id, feature_type);

-- Set up Row Level Security (RLS) policies

-- Subscription tiers (public read access)
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active subscription tiers" ON public.subscription_tiers
  FOR SELECT USING (is_active = true);

-- User subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Generated offers
ALTER TABLE public.generated_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own offers" ON public.generated_offers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own offers" ON public.generated_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own offers" ON public.generated_offers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own offers" ON public.generated_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Ad campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own campaigns" ON public.ad_campaigns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON public.ad_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.ad_campaigns
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.ad_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Campaign creatives
ALTER TABLE public.campaign_creatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view creatives for own campaigns" ON public.campaign_creatives
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = campaign_creatives.campaign_id 
      AND ad_campaigns.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert creatives for own campaigns" ON public.campaign_creatives
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = campaign_creatives.campaign_id 
      AND ad_campaigns.user_id = auth.uid()
    )
  );

-- Premium feature usage
ALTER TABLE public.premium_feature_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON public.premium_feature_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.premium_feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.premium_feature_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE TRIGGER handle_updated_at_user_subscriptions
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_generated_offers
  BEFORE UPDATE ON public.generated_offers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_ad_campaigns
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_premium_feature_usage
  BEFORE UPDATE ON public.premium_feature_usage
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, price_yearly, features, max_offers_per_month, max_campaigns_per_month) VALUES
('Starter', 29.00, 290.00, ARRAY['10 AI-Generated Offers per month', '5 Ad Campaigns per month', 'Basic targeting', 'Email & SMS campaigns'], 10, 5),
('Professional', 99.00, 990.00, ARRAY['50 AI-Generated Offers per month', '20 Ad Campaigns per month', 'Advanced targeting', 'All platforms (Facebook, Instagram, TikTok, WhatsApp)', 'Performance analytics', 'A/B testing'], 50, 20),
('Enterprise', 299.00, 2990.00, ARRAY['Unlimited AI-Generated Offers', 'Unlimited Ad Campaigns', 'Premium targeting & lookalike audiences', 'All platforms + Google Ads', 'Advanced analytics & reporting', 'Priority support', 'Custom creative generation'], -1, -1);