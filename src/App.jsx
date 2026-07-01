import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BadgePercent, Banknote, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound,
  ClipboardList, Clock3, FileText, Flame, LayoutDashboard, LockKeyhole, LogOut, MapPin, Menu as MenuIcon,
  Minus, PackageCheck, Pencil, Plus, Search, Settings, ShieldCheck, ShoppingBag, Store, Trash2, Truck,
  Save, UserRound, Users, Utensils, X,
} from 'lucide-react'
import {
  announcementsSeed, docsSeed, menuSeed, orderStatuses, promotionsSeed, rankOptions,
  restaurantsSeed, staffSeed,
} from './data'
import {
  createEmployee, deleteRecord, insertRecord, isDemoMode, loadCollection, loadCustomers, loadSettings, removeEmployee, supabase,
  replaceCollection, signIn, signOut, signUpCustomer, updateCustomer, updateEmployee, updateRecord, updateSettings,
} from './store'

const MAP_URL = 'https://www.igta5.com/images/gtav-map-atlas-huge.jpg'
const categories = ['Menus', 'Burgers', 'Accompagnements', 'Boissons', 'Desserts']

const money = value => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(value)
const fullName = user => `${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`.trim()
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const normalizeRole = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[’']/g, '').toLowerCase().trim()
const managerRoles = ['Directeur Restaurant', 'Assistant Directeur', 'Chef d equipe', 'Chef d’équipe', 'Manager'].map(normalizeRole)
const isManagerRole = role => managerRoles.includes(normalizeRole(role))
const canManage = user => isManagerRole(user?.role) || user?.permissions?.includes('admin')

function Brand({ compact = false }) {
  return <img className={compact ? 'brand compact' : 'brand'} src="/assets/upnatom-brand-transparent.png" alt="Up-n-Atom Hamburgers" />
}

function Character({ side = 'left' }) {
  return <div className={`character-crop ${side}`} aria-hidden="true"><img src="/assets/upnatom-brand-transparent.png" alt="" /></div>
}

function HeroCharacter() {
  return <img className="hero-character" src="/assets/hero-character.png" alt="" aria-hidden="true" />
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [message, onClose])
  return <div className="toast"><Check size={18} />{message}</div>
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className={`modal ${wide ? 'wide' : ''}`} onMouseDown={event => event.stopPropagation()}>
        <header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Fermer"><X /></button></header>
        {children}
      </section>
    </div>
  )
}

function PublicHeader({ page, navigate, cartCount, user, logout }) {
  const [open, setOpen] = useState(false)
  const links = [['home', 'Accueil'], ['menu', 'La carte'], ['promos', 'Promotions'], ['restaurants', 'Restaurants'], ['recruitment', 'Recrutement']]
  return (
    <header className="public-header">
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <MenuIcon />}</button>
      <button className="brand-button" onClick={() => navigate('home')}><Brand compact /></button>
      <nav className={open ? 'public-nav open' : 'public-nav'}>
        {links.map(([key, label]) => <button className={page === key ? 'active' : ''} key={key} onClick={() => { navigate(key); setOpen(false) }}>{label}</button>)}
      </nav>
      <div className="header-actions">
        <button className="cart-button" onClick={() => navigate('menu')}><ShoppingBag size={18} /><span>{cartCount}</span></button>
        {user?.roleType === 'customer' ? (
          <div className="account-menu"><button onClick={() => navigate('account')}><CircleUserRound size={19} />{user.firstName || user.first_name}</button><button className="logout-mini" onClick={logout}><LogOut size={17} /></button></div>
        ) : <button className="account-button" onClick={() => navigate('customer-login')}><UserRound size={18} />Connexion</button>}
        <button className="staff-button" onClick={() => navigate('employee-login')}>Espace equipe</button>
      </div>
    </header>
  )
}

function Home({ navigate, promotions }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <HeroCharacter />
        <div className="hero-copy">
          <span className="eyebrow"><Flame size={16} />Ouvert a Los Santos</span>
          <Brand />
          <h1>Des burgers qui passent a l’action.</h1>
          <p>Steaks grilles, cheddar fondant, frites dorees et shakes bien frais. Commandez en ligne et choisissez votre point de livraison sur la carte.</p>
          <div className="button-row"><button className="primary" onClick={() => navigate('menu')}>Commander</button><button className="secondary" onClick={() => navigate('restaurants')}>Trouver un restaurant</button></div>
        </div>
        <div className="hero-special">
          <span>Menu vedette</span><h2>Double Atom</h2><p>Double steak, double cheddar, cornichons et sauce maison.</p><strong>{money(12.9)}</strong>
        </div>
      </section>
      <section className="band features">
        <article><Utensils /><h3>Prepare a la demande</h3><p>Une carte complete pour les petites et les grandes faims.</p></article>
        <article><MapPin /><h3>Livraison precise</h3><p>Placez directement votre destination sur la carte de San Andreas.</p></article>
        <article><ShoppingBag /><h3>Suivi de commande</h3><p>Suivez chaque etape depuis votre espace personnel.</p></article>
      </section>
      <section className="content-section">
        <div className="section-heading"><span>Offres du moment</span><h2>Plus de gout, moins de detours.</h2></div>
        <div className="promo-grid">{promotions.filter(item => item.active).map(item => <PromoCard key={item.id} item={item} />)}</div>
      </section>
    </main>
  )
}

function PromoCard({ item }) {
  return <article className="promo-card"><BadgePercent /><span>{item.offer}</span><h3>{item.title}</h3><p>{item.description}</p></article>
}

function Quantity({ value, onChange }) {
  return <div className="quantity"><button onClick={() => onChange(value - 1)}><Minus size={15} /></button><strong>{value}</strong><button onClick={() => onChange(value + 1)}><Plus size={15} /></button></div>
}

