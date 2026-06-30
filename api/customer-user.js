import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.STORAGE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.STORAGE_SUPABASE_SECRET_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Methode non autorisee.' })
  }
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Configuration Supabase incomplete.' })

  const { email, password, firstName, lastName, phone = '' } = req.body || {}
  if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: 'Informations incompletes.' })

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, phone, role_type: 'customer' },
  })
  if (error) return res.status(400).json({ error: error.message })

  const customer = { id: data.user.id, email, firstName, lastName, phone, address: '', roleType: 'customer' }
  return res.status(201).json(customer)
}
