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