function MenuPage({ menu, cart, setCart, user, navigate, settings, placeOrder }) {
  const [category, setCategory] = useState('Menus')
  const [checkout, setCheckout] = useState(false)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const serviceAvailable = settings.acceptingOrders
  const add = product => setCart(current => {
    const found = current.find(item => item.id === product.id)
    return found ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
  })
  const quantity = (id, value) => setCart(current => value <= 0 ? current.filter(item => item.id !== id) : current.map(item => item.id === id ? { ...item, quantity: value } : item))
  return (
    <main className="content-section page-top">
      <div className="section-heading"><span>La carte</span><h1>Composez votre commande</h1><p>La commande est reservee aux clients connectes.</p></div>
      <div className="menu-layout">
        <div>
          <div className="category-tabs">{categories.map(item => <button className={category === item ? 'active' : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="product-grid">
            {menu.filter(item => item.category === category).map(product => (
              <article className={`product-card ${!product.available ? 'unavailable' : ''}`} key={product.id}>
                <div className={product.imageUrl || product.image_url ? 'product-visual has-image' : 'product-visual'}>{product.imageUrl || product.image_url ? <img src={product.imageUrl || product.image_url} alt={product.name} /> : <Utensils size={42} />}<span>{product.featured ? 'Signature' : product.category}</span></div>
                <div className="product-info"><h3>{product.name}</h3><p>{product.description}</p><footer><strong>{money(product.price)}</strong><button disabled={!product.available} onClick={() => add(product)}>{product.available ? 'Ajouter' : 'Indisponible'}</button></footer></div>
              </article>
            ))}
          </div>
        </div>
        <aside className="cart-panel">
          <div className="panel-title"><ShoppingBag /><h2>Votre commande</h2></div>
          {!cart.length && <div className="empty-state"><ShoppingBag /><p>Votre panier est vide.</p></div>}
          {cart.map(item => <div className="cart-line" key={item.id}><div><strong>{item.name}</strong><span>{money(item.price * item.quantity)}</span></div><Quantity value={item.quantity} onChange={value => quantity(item.id, value)} /></div>)}
          <div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div>
          {!serviceAvailable && <p className="notice danger-text">Le restaurant est actuellement ferme.</p>}
          {!user && <p className="notice">Connectez-vous pour transmettre votre commande.</p>}
          <button className="primary full" disabled={!cart.length || !serviceAvailable} onClick={() => user ? setCheckout(true) : navigate('customer-login')}>{user ? 'Valider la commande' : 'Se connecter pour commander'}</button>
        </aside>
      </div>
      {checkout && <CheckoutModal user={user} cart={cart} total={total} onClose={() => setCheckout(false)} onSubmit={async form => { await placeOrder(form); setCheckout(false) }} />}
    </main>
  )
}

function SanAndreasMap({ marker, onMarker, restaurantMarkers = false, restaurants = [], compact = false }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef(null)
  const moved = useRef(false)
  const setZoomAround = (nextZoom, point = null) => {
    setZoom(current => {
      const next = Math.max(1, Math.min(4, nextZoom))
      if (point && next !== current) {
        const ratio = next / current
        setPan(previous => ({ x: point.x - (point.x - previous.x) * ratio, y: point.y - (point.y - previous.y) * ratio }))
      }
      if (next === 1) setPan({ x: 0, y: 0 })
      return next
    })
  }
  const wheel = event => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const point = { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }
    setZoomAround(zoom * (event.deltaY < 0 ? 1.15 : .85), point)
  }
  const startDrag = event => {
    if (event.button !== 0) return
    drag.current = { x: event.clientX, y: event.clientY, pan }
    moved.current = false
  }
  const moveDrag = event => {
    if (!drag.current) return
    const dx = event.clientX - drag.current.x
    const dy = event.clientY - drag.current.y
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true
    setPan({ x: drag.current.pan.x + dx, y: drag.current.pan.y + dy })
  }
  const stopDrag = () => { drag.current = null }
  const click = event => {
    if (!onMarker || moved.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const screenX = event.clientX - rect.left
    const screenY = event.clientY - rect.top
    const x = Math.max(0, Math.min(1, .5 + (screenX - pan.x - rect.width / 2) / (zoom * rect.width)))
    const y = Math.max(0, Math.min(1, .5 + (screenY - pan.y - rect.height / 2) / (zoom * rect.height)))
    onMarker({ x: +(x * 100).toFixed(2), y: +(y * 100).toFixed(2) })
  }
  return (
    <div className={`sa-map-shell ${compact ? 'compact' : ''}`}>
      <div className="map-controls"><button onClick={() => setZoomAround(zoom + .35)}><Plus /></button><button onClick={() => setZoomAround(zoom - .35)}><Minus /></button><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}><MapPin size={15} /></button></div>
      <div className="sa-map" onWheel={wheel} onMouseDown={startDrag} onMouseMove={moveDrag} onMouseUp={stopDrag} onMouseLeave={stopDrag} onClick={click} style={{ '--map-zoom': zoom, '--map-pan-x': `${pan.x}px`, '--map-pan-y': `${pan.y}px` }}>
        <div className="map-stage">
          <img src={MAP_URL} alt="Carte de San Andreas" draggable="false" />
          {restaurantMarkers && restaurants.filter(item => item.active).map(item => <button className="map-pin restaurant-pin" style={{ left: `${item.x}%`, top: `${item.y}%` }} key={item.id} title={item.name}><Store size={14} /></button>)}
          {marker && <span className="map-pin delivery-pin" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}><MapPin /></span>}
        </div>
      </div>
      {onMarker && <p className="map-help"><MapPin size={16} />Cliquez pour placer la destination. Molette pour zoomer, clic glisse pour se deplacer.</p>}
    </div>
  )
}

function CheckoutModal({ user, cart, total, onClose, onSubmit }) {
  const [form, setForm] = useState({ firstName: user.firstName || user.first_name || '', lastName: user.lastName || user.last_name || '', phone: user.phone || '', address: user.address || '', note: '', marker: null })
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone || !form.address || !form.marker) return setError('Completez les coordonnees et placez la destination sur la carte.')
    await onSubmit({
      id: `ATM-${String(Date.now()).slice(-6)}`, customerId: user.id, customerName: `${form.firstName} ${form.lastName}`, phone: form.phone,
      address: form.address, markerX: form.marker.x, markerY: form.marker.y, note: form.note, status: 'Nouvelle', paid: false, assignedTo: '', createdAt: new Date().toISOString(),
      items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })), total,
    })
  }
  return (
    <Modal title="Informations de livraison" onClose={onClose} wide>
      <form onSubmit={submit} className="checkout-grid">
        <div className="checkout-fields">
          <div className="form-row"><label>Nom<input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></label><label>Prenom<input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></label></div>
          <label>Telephone<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Adresse ou indication precise<input placeholder="Ex. Alta Street, parking rouge" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
          <label>Instruction de livraison<textarea placeholder="Facultatif" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></label>
          <div className="checkout-summary"><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} articles</span><strong>{money(total)}</strong></div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary full">Envoyer la commande</button>
        </div>
        <SanAndreasMap marker={form.marker} onMarker={marker => setForm({ ...form, marker })} />
      </form>
    </Modal>
  )
}

function RestaurantsPage({ restaurants }) {
  const [selected, setSelected] = useState(restaurants[0]?.id)
  return (
    <main className="content-section page-top">
      <div className="section-heading"><span>Restaurants</span><h1>Up-n-Atom dans tout San Andreas</h1><p>Selectionnez un restaurant pour le retrouver sur la carte.</p></div>
      <div className="restaurant-layout">
        <SanAndreasMap restaurantMarkers restaurants={restaurants} />
        <div className="restaurant-list">{restaurants.filter(item => item.active).map(item => <button className={`restaurant-card ${selected === item.id ? 'active' : ''}`} onClick={() => setSelected(item.id)} key={item.id}><Store /><div><h3>{item.name}</h3><p>{item.hours}</p><span>{item.phone}</span></div></button>)}</div>
      </div>
    </main>
  )
}

function PromosPage({ promotions }) {
  return <main className="content-section page-top"><div className="section-heading"><span>Promotions</span><h1>Les offres du moment</h1></div><div className="promo-grid">{promotions.filter(item => item.active).map(item => <PromoCard key={item.id} item={item} />)}</div></main>
}

function Recruitment({ restaurants, onSubmitApplication }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    role: rankOptions[0],
    restaurant: restaurants[0]?.name || '',
    message: '',
  })
  const submit = async event => {
    event.preventDefault()
    setSent(false)
    setError('')
    try {
      await onSubmitApplication({
        id: uid('application'),
        ...form,
        status: 'Nouvelle',
        createdAt: new Date().toISOString(),
      })
      setForm({ fullName: '', phone: '', role: rankOptions[0], restaurant: restaurants[0]?.name || '', message: '' })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Impossible d’envoyer la candidature.')
    }
  }
  return (
    <main className="content-section page-top">
      <div className="section-heading"><span>Recrutement</span><h1>Rejoignez l’equipe</h1><p>Des postes en salle, en cuisine, en livraison et en encadrement.</p></div>
      <div className="rank-grid">{rankOptions.map(rank => <article key={rank}><BriefcaseBusiness /><h3>{rank}</h3></article>)}</div>
      <form className="application-form" onSubmit={submit}>
        <h2>Candidature</h2><div className="form-row"><input required placeholder="Nom et prenom" value={form.fullName} onChange={event => setForm({ ...form, fullName: event.target.value })} /><input required placeholder="Telephone" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></div>
        <div className="form-row"><select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}>{rankOptions.map(rank => <option key={rank}>{rank}</option>)}</select><select value={form.restaurant} onChange={event => setForm({ ...form, restaurant: event.target.value })}>{restaurants.map(item => <option key={item.id}>{item.name}</option>)}</select></div>
        <textarea required placeholder="Votre motivation et vos disponibilites" value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} /><button className="primary">Envoyer la candidature</button>{sent && <p className="success-text">Candidature enregistree.</p>}{error && <p className="form-error">{error}</p>}
      </form>
    </main>
  )
}

function AuthPage({ portal, onLogin, onRegister, navigate }) {
  const [register, setRegister] = useState(false)
  const [form, setForm] = useState(portal === 'employee' ? { identifier: 'directeur', password: 'atom' } : { identifier: 'client@atom.sa', password: 'atom', firstName: '', lastName: '', phone: '' })
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault(); setError('')
    try {
      if (register) await onRegister({ email: form.identifier, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone })
      else await onLogin(form.identifier, form.password, portal)
    } catch (err) { setError(err.message) }
  }
  return (
    <main className="auth-page">
      <section className="auth-visual"><Character side="right" /><div><Brand /><h1>{portal === 'employee' ? 'Espace equipe' : 'Votre compte client'}</h1><p>{portal === 'employee' ? 'Commandes, planning, documents et gestion de l’enseigne.' : 'Commandez et suivez la preparation jusqu’a la livraison.'}</p></div></section>
      <form className="auth-card" onSubmit={submit}>
        <button type="button" className="back-link" onClick={() => navigate('home')}><ChevronLeft size={18} />Retour au site</button>
        <LockKeyhole size={38} /><h2>{register ? 'Creer un compte' : 'Connexion'}</h2>
        {register && <div className="form-row"><label>Prenom<input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></label><label>Nom<input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></label></div>}
        <label>{portal === 'employee' ? 'Identifiant ou adresse e-mail' : 'Adresse e-mail'}<input required type={portal === 'employee' ? 'text' : 'email'} value={form.identifier} onChange={e => setForm({ ...form, identifier: e.target.value })} /></label>
        {register && <label>Telephone<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>}
        <label>Mot de passe<input required type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="form-error">{error}</p>}<button className="primary full">{register ? 'Creer mon compte' : 'Se connecter'}</button>
        {portal === 'customer' && <button className="text-button" type="button" onClick={() => setRegister(!register)}>{register ? 'J’ai deja un compte' : 'Creer un compte client'}</button>}
        {isDemoMode && <div className="demo-box"><strong>Acces de demonstration</strong><span>{portal === 'employee' ? 'directeur / atom' : 'client@atom.sa / atom'}</span></div>}
      </form>
    </main>
  )
}

