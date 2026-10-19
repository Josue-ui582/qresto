# QResto

QResto est une application web moderne pour la gestion de menu QR, commande en ligne et suivi de commande dans un restaurant. Le projet est construit avec Next.js et propose un parcours client (découverte de restaurants, choix de plats, panier, paiement, suivi), ainsi qu’un espace restaurant (dashboard, gestion des commandes, inscription propriétaire).

Ce README a pour objectif de permettre à n’importe quel développeur de comprendre le projet, le configurer correctement, et le lancer localement sans ambiguïté.

## 1. Vue d’ensemble du projet

QResto est une plateforme de commande et de gestion pour restaurants, avec plusieurs capacités :

- consultation des restaurants et de leurs menus
- navigation par ville / type de cuisine
- gestion du panier client
- prise de commande en ligne avec validation des prix et de la disponibilité côté serveur
- suivi d’une commande via code de tracking
- inscription d’un restaurateur
- espace dashboard restaurant
- recommandations construites à partir des plats disponibles en base

Les données métier sont persistées dans PostgreSQL. Les clients ne créent pas de compte; seuls les restaurateurs et leur équipe s’authentifient. Le panier est conservé temporairement dans le navigateur et revalidé par l’API lors de la commande.

## 2. Stack technique

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL via Prisma
- JWT en cookie pour l’authentification des restaurateurs et de l’équipe
- LocalStorage uniquement pour le cache temporaire du panier client
- API routes Next.js pour les endpoints de données

## 3. Prérequis

Avant de lancer le projet, vérifie que votre environnement a bien :

- Node.js >= 20
- Yarn >= 1.22
- PostgreSQL installé et accessible (requis)
- Un terminal Bash ou zsh

### Vérification rapide

```bash
node -v
yarn -v
```

Si Yarn n’est pas installé, activez Corepack :

```bash
corepack enable
```

## 4. Installation du projet

1. Clonez le dépôt

```bash
git clone git@github.com:Josue-ui582/qresto.git
cd qresto
```

2. Installez les dépendances

```bash
yarn install
```

3. Créez un fichier d’environnement local à partir de l’exemple

```bash
cp .env.example .env.local
```

