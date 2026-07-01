export const menuSeed = [
  { id: 'menu-classic', category: 'Menus', name: 'Menu Atom Classic', description: 'Atom Classic, frites classiques et boisson au choix.', price: 13.9, imageUrl: '', available: true, featured: true, badge: 'Populaire', stock: 60 },
  { id: 'menu-double', category: 'Menus', name: 'Menu Double Atom', description: 'Double Atom, frites cheddar et boisson au choix.', price: 17.9, imageUrl: '', available: true, featured: true, badge: 'Edition limitee', stock: 35 },
  { id: 'menu-family', category: 'Menus', name: 'Menu Family Atom', description: 'Deux burgers, deux accompagnements et deux boissons.', price: 29.9, imageUrl: '', available: true, badge: 'Nouveau', stock: 22 },
  { id: 'classic', category: 'Burgers', name: 'Atom Classic', description: 'Steak grille, cheddar, salade, tomate et sauce Atom.', price: 8.9, available: true, featured: true, badge: 'Populaire', stock: 80 },
  { id: 'double', category: 'Burgers', name: 'Double Atom', description: 'Deux steaks, double cheddar, oignons, cornichons et sauce maison.', price: 12.9, available: true, featured: true, badge: 'Populaire', stock: 45 },
  { id: 'spicy', category: 'Burgers', name: 'Spicy San Andreas', description: 'Steak grille, cheddar, jalapenos et sauce rouge relevee.', price: 10.9, available: true, badge: 'Edition limitee', stock: 18 },
  { id: 'chicken', category: 'Burgers', name: 'Cluckin Atom', description: 'Poulet croustillant, salade, tomate et sauce cremeuse.', price: 9.9, available: true, stock: 42 },
  { id: 'veggie', category: 'Burgers', name: 'Green Fusion', description: 'Galette vegetale, cheddar, crudites et sauce douce.', price: 9.5, available: true, badge: 'Nouveau', stock: 20 },
  { id: 'fries', category: 'Accompagnements', name: 'Frites Atom', description: 'Frites dorees et salees, format genereux.', price: 3.5, available: true, stock: 120 },
  { id: 'rings', category: 'Accompagnements', name: 'Onion Rings', description: 'Rondelles d oignon panees et croustillantes.', price: 3.9, available: true, stock: 40 },
  { id: 'nuggets', category: 'Accompagnements', name: 'Nuggets x6', description: 'Six morceaux de poulet panes avec une sauce.', price: 5.2, available: true, stock: 65 },
  { id: 'ecola', category: 'Boissons', name: 'eCola', description: 'Le classique bien frais.', price: 2.5, available: true, stock: 90 },
  { id: 'sprunk', category: 'Boissons', name: 'Sprunk', description: 'Citronne, frais et nerveux.', price: 2.5, available: true, stock: 90 },
  { id: 'energy', category: 'Boissons', name: 'Junk Energy', description: 'Une dose d energie pour le trajet.', price: 3.2, available: true, badge: 'Nouveau', stock: 28 },
  { id: 'water', category: 'Boissons', name: 'Eau plate', description: 'Simple, fraiche, efficace.', price: 1.8, available: true, stock: 100 },
  { id: 'shake', category: 'Desserts', name: 'Jumbo Shake', description: 'Vanille, chocolat ou fraise.', price: 4.9, available: true, badge: 'Populaire', stock: 35 },
  { id: 'cookie', category: 'Desserts', name: 'Cookie geant', description: 'Cookie XL aux pepites de chocolat.', price: 3.5, available: true, stock: 50 },
  { id: 'donut', category: 'Desserts', name: 'Donut', description: 'Donut moelleux au glacage sucre.', price: 2.9, available: true, stock: 0 },
]

export const restaurantsSeed = [
  { id: 'roxwood', name: 'Up-n-Atom Roxwood', hours: '12:00 - 23:00', phone: '555-ATOM-00', x: 52, y: 8, active: true },
]

