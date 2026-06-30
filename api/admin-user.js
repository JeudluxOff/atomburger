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

const normalizeRole = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase().trim()
const managerRoles = ['Directeur Restaurant', 'Assistant Directeur', 'Chef d equipe', 'Chef d’équipe', 'Manager'].map(normalizeRole)
const isManagerRole = role => managerRoles.includes(normalizeRole(role))

export default async function handler(req, res) {
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Configuration Supabase incomplete.' })
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Session requise.' })

  const admin = createClient(supabaseUrl, serviceRoleKey)
  const { data: auth, error: authError } = await admin.auth.getUser(token)
  if (authError || !auth.user) return res.status(401).json({ error: 'Session invalide.' })
  const { data: profile } = await admin.from('profiles').select('permissions').eq('id', auth.user.id).single()
  if (!profile?.permissions?.includes('admin')) return res.status(403).json({ error: 'Droits de direction requis.' })

  if (req.method === 'POST') {
    const { email, password, firstName, lastName, username, role, position = '', restaurant = '', phone = '', iban = '' } = req.body || {}
    if (!email || !password || !firstName || !lastName || !role) return res.status(400).json({ error: 'Informations incompletes.' })
    const permissions = isManagerRole(role) ? ['calendar', 'orders', 'admin'] : ['calendar', 'orders']
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, role_type: 'employee', role, permissions },
    })
    if (error) return res.status(400).json({ error: error.message })
    const staff = { id: `staff-${data.user.id}`, auth_id: data.user.id, username, email, firstName, lastName, role, position, restaurant, phone, iban, permissions }
    const { error: staffError } = await admin.from('staff').insert(staff)
    if (staffError) return res.status(400).json({ error: staffError.message })
    return res.status(201).json(staff)
  }

  if (req.method === 'PUT') {
    const { id, auth_id, authId, email, firstName, lastName, role, position = '', restaurant = '', phone = '', iban = '', permissions = [] } = req.body || {}
    if (!id || !firstName || !lastName || !role) return res.status(400).json({ error: 'Informations incompletes.' })
    const authUserId = auth_id || authId
    const staffPatch = { email, firstName, lastName, role, position, restaurant, phone, iban, permissions }
    const { data: staff, error: staffError } = await admin.from('staff').update(staffPatch).eq('id', id).select().single()
    if (staffError) return res.status(400).json({ error: staffError.message })
    if (authUserId) {
      await admin.from('profiles').update({ email, firstName, lastName, phone, role, permissions, role_type: 'employee' }).eq('id', authUserId)
      await admin.auth.admin.updateUserById(authUserId, {
        email,
        user_metadata: { first_name: firstName, last_name: lastName, phone, role_type: 'employee', role, permissions },
      })
    }
    return res.status(200).json(staff)
  }

  if (req.method === 'DELETE') {
    const { id, authId } = req.body || {}
    if (id) await admin.from('staff').delete().eq('id', id)
    if (authId) await admin.auth.admin.deleteUser(authId)
    return res.status(204).end()
  }
  res.setHeader('Allow', 'POST, PUT, DELETE')
  return res.status(405).json({ error: 'Methode non autorisee.' })
}
