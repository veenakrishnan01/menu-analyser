export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          business_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          business_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          business_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          price_monthly: number
          price_yearly: number
          features: string[]
          max_offers_per_month: number
          max_campaigns_per_month: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price_monthly: number
          price_yearly: number
          features: string[]
          max_offers_per_month?: number
          max_campaigns_per_month?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_monthly?: number
          price_yearly?: number
          features?: string[]
          max_offers_per_month?: number
          max_campaigns_per_month?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          tier_id: string
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier_id: string
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier_id?: string
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generated_offers: {
        Row: {
          id: string
          user_id: string
          menu_analysis_id: string | null
          offer_type: 'percentage_discount' | 'bogo' | 'bundle' | 'time_limited' | 'loyalty' | 'seasonal'
          title: string
          description: string
          discount_percentage: number | null
          conditions: string | null
          target_audience: Record<string, unknown>
          suggested_duration_days: number
          estimated_redemption_rate: number | null
          estimated_revenue_impact: number | null
          ai_reasoning: string | null
          status: 'draft' | 'active' | 'paused' | 'completed'
          performance_metrics: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          menu_analysis_id?: string | null
          offer_type: 'percentage_discount' | 'bogo' | 'bundle' | 'time_limited' | 'loyalty' | 'seasonal'
          title: string
          description: string
          discount_percentage?: number | null
          conditions?: string | null
          target_audience?: Record<string, unknown>
          suggested_duration_days?: number
          estimated_redemption_rate?: number | null
          estimated_revenue_impact?: number | null
          ai_reasoning?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
          performance_metrics?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          menu_analysis_id?: string | null
          offer_type?: 'percentage_discount' | 'bogo' | 'bundle' | 'time_limited' | 'loyalty' | 'seasonal'
          title?: string
          description?: string
          discount_percentage?: number | null
          conditions?: string | null
          target_audience?: Record<string, unknown>
          suggested_duration_days?: number
          estimated_redemption_rate?: number | null
          estimated_revenue_impact?: number | null
          ai_reasoning?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed'
          performance_metrics?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      ad_campaigns: {
        Row: {
          id: string
          user_id: string
          offer_id: string | null
          campaign_name: string
          platforms: string[]
          target_audience: Record<string, unknown>
          creative_assets: Record<string, unknown> | null
          budget_total: number | null
          budget_daily: number | null
          duration_days: number | null
          start_date: string | null
          end_date: string | null
          status: 'draft' | 'review' | 'active' | 'paused' | 'completed' | 'cancelled'
          performance_predictions: Record<string, unknown> | null
          actual_performance: Record<string, unknown>
          ai_optimization_suggestions: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          offer_id?: string | null
          campaign_name: string
          platforms: string[]
          target_audience: Record<string, unknown>
          creative_assets?: Record<string, unknown> | null
          budget_total?: number | null
          budget_daily?: number | null
          duration_days?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: 'draft' | 'review' | 'active' | 'paused' | 'completed' | 'cancelled'
          performance_predictions?: Record<string, unknown> | null
          actual_performance?: Record<string, unknown>
          ai_optimization_suggestions?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          offer_id?: string | null
          campaign_name?: string
          platforms?: string[]
          target_audience?: Record<string, unknown>
          creative_assets?: Record<string, unknown> | null
          budget_total?: number | null
          budget_daily?: number | null
          duration_days?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: 'draft' | 'review' | 'active' | 'paused' | 'completed' | 'cancelled'
          performance_predictions?: Record<string, unknown> | null
          actual_performance?: Record<string, unknown>
          ai_optimization_suggestions?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
      campaign_creatives: {
        Row: {
          id: string
          campaign_id: string
          platform: string
          creative_type: 'image' | 'video' | 'carousel' | 'text' | 'story'
          headline: string | null
          description: string | null
          call_to_action: string | null
          asset_url: string | null
          dimensions: string | null
          ai_generated: boolean
          performance_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          platform: string
          creative_type: 'image' | 'video' | 'carousel' | 'text' | 'story'
          headline?: string | null
          description?: string | null
          call_to_action?: string | null
          asset_url?: string | null
          dimensions?: string | null
          ai_generated?: boolean
          performance_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          platform?: string
          creative_type?: 'image' | 'video' | 'carousel' | 'text' | 'story'
          headline?: string | null
          description?: string | null
          call_to_action?: string | null
          asset_url?: string | null
          dimensions?: string | null
          ai_generated?: boolean
          performance_score?: number | null
          created_at?: string
        }
      }
      premium_feature_usage: {
        Row: {
          id: string
          user_id: string
          feature_type: 'offer_generation' | 'campaign_creation' | 'creative_generation'
          month_year: string
          usage_count: number
          tier_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature_type: 'offer_generation' | 'campaign_creation' | 'creative_generation'
          month_year: string
          usage_count?: number
          tier_limit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature_type?: 'offer_generation' | 'campaign_creation' | 'creative_generation'
          month_year?: string
          usage_count?: number
          tier_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      menu_analyses: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          menu_source: string
          menu_url: string | null
          menu_file_name: string | null
          analysis_results: AnalysisResult
          revenue_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string | null
          menu_source: string
          menu_url?: string | null
          menu_file_name?: string | null
          analysis_results: AnalysisResult
          revenue_score: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          menu_source?: string
          menu_url?: string | null
          menu_file_name?: string | null
          analysis_results?: AnalysisResult
          revenue_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          email: string
          analyses_used: number
          last_analysis_at: string | null
          session_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          analyses_used?: number
          last_analysis_at?: string | null
          session_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          analyses_used?: number
          last_analysis_at?: string | null
          session_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface AnalysisResult {
  revenue_score: number
  quick_wins: string[]
  visual_appeal: string[]
  strategic_pricing: string[]
  menu_design: string[]
  summary: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  business_name?: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface MenuAnalysis {
  id: string
  user_id: string
  business_name?: string
  menu_source: 'file' | 'url'
  menu_url?: string
  menu_file_name?: string
  analysis_results: AnalysisResult
  revenue_score: number
  created_at: string
  updated_at: string
}

export interface SubscriptionTier {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  features: string[]
  max_offers_per_month: number
  max_campaigns_per_month: number
  is_active: boolean
  created_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  tier_id: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start?: string
  current_period_end?: string
  trial_end?: string
  created_at: string
  updated_at: string
}

export interface GeneratedOffer {
  id: string
  user_id: string
  menu_analysis_id?: string
  offer_type: 'percentage_discount' | 'bogo' | 'bundle' | 'time_limited' | 'loyalty' | 'seasonal'
  title: string
  description: string
  discount_percentage?: number
  conditions?: string
  target_audience: TargetAudience
  suggested_duration_days: number
  estimated_redemption_rate?: number
  estimated_revenue_impact?: number
  ai_reasoning?: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  performance_metrics: PerformanceMetrics
  created_at: string
  updated_at: string
}

export interface AdCampaign {
  id: string
  user_id: string
  offer_id?: string
  campaign_name: string
  platforms: string[]
  target_audience: TargetAudience
  creative_assets?: CreativeAssets
  budget_total?: number
  budget_daily?: number
  duration_days?: number
  start_date?: string
  end_date?: string
  status: 'draft' | 'review' | 'active' | 'paused' | 'completed' | 'cancelled'
  performance_predictions?: PerformancePredictions
  actual_performance: ActualPerformance
  ai_optimization_suggestions: OptimizationSuggestions
  created_at: string
  updated_at: string
}

export interface CampaignCreative {
  id: string
  campaign_id: string
  platform: string
  creative_type: 'image' | 'video' | 'carousel' | 'text' | 'story'
  headline?: string
  description?: string
  call_to_action?: string
  asset_url?: string
  dimensions?: string
  ai_generated: boolean
  performance_score?: number
  created_at: string
}

export interface PremiumFeatureUsage {
  id: string
  user_id: string
  feature_type: 'offer_generation' | 'campaign_creation' | 'creative_generation'
  month_year: string
  usage_count: number
  tier_limit: number
  created_at: string
  updated_at: string
}

export interface TargetAudience {
  age_range?: [number, number]
  gender?: 'male' | 'female' | 'all'
  interests?: string[]
  location?: {
    radius_km?: number
    cities?: string[]
    countries?: string[]
  }
  behaviors?: string[]
  dining_habits?: string[]
  spending_power?: 'low' | 'medium' | 'high' | 'premium'
}

export interface PerformanceMetrics {
  impressions?: number
  clicks?: number
  conversions?: number
  revenue_generated?: number
  cost_per_click?: number
  return_on_ad_spend?: number
  redemption_count?: number
  customer_acquisition_cost?: number
}

export interface CreativeAssets {
  images?: string[]
  videos?: string[]
  copy_variants?: {
    headline: string
    description: string
    cta: string
  }[]
}

export interface PerformancePredictions {
  estimated_reach?: number
  estimated_clicks?: number
  estimated_conversions?: number
  estimated_revenue?: number
  confidence_score?: number
}

export interface ActualPerformance extends PerformanceMetrics {
  last_updated?: string
}

export interface OptimizationSuggestions {
  budget_recommendations?: {
    suggested_budget?: number
    reasoning?: string
  }
  audience_adjustments?: {
    suggested_changes?: Partial<TargetAudience>
    reasoning?: string
  }
  creative_improvements?: {
    suggested_changes?: string[]
    reasoning?: string
  }
  last_analyzed?: string
}