function CustomerAccount({ user, orders, navigate }) {
  const own = orders.filter(order => order.customerId === user.id)
  return (
    <main className="content-section page-top">
      <div className="account-heading"><div><span>Compte client</span><h1>Bonjour {user.firstName || user.first_name}</h1></div><button className="primary" onClick={() => navigate('menu')}><ShoppingBag />Nouvelle commande</button></div>
      <div className="order-history">{!own.length && <div className="empty-card"><PackageCheck /><h2>Aucune commande</h2><p>Vos prochaines commandes apparaitront ici.</p></div>}{own.map(order => <article className="history-card" key={order.id}><header><strong>{order.id}</strong><div className="badge-row"><StatusBadge status={order.status} /><PaymentBadge paid={Boolean(order.paid)} /></div></header><p>{new Date(order.createdAt || order.created_at).toLocaleString('fr-FR')}</p><div>{order.items.map(item => <span key={item.id}>{item.quantity} x {item.name}</span>)}</div><footer><span>{order.address}</span><strong>{money(order.total)}</strong></footer><OrderProgress status={order.status} /></article>)}</div>
    </main>
  )
}

function OrderProgress({ status }) {
  const steps = ['Nouvelle', 'Acceptee', 'En preparation', 'En livraison', 'Terminee']
  const current = status === 'Annulee' ? -1 : steps.indexOf(status)
  return <div className={`order-progress ${status === 'Annulee' ? 'cancelled' : ''}`}>{steps.map((step, index) => <div className={index <= current ? 'done' : ''} key={step}><span /><small>{step}</small></div>)}</div>
}

function StatusBadge({ status }) {
  return <span className={`status status-${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
}

function PaymentBadge({ paid }) {
  return <span className={`payment-badge ${paid ? 'paid' : 'unpaid'}`}><Banknote size={14} />{paid ? 'Payee' : 'Non payee'}</span>
}

function EmployeeLayout({ user, page, navigate, logout, children, newOrders }) {
  const manager = canManage(user)
  const nav = [
    ['employee-dashboard', LayoutDashboard, 'Tableau de bord'], ['employee-orders', ShoppingBag, 'Commandes'], ['employee-calendar', CalendarDays, 'Planning'],
    ['employee-staff', Users, 'Effectifs'], ['employee-documents', FileText, 'Documents'], ['employee-announcements', Bell, 'Annonces'],
    ['employee-clock', Clock3, 'Pointage'], ['employee-cash', Banknote, 'Compta'], ['employee-applications', BriefcaseBusiness, 'Candidatures'], ['employee-admin', Settings, 'Administration'],
  ]
  return (
    <div className="employee-shell">
      <aside className="employee-sidebar">
        <Brand compact />
        <div className="staff-profile"><div className="avatar">{fullName(user).split(' ').map(item => item[0]).join('')}</div><div><strong>{fullName(user)}</strong><span>{user.role}</span></div></div>
        <nav>{nav.filter(([key]) => !['employee-admin', 'employee-applications'].includes(key) || manager).map(([key, Icon, label]) => <button className={page === key ? 'active' : ''} key={key} onClick={() => navigate(key)}><Icon size={19} />{label}{key === 'employee-orders' && newOrders > 0 && <b>{newOrders}</b>}</button>)}</nav>
        <button className="logout-button" onClick={logout}><LogOut />Deconnexion</button>
      </aside>
      <section className="employee-main"><header className="employee-topbar"><div><strong>Centre des operations</strong><span>{isDemoMode ? 'Mode demonstration local' : 'Synchronise avec Supabase'}</span></div><div><Search /><Bell /><ShieldCheck /></div></header>{children}</section>
    </div>
  )
}

function EmployeeDashboard({ user, orders, events, announcements, navigate }) {
  const today = new Date().toISOString().slice(0, 10)
  const active = orders.filter(item => !['Terminee', 'Annulee'].includes(item.status))
  return (
    <EmployeePage title={`Bonjour, ${user.firstName || user.first_name}`} subtitle="Voici les informations importantes du service.">
      <div className="stat-grid"><Stat icon={<ShoppingBag />} label="Nouvelles commandes" value={orders.filter(item => item.status === 'Nouvelle').length} /><Stat icon={<Truck />} label="Livraisons actives" value={active.length} /><Stat icon={<CalendarDays />} label="Evenements aujourd’hui" value={events.filter(item => item.date === today).length} /><Stat icon={<Bell />} label="Annonces" value={announcements.length} /></div>
      <div className="dashboard-grid"><Panel title="Commandes a traiter" action={<button onClick={() => navigate('employee-orders')}>Tout voir</button>}>{active.slice(0, 4).map(order => <div className="dashboard-line" key={order.id}><div><strong>{order.id}</strong><span>{order.customerName || order.customer_name}</span></div><StatusBadge status={order.status} /><b>{money(order.total)}</b></div>)}</Panel><Panel title="Prochains evenements" action={<button onClick={() => navigate('employee-calendar')}>Calendrier</button>}>{events.slice().sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).slice(0, 4).map(event => <div className="event-line" key={event.id}><span>{new Date(`${event.date}T12:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span><div><strong>{event.title}</strong><small>{event.start} - {event.end} · {event.location}</small></div></div>)}</Panel></div>
    </EmployeePage>
  )
}

function EmployeePage({ title, subtitle, action, children }) {
  return <main className="employee-page"><div className="employee-heading"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</main>
}

function Stat({ icon, label, value }) { return <article className="stat-card"><div>{icon}</div><span>{label}</span><strong>{value}</strong></article> }
function Panel({ title, action, children }) { return <section className="dark-panel"><header><h2>{title}</h2>{action}</header>{children}</section> }

