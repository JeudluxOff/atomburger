import { createClient } from '@supabase/supabase-js'
import { announcementsSeed, customerSeed, docsSeed, eventSeed, menuSeed, orderSeed, promotionsSeed, restaurantsSeed, staffSeed, tickerMessagesSeed, timeEntrySeed } from './data'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url, key) : null
export const isDemoMode = !supabase

const seeds = {
  menu: menuSeed,
  restaurants: restaurantsSeed,
  staff: staffSeed,
  customers: customerSeed,
  time_entries: timeEntrySeed,
  cash_entries: [],
  events: eventSeed,
  orders: orderSeed,
  announcements: announcementsSeed,
  documents: docsSeed,
  promotions: promotionsSeed,
  ticker_messages: tickerMessagesSeed,
  applications: [],
  settings: { acceptingOrders: true },
}

const normalizeRole = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase().trim()
const managerRoles = ['Directeur Restaurant', 'Assistant Directeur', 'Chef d equipe', 'Chef d’équipe', 'Manager'].map(normalizeRole)
const isManagerRole = role => managerRoles.includes(normalizeRole(role))
const normalizeCustomer = item => ({
  ...item,
  firstName: item.firstName || item.first_name || '',
  lastName: item.lastName || item.last_name || '',
  roleType: 'customer',
})

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function readLocal(collection) {
  const saved = localStorage.getItem(`atom:${collection}`)
  if (!saved) {
    localStorage.setItem(`atom:${collection}`, JSON.stringify(seeds[collection]))
    return clone(seeds[collection])
  }
  try { return JSON.parse(saved) } catch { return clone(seeds[collection]) }
}

export function writeLocal(collection, value) {
  localStorage.setItem(`atom:${collection}`, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('atom:data', { detail: { collection } }))
  return value
}

export async function loadCollection(collection) {
  if (!supabase) return readLocal(collection)
  const { data, error } = await supabase.from(collection).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertRecord(collection, record) {
  if (!supabase) {
    const rows = readLocal(collection)
    writeLocal(collection, [record, ...rows])
    return record
  }
  if (collection === 'applications') {
    const { error } = await supabase.from(collection).insert(record)
    if (error) throw error
    return record
  }
  const { data, error } = await supabase.from(collection).insert(record).select().single()
  if (error) throw error
  return data
}

export async function updateRecord(collection, id, patch) {
  if (!supabase) {
    const rows = readLocal(collection).map(row => row.id === id ? { ...row, ...patch } : row)
    writeLocal(collection, rows)
    return rows.find(row => row.id === id)
  }
  const { data, error } = await supabase.from(collection).update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRecord(collection, id) {
  if (!supabase) {
    writeLocal(collection, readLocal(collection).filter(row => row.id !== id))
    return
  }
  const { error } = await supabase.from(collection).delete().eq('id', id)
  if (error) throw error
}

export async function replaceCollection(collection, value) {
  if (!supabase) return writeLocal(collection, value)
  const { error } = await supabase.from(collection).upsert(value)
  if (error) throw error
  return value
}

export async function loadSettings() {
  if (!supabase) return readLocal('settings')
  const { data, error } = await supabase.from('settings').select('*').eq('id', 'global').single()
  if (error) throw error
  return data
}

export async function updateSettings(value) {
  if (!supabase) return writeLocal('settings', value)
  const { error } = await supabase.from('settings').upsert({ id: 'global', ...value })
  if (error) throw error
  return value
}

export async function createEmployee(form) {
  if (!supabase) {
    const permissions = isManagerRole(form.role) ? ['calendar', 'orders', 'admin'] : ['calendar', 'orders']
    const employee = { ...form, id: `staff-${crypto.randomUUID()}`, permissions }
    writeLocal('staff', [...readLocal('staff'), employee])
    return employee
  }
  const { data: session } = await supabase.auth.getSession()
  const response = await fetch('/api/admin-user', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token}` }, body: JSON.stringify(form),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Creation impossible.')
  return body
}

export async function removeEmployee(employee) {
  if (!supabase) {
    writeLocal('staff', readLocal('staff').filter(item => item.id !== employee.id))
    return
  }
  const { data: session } = await supabase.auth.getSession()
  const response = await fetch('/api/admin-user', {
    method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token}` },
    body: JSON.stringify({ id: employee.id, authId: employee.auth_id }),
  })
  if (!response.ok) throw new Error('Suppression impossible.')
}

export async function updateEmployee(employee) {
  if (!supabase) {
    const rows = readLocal('staff').map(item => item.id === employee.id ? { ...item, ...employee } : item)
    writeLocal('staff', rows)
    return rows.find(item => item.id === employee.id)
  }
  const { data: session } = await supabase.auth.getSession()
  const response = await fetch('/api/admin-user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token}` },
    body: JSON.stringify(employee),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Modification impossible.')
  return body
}

export async function signIn(identifier, password, portal) {
  if (!supabase) {
    if (portal === 'employee') {
      const staff = readLocal('staff').find(user => (user.username === identifier || user.email === identifier) && user.password === password)
      if (!staff) throw new Error('Identifiants employe invalides.')
      return { ...staff, roleType: 'employee' }
    }
    const savedCustomers = readLocal('customers')
    const customers = [...customerSeed, ...savedCustomers.filter(user => !customerSeed.some(seed => seed.id === user.id))]
    const customer = customers.find(user => user.email === identifier && user.password === password)
    if (!customer) throw new Error('Adresse ou mot de passe incorrect.')
    return { ...customer, roleType: 'customer' }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password })
  if (error) throw error
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
  if (portal === 'employee') {
    const { data: staffProfile } = await supabase.from('staff').select('*').or(`auth_id.eq.${data.user.id},email.eq.${data.user.email}`).maybeSingle()
    if (!staffProfile && profile?.role_type !== 'employee') throw new Error('Ce compte ne dispose pas de cet acces.')
    return { ...(profile || {}), ...(staffProfile || {}), id: staffProfile?.id || profile?.id, auth_id: data.user.id, email: data.user.email, roleType: 'employee' }
  }
  if (!profile) throw new Error('Ce compte ne dispose pas de cet acces.')
  return { ...profile, email: data.user.email, roleType: profile.role_type }
}

export async function signUpCustomer(form) {
  if (!supabase) {
    const rows = readLocal('customers')
    if (rows.some(user => user.email === form.email)) throw new Error('Cette adresse est deja utilisee.')
    const user = { id: crypto.randomUUID(), ...form, roleType: 'customer' }
    writeLocal('customers', [...rows, user])
    return user
  }
  const response = await fetch('/api/customer-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Creation impossible.')
  const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
  if (error) throw error
  return normalizeCustomer({ ...body, id: data.user.id })
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
}

export async function loadCustomers() {
  if (!supabase) {
    const saved = readLocal('customers')
    return [...customerSeed, ...saved.filter(user => !customerSeed.some(seed => seed.id === user.id))]
  }
  const { data, error } = await supabase.from('profiles').select('*').eq('role_type', 'customer').order('created_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeCustomer)
}

export async function updateCustomer(id, patch) {
  if (!supabase) {
    const rows = readLocal('customers').map(item => item.id === id ? { ...item, ...patch } : item)
    writeLocal('customers', rows)
    return rows.find(item => item.id === id)
  }
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}
