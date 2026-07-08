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

async function requireManager(admin, req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) throw new Error('Session requise.')
  const { data: auth, error: authError } = await admin.auth.getUser(token)
  if (authError || !auth.user) throw new Error('Session invalide.')
  const { data: profile } = await admin.from('profiles').select('permissions').eq('id', auth.user.id).single()
  if (!profile?.permissions?.includes('admin')) throw new Error('Droits de direction requis.')
  return auth.user
}

export default async function handler(req, res) {
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Configuration Supabase incomplete.' })
  const admin = createClient(supabaseUrl, serviceRoleKey)

  if (req.method === 'POST') {
    const { email, password, firstName, lastName, phone = '', address = '' } = req.body || {}
    if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: 'Informations incompletes.' })

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
      loyaltyPoints: 0,
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

    return res.status(201).json({ ...savedProfile, roleType: 'customer' })
  }

  if (req.method === 'DELETE') {
    try {
      await requireManager(admin, req)
    } catch (error) {
      const status = error.message.includes('Droits') ? 403 : 401
      return res.status(status).json({ error: error.message })
    }

    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Client invalide.' })

    // Conserve l'historique comptable sans bloquer la suppression du compte.
    await admin.from('orders').update({ customerId: null }).eq('customerId', id)
    const { error } = await admin.auth.admin.deleteUser(id)
    if (error) return res.status(400).json({ error: error.message })
    return res.status(204).end()
  }

  res.setHeader('Allow', 'POST, DELETE')
  return res.status(405).json({ error: 'Methode non autorisee.' })
}