function EmployeeOrders({ orders, staff, onUpdate }) {
  const [filter, setFilter] = useState('Actives')
  const [selectedId, setSelectedId] = useState(orders[0]?.id)
  const filtered = orders.filter(item => filter === 'Toutes' || (filter === 'Actives' ? !['Terminee', 'Annulee'].includes(item.status) : item.status === filter))
  const selected = orders.find(item => item.id === selectedId)
  return (
    <EmployeePage title="Commandes" subtitle="File centrale des commandes clients.">
      <div className="order-filters">{['Actives', ...orderStatuses, 'Toutes'].map(item => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="orders-workspace"><div className="orders-list">{filtered.map(order => <button className={selectedId === order.id ? 'active' : ''} onClick={() => setSelectedId(order.id)} key={order.id}><header><strong>{order.id}</strong><StatusBadge status={order.status} /></header><p>{order.customerName || order.customer_name}</p><div className="order-list-meta"><span>{new Date(order.createdAt || order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {money(order.total)}</span><PaymentBadge paid={Boolean(order.paid)} /></div></button>)}{!filtered.length && <div className="empty-state"><PackageCheck /><p>Aucune commande dans cette vue.</p></div>}</div>{selected ? <OrderDetail order={selected} staff={staff} onUpdate={onUpdate} /> : <div className="dark-panel empty-state"><ClipboardList /><p>Selectionnez une commande.</p></div>}</div>
    </EmployeePage>
  )
}

function OrderDetail({ order, staff, onUpdate }) {
  return (
    <section className="order-detail dark-panel">
      <header><div><span>Commande</span><h2>{order.id}</h2></div><div className="badge-row"><StatusBadge status={order.status} /><PaymentBadge paid={Boolean(order.paid)} /></div></header>
      <div className="detail-grid"><div><small>Client</small><strong>{order.customerName || order.customer_name}</strong></div><div><small>Telephone</small><strong>{order.phone}</strong></div></div>
      <div className="address-box"><MapPin /><div><small>Destination</small><strong>{order.address}</strong>{order.note && <span>{order.note}</span>}</div></div>
      <SanAndreasMap compact marker={{ x: order.markerX ?? order.marker_x, y: order.markerY ?? order.marker_y }} />
      <div className="order-items">{order.items.map(item => <div key={item.id}><span>{item.quantity} x {item.name}</span><strong>{money(item.price * item.quantity)}</strong></div>)}<footer><span>Total</span><strong>{money(order.total)}</strong></footer></div>
      <div className="form-row"><label>Statut<select value={order.status} onChange={e => onUpdate(order.id, { status: e.target.value })}>{orderStatuses.map(item => <option key={item}>{item}</option>)}</select></label><label>Paiement<select value={order.paid ? 'paid' : 'unpaid'} onChange={e => onUpdate(order.id, { paid: e.target.value === 'paid' })}><option value="unpaid">Non payee</option><option value="paid">Payee</option></select></label><label>Attribuee a<select value={order.assignedTo || order.assigned_to || ''} onChange={e => onUpdate(order.id, { assignedTo: e.target.value })}><option value="">Non attribuee</option>{staff.map(member => <option value={member.id} key={member.id}>{fullName(member)}</option>)}</select></label></div>
    </section>
  )
}

function CalendarPage({ events, user, staff, onCreate, onUpdate, onDelete }) {
  const [cursor, setCursor] = useState(() => new Date())
  const [editing, setEditing] = useState(null)
  const [newDate, setNewDate] = useState('')
  const year = cursor.getFullYear(); const month = cursor.getMonth()
  const first = new Date(year, month, 1); const days = new Date(year, month + 1, 0).getDate(); const offset = (first.getDay() + 6) % 7
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)]
  const manage = canManage(user)
  return (
    <EmployeePage title="Planning" subtitle="Calendrier commun de l’equipe." action={<button className="primary" onClick={() => { setNewDate(new Date().toISOString().slice(0, 10)); setEditing({}) }}><Plus />Nouvel evenement</button>}>
      <section className="calendar-card"><header><button className="icon-btn" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft /></button><h2>{cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2><button className="icon-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight /></button></header><div className="weekdays">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{cells.map((day, index) => day ? <button className={new Date(year, month, day).toDateString() === new Date().toDateString() ? 'today' : ''} key={index} onClick={() => { setNewDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`); setEditing({}) }}><span>{day}</span>{events.filter(event => event.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`).slice(0, 3).map(event => <i className={`event-${event.type.toLowerCase()}`} key={event.id} onClick={e => { e.stopPropagation(); setEditing(event); setNewDate(event.date) }}>{event.start} {event.title}</i>)}</button> : <div className="blank" key={index} />)}</div></section>
      <section className="upcoming-list"><h2>Evenements a venir</h2>{events.slice().sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).map(event => <article key={event.id}><div className="event-date"><strong>{new Date(`${event.date}T12:00`).getDate()}</strong><span>{new Date(`${event.date}T12:00`).toLocaleDateString('fr-FR', { month: 'short' })}</span></div><div><h3>{event.title}</h3><p>{event.start} - {event.end} · {event.location}</p></div><StatusBadge status={event.type} /><button className="icon-btn" onClick={() => { setEditing(event); setNewDate(event.date) }}><Pencil /></button></article>)}</section>
      {editing && <EventModal event={editing} initialDate={newDate} canDelete={manage || editing.authorId === user.id} onClose={() => setEditing(null)} onSave={async form => { editing.id ? await onUpdate(editing.id, form) : await onCreate({ ...form, id: uid('event'), authorId: user.id }); setEditing(null) }} onDelete={async () => { await onDelete(editing.id); setEditing(null) }} />}
    </EmployeePage>
  )
}

function EventModal({ event, initialDate, canDelete, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ title: event.title || '', date: event.date || initialDate, start: event.start || '18:00', end: event.end || '19:00', type: event.type || 'Service', location: event.location || '', notes: event.notes || '' })
  return <Modal title={event.id ? 'Modifier l’evenement' : 'Nouvel evenement'} onClose={onClose}><form className="modal-form" onSubmit={e => { e.preventDefault(); onSave(form) }}><label>Titre<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label><div className="form-row"><label>Date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label><label>Type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{['Service', 'Reunion', 'Formation', 'Animation', 'Livraison'].map(item => <option key={item}>{item}</option>)}</select></label></div><div className="form-row"><label>Debut<input type="time" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} /></label><label>Fin<input type="time" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} /></label></div><label>Lieu<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label><label>Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label><div className="modal-actions">{event.id && canDelete && <button type="button" className="danger-button" onClick={onDelete}><Trash2 />Supprimer</button>}<button className="primary">Enregistrer</button></div></form></Modal>
}

function StaffPage({ staff }) {
  return <EmployeePage title="Effectifs" subtitle={`${staff.length} membres dans l’equipe.`}><div className="staff-grid">{staff.map(member => <article className="staff-card" key={member.id}><div className="avatar">{fullName(member).split(' ').map(item => item[0]).join('')}</div><h3>{fullName(member)}</h3><p>{member.role}</p><small>{member.restaurant || 'Restaurant non renseigne'}</small></article>)}</div></EmployeePage>
}

function DocumentsPage({ documents }) { return <EmployeePage title="Documents" subtitle="Procedures et ressources internes."><div className="document-grid">{documents.map(document => <article className="document-card" key={document.id}><FileText /><span>{document.type}</span><h3>{document.title}</h3><p>Acces : {document.access}</p><button>Ouvrir</button></article>)}</div></EmployeePage> }
function AnnouncementsPage({ announcements, canCreate, onCreate }) {
  const [creating, setCreating] = useState(false)
  return <EmployeePage title="Annonces" subtitle="Informations diffusees a toute l’equipe." action={canCreate ? <button className="primary" onClick={() => setCreating(true)}><Plus />Nouvelle annonce</button> : null}><div className="announcement-list">{announcements.map(item => <article key={item.id}><header><h3>{item.title}</h3><span>{item.priority}</span></header><p>{item.body}</p><small>{new Date(item.date).toLocaleDateString('fr-FR')}</small></article>)}</div>{creating && <AnnouncementModal onClose={() => setCreating(false)} onSave={async form => { await onCreate({ ...form, id: uid('announcement'), date: new Date().toISOString() }); setCreating(false) }} />}</EmployeePage>
}

function AnnouncementModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', body: '', priority: 'Normale' })
  return <Modal title="Nouvelle annonce" onClose={onClose}><form className="modal-form" onSubmit={event => { event.preventDefault(); onSave(form) }}><label>Titre<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>Priorite<select value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value })}><option>Normale</option><option>Haute</option><option>Information</option></select></label><label>Contenu<textarea required value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} /></label><button className="primary"><Save />Publier</button></form></Modal>
}

function ApplicationsPage({ applications, onUpdate }) {
  const [filter, setFilter] = useState('Toutes')
  const statuses = ['Nouvelle', 'A contacter', 'Entretien', 'Acceptee', 'Refusee']
  const filtered = applications.filter(item => filter === 'Toutes' || (item.status || 'Nouvelle') === filter)
  return (
    <EmployeePage title="Candidatures" subtitle="Demandes envoyees depuis le site public.">
      <div className="order-filters">{['Toutes', ...statuses].map(status => <button className={filter === status ? 'active' : ''} key={status} onClick={() => setFilter(status)}>{status}</button>)}</div>
      <div className="application-admin-list">
        {!filtered.length && <div className="dark-panel empty-state"><BriefcaseBusiness /><p>Aucune candidature dans cette vue.</p></div>}
        {filtered.map(application => (
          <article className="application-admin-card" key={application.id}>
            <header>
              <div>
                <h3>{application.fullName || application.full_name || 'Candidat sans nom'}</h3>
                <span>{application.role || 'Poste non precise'} · {application.restaurant || 'Restaurant non precise'}</span>
              </div>
              <select value={application.status || 'Nouvelle'} onChange={event => onUpdate(application.id, { status: event.target.value })}>{statuses.map(status => <option key={status}>{status}</option>)}</select>
            </header>
            <dl>
              <div><dt>Telephone</dt><dd>{application.phone || '-'}</dd></div>
              <div><dt>Date</dt><dd>{new Date(application.createdAt || application.created_at || Date.now()).toLocaleString('fr-FR')}</dd></div>
            </dl>
            <p>{application.message}</p>
          </article>
        ))}
      </div>
    </EmployeePage>
  )
}

