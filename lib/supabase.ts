import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase' // Импорт типов из папки types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Передаем <Database> клиенту
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)