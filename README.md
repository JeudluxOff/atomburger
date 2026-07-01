# Up-n-Atom Hamburgers

Site React/Vite avec espace client, commandes, carte de livraison, calendrier d'equipe et administration.

## Demarrage local

```bash
npm install
npm run dev
```

Sans variables d'environnement, le site utilise un mode de demonstration persistant uniquement dans le navigateur actuel. Pour que tous les utilisateurs voient les memes comptes, commandes, annonces et evenements, la configuration Supabase ci-dessous est obligatoire.

- Client : `client@atom.sa / atom`
- Direction : `directeur / atom`
- Manager : `manager / atom`
- Equipier : `equipier / atom`

## Mise en production

1. Creer un projet Supabase.
2. Executer `supabase/schema.sql` dans l'editeur SQL.
3. Creer le premier compte de direction dans Supabase Auth avec les metadonnees `role_type: employee`, `role: Directeur Restaurant` et `permissions: ["calendar", "orders", "admin"]`.
4. Ajouter les variables de `.env.example` au projet Vercel.
5. Deployer le dossier sur Vercel.

Une fois les variables ajoutees, les donnees sont centralisees et synchronisees en direct entre tous les navigateurs. Un compte employe cree par la direction peut alors se connecter depuis un autre ordinateur, et une nouvelle commande apparait automatiquement chez les employes.

La cle `SUPABASE_SERVICE_ROLE_KEY` reste uniquement dans les variables serveur Vercel. Elle ne doit jamais commencer par `VITE_`.

## Carte

La carte interactive utilise l'atlas complet de GTA V comme fond, avec des coordonnees relatives pour conserver les marqueurs sur toutes les tailles d'ecran.