export const staffSeed = [
  { id: 'staff-1', username: 'directeur', email: 'directeur@atom.sa', password: 'atom', firstName: 'Ethan', lastName: 'Reagan', role: 'Directeur Restaurant', position: 'Direction', restaurant: 'Up-n-Atom Roxwood', phone: '555-0101', iban: 'SA01 ATOM 0000 0001', permissions: ['calendar', 'orders', 'admin'] },
  { id: 'staff-2', username: 'manager', email: 'manager@atom.sa', password: 'atom', firstName: 'Lena', lastName: 'Breeks', role: 'Manager', position: 'Responsable de service', restaurant: 'Up-n-Atom Roxwood', phone: '555-0102', iban: 'SA01 ATOM 0000 0002', permissions: ['calendar', 'orders', 'admin'] },
  { id: 'staff-3', username: 'equipier', email: 'equipier@atom.sa', password: 'atom', firstName: 'Riley', lastName: 'Morales', role: 'Equipier polyvalent', position: 'Caisse et cuisine', restaurant: 'Up-n-Atom Roxwood', phone: '555-0103', iban: 'SA01 ATOM 0000 0003', permissions: ['calendar', 'orders'] },
  { id: 'staff-4', username: 'stagiaire', email: 'stagiaire@atom.sa', password: 'atom', firstName: 'Kaito', lastName: 'Takashi', role: 'Stagiaire equipier', position: 'Formation', restaurant: 'Up-n-Atom Roxwood', phone: '555-0104', iban: 'SA01 ATOM 0000 0004', permissions: ['calendar', 'orders'] },
]

export const customerSeed = [
  { id: 'customer-1', email: 'client@atom.sa', password: 'atom', firstName: 'Alex', lastName: 'Walker', phone: '555-0188', address: 'Alta Street, Los Santos', roleType: 'customer' },
]

export const eventSeed = [
  { id: 'event-1', title: 'Brief equipe', date: new Date().toISOString().slice(0, 10), start: '19:00', end: '19:30', type: 'Reunion', location: 'Up-n-Atom Roxwood', notes: 'Points du service et repartition des postes.', authorId: 'staff-1' },
  { id: 'event-2', title: 'Animation mascotte', date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), start: '20:00', end: '22:00', type: 'Animation', location: 'Up-n-Atom Roxwood', notes: '', authorId: 'staff-2' },
]

export const orderSeed = [
  {
    id: 'ATM-2401', customerId: 'customer-demo', customerName: 'Jordan Miller', phone: '555-0142', address: 'Alta Street, pres de Legion Square',
    markerX: 51, markerY: 80, note: 'Appeler a l arrivee', status: 'Nouvelle', paid: false, assignedTo: '', createdAt: new Date().toISOString(),
    items: [{ id: 'classic', name: 'Atom Classic', price: 8.9, quantity: 2 }, { id: 'fries', name: 'Frites Atom', price: 3.5, quantity: 1 }], total: 21.3,
  },
]

export const announcementsSeed = [
  { id: 'a1', title: 'Nouvelle offre Double Atom', body: 'Le Double Atom est mis en avant cette semaine.', priority: 'Haute', date: new Date().toISOString() },
  { id: 'a2', title: 'Controle hygiene interne', body: 'Verifier les postes froids et les fiches de nettoyage avant la fermeture.', priority: 'Normale', date: new Date(Date.now() - 86400000).toISOString() },
]

export const timeEntrySeed = [
  { id: 'hours-1', employeeId: 'staff-1', date: new Date().toISOString().slice(0, 10), hours: 7.5, comment: 'Service du soir', createdAt: new Date().toISOString() },
]

export const docsSeed = [
  { id: 'd1', title: 'Reglement interne Up-n-Atom', type: 'Reglement', access: 'Tous' },
  { id: 'd2', title: 'Procedure ouverture restaurant', type: 'Procedure', access: 'Manager+' },
  { id: 'd3', title: 'Formation caisse et commandes', type: 'Formation', access: 'Tous' },
  { id: 'd4', title: 'Fiche hygiene cuisine', type: 'Securite', access: 'Tous' },
]

export const promotionsSeed = [
  { id: 'p1', title: 'Duo Atom', offer: '19,90 $', description: 'Deux Atom Classic, deux frites et deux eCola.', active: true },
  { id: 'p2', title: 'Spicy Night', offer: '-20 %', description: 'Reduction sur le Spicy San Andreas apres 22 h.', active: true },
  { id: 'p3', title: 'Shake Friday', offer: '1 achete = 1 offert', description: 'Tous les vendredis sur les Jumbo Shakes.', active: true },
]

export const orderStatuses = ['Nouvelle', 'Acceptee', 'En preparation', 'En livraison', 'Terminee', 'Annulee']

export const rankOptions = ['Directeur Restaurant', 'Assistant Directeur', 'Chef d equipe', 'Manager', 'Equipier Formateur', 'Equipier polyvalent', 'Mascotte / Animation', 'Stagiaire equipier']