function ClockPage({ user, entries, onSubmit }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), hours: '', comment: '' })
  const ownEntries = entries.filter(entry => entry.employeeId === user.id || entry.employee_id === user.id)
  const submit = async event => {
    event.preventDefault()
    await onSubmit({ id: uid('hours'), employeeId: user.id, date: form.date, hours: Number(form.hours), comment: form.comment, createdAt: new Date().toISOString() })
    setForm({ date: new Date().toISOString().slice(0, 10), hours: '', comment: '' })
  }
  return <EmployeePage title="Mes heures" subtitle="Declare simplement le nombre d’heures effectuees."><div className="hours-layout"><form className="hours-form" onSubmit={submit}><Clock3 /><h2>Nouvelle declaration</h2><label>Date<input required type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></label><label>Nombre d’heures<input required min="0.25" max="24" step="0.25" type="number" placeholder="Ex. 7.5" value={form.hours} onChange={event => setForm({ ...form, hours: event.target.value })} /></label><label>Commentaire<textarea placeholder="Facultatif" value={form.comment} onChange={event => setForm({ ...form, comment: event.target.value })} /></label><button className="primary"><Save />Enregistrer mes heures</button></form><section className="hours-history"><h2>Mes dernieres declarations</h2>{!ownEntries.length && <p>Aucune heure declaree.</p>}{ownEntries.slice(0, 12).map(entry => <article key={entry.id}><div><strong>{Number(entry.hours).toLocaleString('fr-FR')} h</strong><span>{new Date(`${entry.date}T12:00`).toLocaleDateString('fr-FR')}</span></div><p>{entry.comment || 'Aucun commentaire'}</p></article>)}</section></div></EmployeePage>
}

function CashPage({ user, entries, onSubmit }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: '', method: 'Especes', note: '' })
  const ownEntries = entries.filter(entry => entry.employeeId === user.id || entry.employee_id === user.id)
  const submit = async event => {
    event.preventDefault()
    await onSubmit({ id: uid('cash'), employeeId: user.id, employeeName: fullName(user), date: form.date, amount: Number(form.amount), method: form.method, note: form.note, createdAt: new Date().toISOString() })
    setForm({ date: new Date().toISOString().slice(0, 10), amount: '', method: 'Especes', note: '' })
  }
  return <EmployeePage title="Compta" subtitle="Declare les encaissements faits hors commande du site."><div className="hours-layout"><form className="hours-form" onSubmit={submit}><Banknote /><h2>Nouvel encaissement</h2><label>Date<input required type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} /></label><label>Montant<input required min="0.01" step="0.01" type="number" placeholder="Ex. 250" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} /></label><label>Moyen de paiement<select value={form.method} onChange={event => setForm({ ...form, method: event.target.value })}><option>Especes</option><option>Carte</option><option>Virement</option><option>Autre</option></select></label><label>Note<textarea placeholder="Ex. vente comptoir, evenement, livraison directe..." value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} /></label><button className="primary"><Save />Enregistrer l’encaissement</button></form><section className="hours-history"><h2>Mes derniers encaissements</h2>{!ownEntries.length && <p>Aucun encaissement declare.</p>}{ownEntries.slice(0, 12).map(entry => <article key={entry.id}><div><strong>{money(entry.amount)}</strong><span>{new Date(`${entry.date}T12:00`).toLocaleDateString('fr-FR')} · {entry.method}</span></div><p>{entry.note || 'Aucune note'}</p></article>)}</section></div></EmployeePage>
}

function TaxDocumentPanel({ orders }) {
  const [count, setCount] = useState(25)
  const sortedOrders = useMemo(() => orders.slice().sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)), [orders])
  const selectedOrders = sortedOrders.slice(0, count)
  const total = selectedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const paidTotal = selectedOrders.filter(order => order.paid).reduce((sum, order) => sum + Number(order.total || 0), 0)
  const unpaidTotal = total - paidTotal
  const clean = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]))
  const generateDocument = () => {
    const rows = selectedOrders.map(order => {
      const items = Array.isArray(order.items) ? order.items.map(item => `${item.quantity} x ${item.name}`).join(', ') : ''
      return `<tr><td>${clean(order.id)}</td><td>${clean(new Date(order.createdAt || order.created_at || Date.now()).toLocaleString('fr-FR'))}</td><td>${clean(order.customerName || order.customer_name)}</td><td>${clean(items)}</td><td>${clean(order.paid ? 'Payee' : 'Non payee')}</td><td>${clean(money(order.total))}</td></tr>`
    }).join('')
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Declaration impots Up-n-Atom</title><style>body{font-family:Arial,sans-serif;margin:36px;color:#1a120f}h1{color:#c70d22}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:9px;text-align:left;font-size:12px}th{background:#f5ead8}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.summary div{border:1px solid #ddd;padding:12px;background:#fff8e4}.sign{margin-top:40px}</style></head><body><h1>Declaration d'impot - Up-n-Atom Hamburgers</h1><p>Document genere le ${clean(new Date().toLocaleString('fr-FR'))} avec les ${selectedOrders.length} dernieres commandes.</p><section class="summary"><div><strong>Total commandes</strong><br>${clean(money(total))}</div><div><strong>Total paye</strong><br>${clean(money(paidTotal))}</div><div><strong>Total non paye</strong><br>${clean(money(unpaidTotal))}</div></section><table><thead><tr><th>Commande</th><th>Date</th><th>Client</th><th>Articles</th><th>Paiement</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="sign"><p>Responsable : __________________________</p><p>Signature : ____________________________</p></div></body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `declaration-impots-upnatom-${new Date().toISOString().slice(0, 10)}.html`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <section className="tax-panel">
      <div>
        <FileText />
        <h2>Declaration d’impot</h2>
        <p>Genere un document deja rempli avec les dernieres commandes, leur total et leur etat de paiement.</p>
      </div>
      <label>Nombre de commandes a inclure<input min="1" max="100" type="number" value={count} onChange={event => setCount(Math.min(100, Math.max(1, Number(event.target.value) || 1)))} /></label>
      <div className="tax-stats"><article><span>Commandes</span><strong>{selectedOrders.length}</strong></article><article><span>Total</span><strong>{money(total)}</strong></article><article><span>Non paye</span><strong>{money(unpaidTotal)}</strong></article></div>
      <button className="primary" disabled={!selectedOrders.length} onClick={generateDocument}><FileText />Generer le document</button>
    </section>
  )
}

