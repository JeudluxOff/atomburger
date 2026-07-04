import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.STORAGE_SUPABASE_URL ||
  process.env.Storage_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_Storage_SUPABASE_URL

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.Storage_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.STORAGE_SUPABASE_SECRET_KEY ||
  process.env.Storage_SUPABASE_SECRET_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Methode non autorisee.' })
  }
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Configuration Supabase incomplete.' })

  const { email, password, firstName, lastName, phone = '', address = '' } = req.body || {}
  if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: 'Informations incompletes.' })

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, phone, role_type: 'customer' },
  })
  if (error) return res.status(400).json({ error: error.message })

  const profile = {
    id: data.user.id,
    email,
    firstName,
    lastName,
    phone,
    address,
    role_type: 'customer',
    role: null,
    permissions: [],
  }
  const { data: savedProfile, error: profileError } = await admin
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()
  if (profileError) return res.status(400).json({ error: profileError.message })

  const customer = { ...savedProfile, roleType: 'customer' }
  return res.status(201).json(customer)
}
