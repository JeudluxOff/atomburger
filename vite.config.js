import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.STORAGE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ||
  ''

const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.STORAGE_SUPABASE_ANON_KEY ||
  process.env.STORAGE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY ||
  ''

export default defineConfig({
  plugins: [react()],
  define: {
    __SUPABASE_URL__: JSON.stringify(supabaseUrl),
    __SUPABASE_ANON_KEY__: JSON.stringify(supabaseAnonKey),
  },
})