function RevenuePanel({ staff, orders, cashEntries }) {
  const rows = staff.map(member => {
    const cashTotal = cashEntries.filter(entry => entry.employeeId === member.id || entry.employee_id === member.id).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const orderTotal = orders.filter(order => Boolean(order.paid) && (order.assignedTo === member.id || order.assigned_to === member.id)).reduce((sum, order) => sum + Number(order.total || 0), 0)
    return { member, cashTotal, orderTotal, total: cashTotal + orderTotal }
  }).sort((a, b) => b.total - a.total)
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)
  return (
    <section className="revenue-panel">
      <header><div><Banknote /><h2>Chiffre par employe</h2><p>Classement base sur les encaissements hors commande et les commandes payees attribuees.</p></div><strong>{money(grandTotal)}</strong></header>
      <div className="revenue-ranking">{rows.map((row, index) => <article key={row.member.id}><span>#{index + 1}</span><div><strong>{fullName(row.member)}</strong><small>{row.member.role}</small></div><dl><div><dt>Hors commande</dt><dd>{money(row.cashTotal)}</dd></div><div><dt>Commandes</dt><dd>{money(row.orderTotal)}</dd></div><div><dt>Total</dt><dd>{money(row.total)}</dd></div></dl></article>)}</div>
    </section>
  )
}

function AdminPage({ menu, staff, customers, orders, cashEntries, restaurants, promotions, settings, createMenuItem, updateMenuItem, deleteMenuItem, createStaff, updateStaffMember, deleteStaff, updateCustomerMember, createPromotion, updatePromotion, deletePromotion, saveRestaurants, saveSettings }) {
  const [tab, setTab] = useState('menu')
  const emptyStaff = { firstName: '', lastName: '', username: '', email: '', password: '', role: 'Equipier polyvalent', position: '', restaurant: '', phone: '', iban: '' }
  const emptyMenuItem = { category: 'Menus', name: '', description: '', price: '', imageUrl: '', available: true, featured: false }
  const emptyPromotion = { title: '', offer: '', description: '', active: true }
  const [draftStaff, setDraftStaff] = useState(emptyStaff)
  const [draftMenu, setDraftMenu] = useState(emptyMenuItem)
  const [draftPromotion, setDraftPromotion] = useState(emptyPromotion)
  const [editingMenu, setEditingMenu] = useState(null)
  const [editingStaff, setEditingStaff] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const toggleMenu = item => updateMenuItem(item.id, { available: !item.available })
  const addMenu = async event => {
    event.preventDefault()
    await createMenuItem({ ...draftMenu, id: uid('item'), price: Number(draftMenu.price) })
    setDraftMenu(emptyMenuItem)
  }
  const addStaff = async event => { event.preventDefault(); await createStaff(draftStaff); setDraftStaff(emptyStaff) }
  const addPromotion = async event => {
    event.preventDefault()
    await createPromotion({ ...draftPromotion, id: uid('promo') })
    setDraftPromotion(emptyPromotion)
  }
  return (
    <EmployeePage title="Administration" subtitle="Gestion du service et des contenus.">
      {isDemoMode && <div className="shared-warning"><ShieldCheck /><div><strong>Donnees locales</strong><span>Connectez Supabase pour partager automatiquement les comptes et commandes entre tous les utilisateurs.</span></div></div>}
      <div className="admin-tabs">{[['menu', 'Produits'], ['staff', 'Employes'], ['customers', 'Clients'], ['revenue', 'Chiffre'], ['restaurants', 'Restaurants'], ['promotions', 'Promotions'], ['service', 'Ouverture'], ['taxes', 'Impots']].map(([key, label]) => <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
      {tab === 'menu' && <><form className="admin-form" onSubmit={addMenu}><h2>Ajouter un produit ou menu</h2><div className="form-row"><select value={draftMenu.category} onChange={e => setDraftMenu({ ...draftMenu, category: e.target.value })}>{categories.map(item => <option key={item}>{item}</option>)}</select><input required placeholder="Nom du produit" value={draftMenu.name} onChange={e => setDraftMenu({ ...draftMenu, name: e.target.value })} /></div><label>Description<textarea required value={draftMenu.description} onChange={e => setDraftMenu({ ...draftMenu, description: e.target.value })} /></label><label>Image du produit ou menu<input placeholder="URL de l’image, ex. /assets/burger.png" value={draftMenu.imageUrl} onChange={e => setDraftMenu({ ...draftMenu, imageUrl: e.target.value })} /></label><div className="form-row"><input required min="0" step="0.1" type="number" placeholder="Prix" value={draftMenu.price} onChange={e => setDraftMenu({ ...draftMenu, price: e.target.value })} /><label className="check-line"><input type="checkbox" checked={draftMenu.featured} onChange={e => setDraftMenu({ ...draftMenu, featured: e.target.checked })} />Produit signature</label></div><button className="primary"><Plus />Ajouter a la carte</button></form><div className="admin-list editable-list">{menu.map(item => <article key={item.id}><div><strong>{item.name}</strong><span>{item.category} · {money(item.price)} · {item.available ? 'Disponible' : 'Indisponible'}{(item.imageUrl || item.image_url) ? ' · Image' : ''}</span></div><div className="admin-actions"><label className="switch"><input type="checkbox" checked={item.available} onChange={() => toggleMenu(item)} /><span /></label><button onClick={() => setEditingMenu(item)}><Pencil />Modifier</button><button className="danger-icon" onClick={() => deleteMenuItem(item.id)}><Trash2 /></button></div></article>)}</div></>}
      {tab === 'staff' && <><form className="admin-form" onSubmit={addStaff}><h2>Creer un compte employe</h2><div className="form-row"><input required placeholder="Prenom" value={draftStaff.firstName} onChange={e => setDraftStaff({ ...draftStaff, firstName: e.target.value })} /><input required placeholder="Nom" value={draftStaff.lastName} onChange={e => setDraftStaff({ ...draftStaff, lastName: e.target.value })} /></div><div className="form-row"><input required placeholder="Identifiant" value={draftStaff.username} onChange={e => setDraftStaff({ ...draftStaff, username: e.target.value })} /><input required type="email" placeholder="E-mail" value={draftStaff.email} onChange={e => setDraftStaff({ ...draftStaff, email: e.target.value })} /></div><div className="form-row"><input required placeholder="Mot de passe temporaire" value={draftStaff.password} onChange={e => setDraftStaff({ ...draftStaff, password: e.target.value })} /><select value={draftStaff.role} onChange={e => setDraftStaff({ ...draftStaff, role: e.target.value })}>{rankOptions.map(item => <option key={item}>{item}</option>)}</select></div><div className="form-row"><input placeholder="Poste" value={draftStaff.position} onChange={e => setDraftStaff({ ...draftStaff, position: e.target.value })} /><select value={draftStaff.restaurant} onChange={e => setDraftStaff({ ...draftStaff, restaurant: e.target.value })}><option value="">Restaurant</option>{restaurants.map(item => <option key={item.id}>{item.name}</option>)}</select></div><div className="form-row"><input placeholder="Telephone" value={draftStaff.phone} onChange={e => setDraftStaff({ ...draftStaff, phone: e.target.value })} /><input placeholder="IBAN" value={draftStaff.iban} onChange={e => setDraftStaff({ ...draftStaff, iban: e.target.value })} /></div><button className="primary"><Plus />Creer le compte</button></form><div className="people-admin-grid">{staff.map(item => <article className="person-admin-card" key={item.id}><header><div className="avatar">{fullName(item).split(' ').map(part => part[0]).join('')}</div><div><h3>{fullName(item)}</h3><span>{item.role}</span></div></header><dl><div><dt>Poste</dt><dd>{item.position || '-'}</dd></div><div><dt>Restaurant</dt><dd>{item.restaurant || '-'}</dd></div><div><dt>Telephone</dt><dd>{item.phone || '-'}</dd></div><div><dt>E-mail</dt><dd>{item.email}</dd></div><div className="full"><dt>IBAN</dt><dd>{item.iban || 'Non renseigne'}</dd></div></dl><footer><button onClick={() => setEditingStaff(item)}><Pencil />Modifier</button><button className="danger-icon" onClick={() => deleteStaff(item)}><Trash2 /></button></footer></article>)}</div></>}
      {tab === 'customers' && <div className="people-admin-grid">{customers.map(customer => { const history = orders.filter(order => order.customerId === customer.id || order.customer_id === customer.id); return <article className="person-admin-card customer" key={customer.id}><header><div className="avatar">{fullName(customer).split(' ').map(part => part[0]).join('')}</div><div><h3>{fullName(customer)}</h3><span>{history.length} commande{history.length > 1 ? 's' : ''}</span></div></header><dl><div><dt>Telephone</dt><dd>{customer.phone || '-'}</dd></div><div><dt>E-mail</dt><dd>{customer.email}</dd></div><div className="full"><dt>Adresse</dt><dd>{customer.address || 'Non renseignee'}</dd></div><div className="full"><dt>Total commande</dt><dd>{money(history.reduce((sum, order) => sum + Number(order.total), 0))}</dd></div></dl><footer><button onClick={() => setEditingCustomer(customer)}><Pencil />Modifier</button></footer></article> })}</div>}
      {tab === 'revenue' && <RevenuePanel staff={staff} orders={orders} cashEntries={cashEntries} />}
      {tab === 'restaurants' && <div className="admin-list">{restaurants.map(item => <article key={item.id}><div><strong>{item.name}</strong><span>{item.hours} · {item.phone}</span></div><label className="switch"><input type="checkbox" checked={item.active} onChange={() => saveRestaurants(restaurants.map(row => row.id === item.id ? { ...row, active: !row.active } : row))} /><span /></label></article>)}</div>}
      {tab === 'promotions' && <><form className="admin-form" onSubmit={addPromotion}><h2>Ajouter une promotion</h2><div className="form-row"><input required placeholder="Titre" value={draftPromotion.title} onChange={e => setDraftPromotion({ ...draftPromotion, title: e.target.value })} /><input placeholder="Offre, ex. -20 %" value={draftPromotion.offer} onChange={e => setDraftPromotion({ ...draftPromotion, offer: e.target.value })} /></div><label>Description<textarea required value={draftPromotion.description} onChange={e => setDraftPromotion({ ...draftPromotion, description: e.target.value })} /></label><label className="check-line"><input type="checkbox" checked={draftPromotion.active} onChange={e => setDraftPromotion({ ...draftPromotion, active: e.target.checked })} />Promotion active</label><button className="primary"><Plus />Ajouter la promotion</button></form><div className="admin-list editable-list">{promotions.map(item => <article key={item.id}><div><strong>{item.title}</strong><span>{item.offer} · {item.description} · {item.active ? 'Active' : 'Inactive'}</span></div><div className="admin-actions"><label className="switch"><input type="checkbox" checked={item.active} onChange={() => updatePromotion(item.id, { active: !item.active })} /><span /></label><button onClick={() => setEditingPromotion(item)}><Pencil />Modifier</button><button className="danger-icon" onClick={() => deletePromotion(item.id)}><Trash2 /></button></div></article>)}</div></>}
      {tab === 'service' && <section className={`open-control ${settings.acceptingOrders ? 'is-open' : 'is-closed'}`}><div className="open-indicator"><span /><strong>{settings.acceptingOrders ? 'Restaurant ouvert' : 'Restaurant ferme'}</strong></div><p>Ce bouton autorise ou bloque immediatement les nouvelles commandes.</p><button className={settings.acceptingOrders ? 'close-button' : 'open-button'} onClick={() => saveSettings({ acceptingOrders: !settings.acceptingOrders })}>{settings.acceptingOrders ? 'Fermer le restaurant' : 'Ouvrir le restaurant'}</button></section>}
      {tab === 'taxes' && <TaxDocumentPanel orders={orders} />}
      {editingStaff && <EmployeeEditModal employee={editingStaff} restaurants={restaurants} onClose={() => setEditingStaff(null)} onSave={async values => { await updateStaffMember(editingStaff.id, values); setEditingStaff(null) }} />}
      {editingMenu && <MenuEditModal item={editingMenu} onClose={() => setEditingMenu(null)} onSave={async values => { await updateMenuItem(editingMenu.id, values); setEditingMenu(null) }} />}
      {editingPromotion && <PromotionEditModal promotion={editingPromotion} onClose={() => setEditingPromotion(null)} onSave={async values => { await updatePromotion(editingPromotion.id, values); setEditingPromotion(null) }} />}
      {editingCustomer && <CustomerEditModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} onSave={async values => { await updateCustomerMember(editingCustomer.id, values); setEditingCustomer(null) }} />}
    </EmployeePage>
  )
}

function MenuEditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({ category: item.category, name: item.name, description: item.description || '', imageUrl: item.imageUrl || item.image_url || '', price: item.price, available: item.available, featured: item.featured })
  return <Modal title="Modifier le produit" onClose={onClose}><form className="modal-form" onSubmit={event => { event.preventDefault(); onSave({ ...form, price: Number(form.price) }) }}><label>Categorie<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })}>{categories.map(category => <option key={category}>{category}</option>)}</select></label><label>Nom<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label><label>Description<textarea required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label><label>Image du produit ou menu<input placeholder="URL de l’image" value={form.imageUrl} onChange={event => setForm({ ...form, imageUrl: event.target.value })} /></label><div className="form-row"><label>Prix<input required min="0" step="0.1" type="number" value={form.price} onChange={event => setForm({ ...form, price: event.target.value })} /></label><label className="check-line"><input type="checkbox" checked={form.available} onChange={event => setForm({ ...form, available: event.target.checked })} />Disponible</label></div><label className="check-line"><input type="checkbox" checked={form.featured} onChange={event => setForm({ ...form, featured: event.target.checked })} />Produit signature</label><button className="primary"><Save />Enregistrer</button></form></Modal>
}