4. Configurez les variables nécessaires

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qresto?schema=public"
```

La base PostgreSQL et les variables requises doivent être configurées avant de lancer l’application.

## 5. Variables d’environnement

Le fichier `.env.example` énumère les variables nécessaires, sans valeurs :

```env
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=
```

### Variables utiles selon le contexte

- `DATABASE_URL` : utilisée par Prisma pour se connecter à PostgreSQL
- `JWT_SECRET` : requis pour signer et vérifier les sessions des restaurateurs et membres d’équipe
- `NEXT_PUBLIC_APP_URL` : URL publique utilisée par les liens générés dans l’application

> Les données métier sont persistées dans PostgreSQL via Prisma et les endpoints Next.js. Seul le panier client reste en cache temporaire dans `localStorage`; le serveur revalide les plats, prix et disponibilités à la création de commande.

## 6. Structure du projet

```text
qresto/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dishes/
│   │   │   ├── orders/
│   │   │   ├── recommendations/
│   │   │   └── restaurants/
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── customer/
│   │   ├── dashboard/
│   │   └── pages/
│   ├── context/
│   ├── lib/
│   │   ├── auth/
│   │   ├── prisma.ts
│   │   └── rate-limit.ts
│   └── types/
│       └── index.ts
├── public/
├── generated/
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── README.md
└── yarn.lock
```

### Dossiers clés

- `src/app`: routes de l’application, pages et API Next.js
- `src/components`: composants React de l’interface
- `src/context`: contexte d’authentification, navigation, panier, toast
- `src/app/api`: endpoints publics et protégés des données métier
- `prisma/seed.ts`: données initiales de FAQ et témoignages
- `prisma/schema.prisma`: modèle Prisma pour PostgreSQL
- `src/lib/prisma.ts`: instance Prisma utilisée pour les accès à la base

## 7. Comment lancer le projet

### Mode développement

```bash
yarn dev
```

L’application démarre sur :

```text
http://localhost:3000
```

### Mode production

Build du projet :

```bash
yarn build
```

Lancement production :

```bash
yarn start
```

## 8. Commandes utiles

Dans le `package.json`, les scripts disponibles sont :

```bash
yarn dev         # démarre le projet en mode développement
yarn build       # build Next.js pour la production
yarn start       # lance la build produite
yarn lint        # lint Next.js
yarn typecheck   # vérification TypeScript
yarn db:migrate   # Prisma migrate dev
yarn db:push     # synchronise le schéma Prisma avec la DB
yarn db:studio   # ouverture de Prisma Studio
```

## 9. Base de données Prisma

Le projet est prêt pour PostgreSQL via Prisma. Le schéma est dans :

- `prisma/schema.prisma`

### Initialiser la base

1. Créer la base PostgreSQL
2. Définir `DATABASE_URL` dans `.env.local`
3. Exécuter :

```bash
yarn db:push
```

ou :

```bash
yarn db:migrate
```

### Ouvrir Prisma Studio

```bash
yarn db:studio
```

## 10. Données de démonstration

Les contenus d’exemple de la FAQ et des témoignages de la landing sont chargés dans PostgreSQL avec `yarn db:seed` (`prisma/seed.ts`). Aucun compte client ou compte restaurateur de démonstration n’est créé par ce seed.

## 11. Fonctionnement de l’application

### 1) Côté client

L’application est structurée autour d’un système de vue centralisé dans :

- `src/app/page.tsx`

Elle choisit le contenu à afficher selon `currentView` (landing, restaurants, menu, panier, suivi, login, register-restaurant, dashboard, etc.).

### 2) Gestion d’authentification

La logique d’authentification est dans :

- `src/context/AuthContext.tsx`

Elle gère :

- connexion
- inscription d’un propriétaire + restaurant
- déconnexion
- rechargement des infos restaurant

### 3) Données et Seed

Les contenus initiaux de la landing sont définis dans :

- `prisma/seed.ts`

Les données métier (restaurants, catégories, plats, tables, commandes et équipe) sont gérées par Prisma et les routes dans `src/app/api`.

### 4) API backend

Les endpoints disponibles dans `src/app/api` comprennent notamment :

- `restaurants` : annuaire et menus publics depuis PostgreSQL
- `dishes`, `categories`, `tables` : gestion des données de menu du restaurant connecté
- `orders` : création publique, suivi par code et gestion authentifiée
- `faq`, `testimonials` : contenus de landing chargés depuis PostgreSQL
- `recommendations` : plats populaires/spécialités disponibles en base

Les opérations privées sont protégées par la session et isolées par restaurant.

## 12. Points importants à savoir

### Le stockage actuel

Les données métier sont chargées depuis PostgreSQL via Prisma et les endpoints de l’application. Le seul stockage navigateur conservé est le cache temporaire du panier, qui est revalidé côté serveur lors de la création de commande.

## 13. Dépannage courant

### Erreur de Node / Yarn

```bash
node -v
yarn -v
```

Assure-toi d’avoir au moins Node 20 et Yarn 1.22.

### Problème de dépendances

```bash
yarn install
```

Supprime éventuellement le cache si besoin :

```bash
rm -rf node_modules yarn.lock
yarn install
```

### Port déjà utilisé

Le script `yarn dev` utilise le port 3000 par défaut. Si le port est occupé, tu peux modifier la commande ou tuer le processus déjà en cours.

### Prisma / base de données

Vérifie que :

- `DATABASE_URL` est bien présent dans `.env.local`
- PostgreSQL est démarré
- la base cible existe

### `yarn dev` ne démarre pas

Vérifie si le projet a bien été installé :

```bash
yarn install
yarn dev
```

## 14. Bonnes pratiques de développement

- éviter de mélanger logique métier front et logique backend
- garder les données métier persistées dans PostgreSQL, sans fallback de démonstration
- ne conserver dans le navigateur que le cache temporaire autorisé du panier
- respecter la structure par domaine (`auth`, `customer`, `dashboard`, `pages`)
- conserver les types centralisés dans `src/types/index.ts`

## 15. Prochaines améliorations possibles

Le projet peut encore évoluer avec :

- paiement MTN MoMo / Orange Money / Stripe
- notifications en temps réel
- export des commandes / statistiques

## 16. Résumé rapide pour démarrer en 30 secondes

```bash
corepack enable
cd qresto
yarn install
cp .env.example .env.local
# configure les variables d'environnement requises
yarn db:migrate
yarn db:seed
yarn dev
```

Ensuite ouvre :

```text
http://localhost:3000
```

## 17. Licence et contexte

QR Resto est une plateforme de commande et de gestion de restaurant via menu QR, avec données métier persistées dans PostgreSQL. Le redesign du front public reste un chantier distinct.

---

Pour la direction produit, les limites connues et la feuille de route, consulter [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md).
