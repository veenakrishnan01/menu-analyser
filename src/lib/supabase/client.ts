import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please set up your Supabase project first.')
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please set up your Supabase project first.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}