function PromotionEditModal({ promotion, onClose, onSave }) {
  const [form, setForm] = useState({ title: promotion.title || '', offer: promotion.offer || '', description: promotion.description || '', active: promotion.active })
  return <Modal title="Modifier la promotion" onClose={onClose}><form className="modal-form" onSubmit={event => { event.preventDefault(); onSave(form) }}><label>Titre<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>Offre<input placeholder="Ex. -20 %, 1 achete = 1 offert" value={form.offer} onChange={event => setForm({ ...form, offer: event.target.value })} /></label><label>Description<textarea required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label><label className="check-line"><input type="checkbox" checked={form.active} onChange={event => setForm({ ...form, active: event.target.checked })} />Promotion active</label><button className="primary"><Save />Enregistrer</button></form></Modal>
}

function EmployeeEditModal({ employee, restaurants, onClose, onSave }) {
  const [form, setForm] = useState({ firstName: employee.firstName || employee.first_name || '', lastName: employee.lastName || employee.last_name || '', email: employee.email || '', phone: employee.phone || '', role: employee.role || '', position: employee.position || '', restaurant: employee.restaurant || '', iban: employee.iban || '' })
  return <Modal title="Modifier l’employe" onClose={onClose}><form className="modal-form" onSubmit={event => { event.preventDefault(); onSave(form) }}><div className="form-row"><label>Prenom<input value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} /></label><label>Nom<input value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} /></label></div><label>Grade<select value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}>{rankOptions.map(item => <option key={item}>{item}</option>)}</select></label><label>Poste<input value={form.position} onChange={event => setForm({ ...form, position: event.target.value })} /></label><label>Restaurant<select value={form.restaurant} onChange={event => setForm({ ...form, restaurant: event.target.value })}><option value="">Non renseigne</option>{restaurants.map(item => <option key={item.id}>{item.name}</option>)}</select></label><div className="form-row"><label>Telephone<input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label><label>E-mail<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label></div><label>IBAN<input value={form.iban} onChange={event => setForm({ ...form, iban: event.target.value })} /></label><button className="primary"><Save />Enregistrer</button></form></Modal>
}

function CustomerEditModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({ firstName: customer.firstName || customer.first_name || '', lastName: customer.lastName || customer.last_name || '', email: customer.email || '', phone: customer.phone || '', address: customer.address || '' })
  return <Modal title="Modifier le client" onClose={onClose}><form className="modal-form" onSubmit={event => { event.preventDefault(); onSave(form) }}><div className="form-row"><label>Prenom<input value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} /></label><label>Nom<input value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} /></label></div><label>E-mail<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label><label>Telephone<input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label><label>Adresse<textarea value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label><button className="primary"><Save />Enregistrer</button></form></Modal>
}

function PublicFooter({ navigate }) {
  return <footer className="public-footer"><Brand compact /><div><strong>Up-n-Atom Hamburgers</strong><p>Los Santos · Blaine County · San Andreas</p></div><nav><button onClick={() => navigate('menu')}>La carte</button><button onClick={() => navigate('restaurants')}>Restaurants</button><button onClick={() => navigate('employee-login')}>Espace equipe</button></nav></footer>
}

