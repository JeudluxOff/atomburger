import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const publicSupabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.STORAGE_SUPABASE_URL ||
  process.env.Storage_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_Storage_SUPABASE_URL ||
  ''

const publicSupabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.STORAGE_SUPABASE_ANON_KEY ||
  process.env.Storage_SUPABASE_ANON_KEY ||
  process.env.STORAGE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.Storage_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_Storage_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_Storage_SUPABASE_PUBLISHABLE_KEY ||
  ''

export default defineConfig({
  plugins: [react()],
  define: {
    __PUBLIC_SUPABASE_URL__: JSON.stringify(publicSupabaseUrl),
    __PUBLIC_SUPABASE_KEY__: JSON.stringify(publicSupabaseKey),
  },
})
