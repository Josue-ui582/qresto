# QResto

QResto est une application web moderne pour la gestion de menu QR, commande en ligne et suivi de commande dans un restaurant. Le projet est construit avec Next.js et propose un parcours client (découverte de restaurants, choix de plats, panier, paiement, suivi), ainsi qu’un espace restaurant (dashboard, gestion des commandes, inscription propriétaire).

Ce README a pour objectif de permettre à n’importe quel développeur de comprendre le projet, le configurer correctement, et le lancer localement sans ambiguïté.

## 1. Vue d’ensemble du projet

QResto vise à simuler une plateforme de commande pour restaurants, avec plusieurs capacités :

- consultation des restaurants et de leurs menus
- navigation par ville / type de cuisine
- gestion du panier client
- prise de commande en ligne
- suivi d’une commande via code de tracking
- inscription d’un restaurateur
- espace dashboard restaurant
- démonstration de modules de recommandation et d’UX orientée restauration

Le projet est actuellement conçu comme une application démonstration / prototype avec données semi-statiques. Une partie importante de la logique utilise des données en mémoire et dans le stockage local du navigateur, ce qui facilite le lancement sans dépendre immédiatement d’une base de données externe.

## 2. Stack technique

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL (préparé via Prisma)
- LocalStorage pour la persistence côté front en mode prototype
- API routes Next.js pour les endpoints de données

## 3. Prérequis

Avant de lancer le projet, vérifie que votre environnement a bien :

- Node.js >= 20
- Yarn >= 1.22
- PostgreSQL installé et accessible si vous souhaitez utiliser Prisma avec une vraie base de données
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

Si vous n’utilisez pas encore la base de données, vous pouvez laisser le projet démarrer en mode prototype avec les données par défaut, mais la configuration Prisma reste recommandée pour que les scripts de base de données fonctionnent correctement.

## 5. Variables d’environnement

Le projet comprend un fichier `.env.example` avec les variables de base :

```env
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"
```

### Variables utiles selon le contexte

- `DATABASE_URL` : utilisée par Prisma pour se connecter à PostgreSQL
- `GEMINI_API_KEY` : prévue pour des intégrations IA / Gemini si le projet évolue ou si des recommandations intelligentes sont activées
- `APP_URL` : utile pour les liens d’application et les environnements hébergés

> Important : dans la version actuelle, le cœur du projet est principalement piloté par des données de démonstration dans `src/lib/storage.ts` et non par une base Prisma complète en production. Prisma est bien présent et prêt, mais l’app peut tourner sans une vraie BDD tant que vous restez dans le mode démonstration.

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
│   │   ├── prisma.ts
│   │   └── storage.ts
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
- `src/lib/storage.ts`: source principale des données de démonstration
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

> Si vous souhaitez une vraie persistance backend, cette étape est la bonne base pour la migration progressive des données depuis `src/lib/storage.ts` vers Prisma.

## 10. Données de démonstration

Le projet embarque déjà des données d’exemple pour simuler plusieurs restaurant et commandes :

- Delice SPEED
- Chez Mama Bénin
- Le Jardin Fidjrossè
- AfroBurger Lounge

Les comptes utilisateurs de démonstration sont définis dans `src/lib/storage.ts` et incluent notamment :

- `delice@qresto.africa` / `password123`
- `owner@chezmama.bj` / `password123`
- `contact@jardin-fidjrosse.bj` / `password123`
- `admin@qresto.africa` / `admin123`

Ces comptes permettent de tester les vues de restaurant et de propriétaire dans l’interface.

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

Les données initiales sont principalement dans :

- `src/lib/storage.ts`

Ce fichier contient :

- utilisateurs
- restaurants
- catégories
- plats
- tables
- commandes
- FAQ / témoignages

### 4) API backend

Les endpoints disponibles dans `src/app/api` comprennent :

- `restaurants` : liste des restaurants
- `dishes` : données de plats
- `orders` : gestion des commandes
- `recommendations` : suggestions / formules

Ces routes sont pensées pour être complétées ou migrées vers une vraie base de données et une logique métier plus robuste.

## 12. Points importants à savoir

### Le projet est un prototype fonctionnel

La logique est pensée pour démontrer l’expérience complète d’une plateforme de commande en restauration, mais elle n’a pas encore été entièrement standardisée autour d’un backend complet.

### Le stockage actuel

Actuellement, une grande partie des données est gérée via `localStorage` depuis `src/lib/storage.ts`.

Cela signifie :

- le projet est très simple à démarrer
- il est parfait pour démonstration, maquettes, tests UI
- il nécessite une migration progressive vers une vraie base de données si l’application passe en production

### Prisma est préparé mais pas nécessairement utilisé partout

Le schéma Prisma existe et la configuration est correcte, mais l’architecture front actuelle n’a pas encore totalement remplacé le stockage local par des requêtes Prisma. Le projet est donc dans une phase de démonstration / MVP, ce qui est courant pour une première version.

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

- garder les données mock dans `src/lib/storage.ts` pour la démonstration
- éviter de mélanger logique métier front et logique backend
- migrer progressivement les accès à Prisma pour un vrai stockage durable
- respecter la structure par domaine (`auth`, `customer`, `dashboard`, `pages`)
- conserver les types centralisés dans `src/types/index.ts`

## 15. Prochaines améliorations possibles

Le projet peut encore évoluer avec :

- authentification réelle avec JWT / NextAuth
- base de données PostgreSQL pleinement exploitée
- API REST robuste avec validation Zod / Joi
- paiement MTN MoMo / Orange Money / Stripe
- notifications en temps réel
- dashboard admin avancé
- gestion multi-restaurants et multi-rôles
- export des commandes / statistiques

## 16. Résumé rapide pour démarrer en 30 secondes

```bash
corepack enable
cd qresto
yarn install
cp .env.example .env.local
# configure DATABASE_URL si tu veux Prisma
yarn dev
```

Ensuite ouvre :

```text
http://localhost:3000
```

## 17. Licence et contexte

Le projet est un prototype de plateforme de commande QR pour restaurant, destiné à l’exploration technique et à la démonstration de fonctionnalités UX/UI. Il est conçu pour servir de base de référence pour un MVP ou une application de démonstration.

---

Si vous voulez aller plus loin, la prochaine étape recommandée est de remplacer progressivement les données mockées du fichier `src/lib/storage.ts` par des appels Prisma réels et de sécuriser les endpoints API pour un usage en production.