export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem('atom:user')) } catch { return null } })
  const [cart, setCart] = useState([])
  const [menu, setMenu] = useState(menuSeed)
  const [restaurants, setRestaurants] = useState(restaurantsSeed)
  const [staff, setStaff] = useState(staffSeed)
  const [customers, setCustomers] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [cashEntries, setCashEntries] = useState([])
  const [events, setEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [announcements, setAnnouncements] = useState(announcementsSeed)
  const [documents, setDocuments] = useState(docsSeed)
  const [promotions, setPromotions] = useState(promotionsSeed)
  const [applications, setApplications] = useState([])
  const [settings, setSettings] = useState({ acceptingOrders: true })
  const [toast, setToast] = useState('')

  const refresh = async () => {
    try {
      const [m, r, s, e, o, a, d, p, h, cash, apps, c] = await Promise.all([...['menu', 'restaurants', 'staff', 'events', 'orders', 'announcements', 'documents', 'promotions', 'time_entries', 'cash_entries', 'applications'].map(loadCollection), loadCustomers()])
      setMenu(m); setRestaurants(r); setStaff(s); setEvents(e); setOrders(o); setAnnouncements(a); setDocuments(d); setPromotions(p); setTimeEntries(h); setCashEntries(cash); setApplications(apps); setCustomers(c)
      setSettings(await loadSettings())
    } catch (error) { console.error(error); setToast('Certaines donnees n’ont pas pu etre chargees.') }
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    const localRefresh = () => refresh()
    window.addEventListener('storage', localRefresh)
    window.addEventListener('atom:data', localRefresh)
    if (!supabase) return () => { window.removeEventListener('storage', localRefresh); window.removeEventListener('atom:data', localRefresh) }

    const channel = supabase.channel('upnatom-live')
    ;['orders', 'staff', 'profiles', 'events', 'announcements', 'documents', 'time_entries', 'cash_entries', 'applications', 'menu', 'restaurants', 'promotions', 'settings'].forEach(table => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, localRefresh)
    })
    channel.subscribe()
    return () => {
      window.removeEventListener('storage', localRefresh)
      window.removeEventListener('atom:data', localRefresh)
      supabase.removeChannel(channel)
    }
  }, [])

  const navigate = next => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const login = async (identifier, password, portal) => {
    const account = await signIn(identifier, password, portal); setUser(account); sessionStorage.setItem('atom:user', JSON.stringify(account)); navigate(portal === 'employee' ? 'employee-dashboard' : 'account')
  }
  const register = async form => { const account = await signUpCustomer(form); setUser(account); setCustomers(current => [account, ...current]); sessionStorage.setItem('atom:user', JSON.stringify(account)); navigate('account'); setToast('Votre compte client est pret.') }
  const logout = async () => { await signOut(); setUser(null); sessionStorage.removeItem('atom:user'); navigate('home') }
  const placeOrder = async form => {
    await insertRecord('orders', form)
    await updateCustomer(form.customerId, { phone: form.phone, address: form.address })
    setOrders(current => [form, ...current]); setCustomers(current => current.map(item => item.id === form.customerId ? { ...item, phone: form.phone, address: form.address } : item))
    setCart([]); navigate('account'); setToast(`Commande ${form.id} envoyee.`)
  }
  const updateOrder = async (id, patch) => { await updateRecord('orders', id, patch); setOrders(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); setToast('Commande mise a jour.') }
  const createEvent = async form => { await insertRecord('events', form); setEvents(current => [form, ...current]); setToast('Evenement ajoute au planning.') }
  const changeEvent = async (id, patch) => { await updateRecord('events', id, patch); setEvents(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); setToast('Evenement modifie.') }
  const removeEvent = async id => { await deleteRecord('events', id); setEvents(current => current.filter(item => item.id !== id)); setToast('Evenement supprime.') }
  const createAnnouncement = async form => { await insertRecord('announcements', form); setAnnouncements(current => [form, ...current]); setToast('Annonce publiee.') }
  const submitApplication = async form => { await insertRecord('applications', form); setApplications(current => [form, ...current]); setToast('Candidature envoyee.') }
  const updateApplication = async (id, patch) => { await updateRecord('applications', id, patch); setApplications(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); setToast('Candidature mise a jour.') }
  const submitHours = async form => { await insertRecord('time_entries', form); setTimeEntries(current => [form, ...current]); setToast('Heures enregistrees.') }
  const submitCash = async form => { await insertRecord('cash_entries', form); setCashEntries(current => [form, ...current]); setToast('Encaissement enregistre.') }
  const saveLocalList = (collection, setter) => async value => { await replaceCollection(collection, value); setter(value); setToast('Modifications enregistrees.') }
  const saveSettings = async value => { await updateSettings(value); setSettings(value); setToast('Etat du service mis a jour.') }
  const createMenuItem = async form => { await insertRecord('menu', form); setMenu(current => [form, ...current]); setToast('Produit ajoute a la carte.') }
  const updateMenuItem = async (id, patch) => { await updateRecord('menu', id, patch); setMenu(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); setToast('Produit mis a jour.') }
  const deleteMenuItem = async id => { await deleteRecord('menu', id); setMenu(current => current.filter(item => item.id !== id)); setToast('Produit supprime.') }
  const createPromotion = async form => { await insertRecord('promotions', form); setPromotions(current => [form, ...current]); setToast('Promotion ajoutee.') }
  const updatePromotion = async (id, patch) => { await updateRecord('promotions', id, patch); setPromotions(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); setToast('Promotion mise a jour.') }
  const deletePromotion = async id => { await deleteRecord('promotions', id); setPromotions(current => current.filter(item => item.id !== id)); setToast('Promotion supprimee.') }
  const createStaff = async form => { const employee = await createEmployee(form); setStaff(current => [...current, employee]); setToast('Compte employe cree.') }
  const updateStaffMember = async (id, patch) => {
    const currentStaff = staff.find(item => item.id === id) || {}
    const values = { ...currentStaff, ...patch, permissions: isManagerRole(patch.role) ? ['calendar', 'orders', 'admin'] : ['calendar', 'orders'] }
    const saved = await updateEmployee(values); setStaff(current => current.map(item => item.id === id ? { ...item, ...saved } : item)); setToast('Fiche employe mise a jour.')
  }
  const deleteStaff = async employee => { await removeEmployee(employee); setStaff(current => current.filter(item => item.id !== employee.id)); setToast('Compte employe supprime.') }
  const updateCustomerMember = async (id, patch) => { await updateCustomer(id, patch); setCustomers(current => current.map(item => item.id === id ? { ...item, ...patch } : item)); setToast('Fiche client mise a jour.') }

  const employeePage = page.startsWith('employee-') && !['employee-login'].includes(page)
  if (employeePage && user?.roleType !== 'employee') return <AuthPage portal="employee" onLogin={login} navigate={navigate} />
  if (employeePage && user?.roleType === 'employee') {
    let content = <EmployeeDashboard user={user} orders={orders} events={events} announcements={announcements} navigate={navigate} />
    if (page === 'employee-orders') content = <EmployeeOrders orders={orders} staff={staff} onUpdate={updateOrder} />
    if (page === 'employee-calendar') content = <CalendarPage events={events} user={user} staff={staff} onCreate={createEvent} onUpdate={changeEvent} onDelete={removeEvent} />
    if (page === 'employee-staff') content = <StaffPage staff={staff} />
    if (page === 'employee-documents') content = <DocumentsPage documents={documents} />
    if (page === 'employee-announcements') content = <AnnouncementsPage announcements={announcements} canCreate={canManage(user)} onCreate={createAnnouncement} />
    if (page === 'employee-clock') content = <ClockPage user={user} entries={timeEntries} onSubmit={submitHours} />
    if (page === 'employee-cash') content = <CashPage user={user} entries={cashEntries} onSubmit={submitCash} />
    if (page === 'employee-applications') content = canManage(user) ? <ApplicationsPage applications={applications} onUpdate={updateApplication} /> : <EmployeeDashboard user={user} orders={orders} events={events} announcements={announcements} navigate={navigate} />
    if (page === 'employee-admin') content = canManage(user) ? <AdminPage menu={menu} staff={staff} customers={customers} orders={orders} cashEntries={cashEntries} restaurants={restaurants} promotions={promotions} settings={settings} createMenuItem={createMenuItem} updateMenuItem={updateMenuItem} deleteMenuItem={deleteMenuItem} createStaff={createStaff} updateStaffMember={updateStaffMember} deleteStaff={deleteStaff} updateCustomerMember={updateCustomerMember} createPromotion={createPromotion} updatePromotion={updatePromotion} deletePromotion={deletePromotion} saveRestaurants={saveLocalList('restaurants', setRestaurants)} saveSettings={saveSettings} /> : <EmployeeDashboard user={user} orders={orders} events={events} announcements={announcements} navigate={navigate} />
    return <><EmployeeLayout user={user} page={page} navigate={navigate} logout={logout} newOrders={orders.filter(item => item.status === 'Nouvelle').length}>{content}</EmployeeLayout>{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
  }

  if (page === 'customer-login') return <AuthPage portal="customer" onLogin={login} onRegister={register} navigate={navigate} />
  if (page === 'employee-login') return <AuthPage portal="employee" onLogin={login} navigate={navigate} />

  let content = <Home navigate={navigate} promotions={promotions} />
  if (page === 'menu') content = <MenuPage menu={menu} cart={cart} setCart={setCart} user={user?.roleType === 'customer' ? user : null} navigate={navigate} settings={settings} placeOrder={placeOrder} />
  if (page === 'promos') content = <PromosPage promotions={promotions} />
  if (page === 'restaurants') content = <RestaurantsPage restaurants={restaurants} />
  if (page === 'recruitment') content = <Recruitment restaurants={restaurants} onSubmitApplication={submitApplication} />
  if (page === 'account') content = user?.roleType === 'customer' ? <CustomerAccount user={user} orders={orders} navigate={navigate} /> : <AuthPage portal="customer" onLogin={login} onRegister={register} navigate={navigate} />
  return <><PublicHeader page={page} navigate={navigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} user={user} logout={logout} />{content}<PublicFooter navigate={navigate} />{toast && <Toast message={toast} onClose={() => setToast('')} />}</>
}
