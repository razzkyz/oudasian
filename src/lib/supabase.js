import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://njjtgdibovtjwdatzqfz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qanRnZGlib3Z0andkYXR6cWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODQ5NTQsImV4cCI6MjEwNzU2MDk1NH0.qFSxyPZaZpmn0FXdPHyx3LUc3m1qbdH2DFDo_-L6XxM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
