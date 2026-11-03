# QResto — vue d’ensemble du projet

> État observé dans le code lors du dernier audit. Ce document décrit le dépôt tel qu’il est écrit ; il ne vaut ni validation de production ni audit de sécurité exhaustif.

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Stack technique et architecture](#2-stack-technique-et-architecture)
3. [Fonctionnalités existantes](#3-fonctionnalités-existantes)
4. [Travail réalisé jusqu’à présent](#4-travail-réalisé-jusquà-présent)
5. [Audit du design actuel (front-end public)](#5-audit-du-design-actuel-front-end-public)
6. [Direction de refonte du design — à reprendre ultérieurement](#6-direction-de-refonte-du-design--à-reprendre-ultérieurement)
7. [Fonctionnalités proposées](#7-fonctionnalités-proposées)
8. [Feuille de route](#8-feuille-de-route)
9. [Guide pour reprendre le projet](#9-guide-pour-reprendre-le-projet)

## 1. Présentation du projet

QResto est une application web de digitalisation des restaurants, orientée notamment vers le Bénin et l’Afrique de l’Ouest. Elle vise deux publics :

- **Restaurateurs et équipes** : publier un menu, administrer les plats et les tables, recevoir et faire avancer les commandes, gérer des membres du personnel et consulter un espace d’administration.
- **Clients finaux** : découvrir un établissement, consulter son menu sans créer de compte, ajouter des plats au panier, commander sur place, à emporter ou en livraison, puis rechercher l’état de la commande par son code.

La proposition de valeur est de relier le menu numérique et la prise de commande au fonctionnement du restaurant : le QR peut contenir le numéro de table, les commandes sont stockées et consultables dans le dashboard, et le client dispose d’une page de suivi. Le dépôt contient aussi une vitrine marketing et des écrans d’abonnement.

**Limites de l’état actuel :** le code propose des choix de paiement Mobile Money et carte, mais aucun flux de paiement externe n’est visible ; la commande est enregistrée avec un statut de paiement `PENDING`. Les promesses marketing doivent donc être distinguées des intégrations réellement actives.

## 2. Stack technique et architecture

### Technologies observées

| Couche | Technologies et constats |
|---|---|
| Application web | Next.js 16 (App Router), React 19, TypeScript. Routes et pages dans `src/app/`. |
| Interface | Tailwind CSS 4 via `@tailwindcss/postcss`, CSS global et variables de thème dans `src/app/globals.css` et `src/app/design-system.css`. Icônes `lucide-react` et Font Awesome chargé via CDN. Animations avec `motion`/`motion/react` et `framer-motion` importés selon les composants. |
| Serveur / API | Route handlers Next.js dans `src/app/api/`. Authentification par cookie JWT signé avec `jose`; mots de passe hachés avec `bcryptjs`. |
| Données | PostgreSQL via Prisma 6. Schéma dans `prisma/schema.prisma`, migrations dans `prisma/migrations/`, client généré vers `generated/prisma`. Accès partagé par `src/lib/prisma.ts`. |
| État client | Contextes React dans `src/context/`; seul le panier temporaire reste dans `localStorage`, sans compte client. Les données métier sont chargées depuis l’API/Prisma. |
| QR et médias | La dépendance `qrcode` génère localement des SVG; le navigateur convertit les exports en PNG. Les images statiques sont sous `public/images/` et d’autres chemins d’assets. |
| Déploiement | Aucune configuration de déploiement, conteneur ou pipeline CI n’a été repérée dans les fichiers de configuration du dépôt. `.env.example` mentionne AI Studio / Cloud Run dans ses commentaires ; l’hébergement réellement utilisé est **à confirmer**. |

### Schéma d’architecture

```mermaid
flowchart LR
  Client["Navigateur client<br/>menu, panier, suivi"]
  Admin["Navigateur restaurateur<br/>dashboard"]
  Next["Next.js App Router<br/>pages React + route handlers"]
  Context["Contextes React<br/>auth, panier, commandes, navigation"]
  Local["localStorage<br/>cache temporaire du panier"]
  Prisma["Prisma Client"]
  PG[("PostgreSQL")]

  Client --> Next
  Admin --> Next
  Client --> Context
  Admin --> Context
  Context --> Local
  Next --> Prisma --> PG
```

Le suivi client et le dashboard reçoivent les changements par SSE, respectivement sur un canal de code de suivi public et un canal restaurant authentifié. EventSource tente de se reconnecter automatiquement; chaque client active son polling de secours (5 s pour le suivi, 10 s pour le dashboard) tant que le flux est indisponible. Le bus de diffusion actuel est local au processus : la livraison entre instances, les connexions persistantes et le buffering dépendent de l’hébergement et restent **à confirmer**.

### Rôle des dossiers principaux

| Chemin | Rôle |
|---|---|
| `src/app/` | Pages Next.js, layout global, styles globaux et routes API. |
| `src/app/api/auth/` | Inscription, connexion, déconnexion et vérification de session. |
| `src/app/api/` (autres routes) | Endpoints restaurants, commandes, événements SSE, notifications, avis, catégories, plats, tables, QR, équipe, paramètres, abonnements, analytics et recommandations. |
| `src/components/pages/LandingPage/` | Sections de la vitrine marketing. |
| `src/components/customer/` | Annuaire, fiche/menu restaurant, panier et suivi de commande. |
| `src/components/dashboard/` | Shell et onglets de gestion du restaurant. |
| `src/components/auth/` | Écrans et formulaires de connexion et d’inscription. |
| `src/components/common/`, `src/components/ui/` | Navigation, messages, icônes et composants UI génériques. |
| `src/context/` | États partagés de session, navigation, panier, commandes et notifications. |
| `src/lib/` | Client Prisma et fonctions partagées (authentification, validation, QR, rate limit). |
| `src/types/`, `src/utils/`, `src/constants/` | Types, utilitaires et constantes transverses; les contenus de vitrine sont désormais persistés. |
| `prisma/` | Modèle relationnel et historique des migrations. |
| `public/images/` | Images servies statiquement par Next.js. |

### Principales entités et relations

Le modèle de données est défini dans `prisma/schema.prisma`.

- `User` peut posséder un `Restaurant` (relation propriétaire avec `ownerId` unique), être associé directement à un restaurant comme personnel et/ou être relié à un `TeamMember`.
- `Restaurant` possède plusieurs `TeamMember`, `Category`, `Dish`, `RestaurantTable`, `Order`, `Review`, `Coupon`, historiques d’abonnement et `Notification`. Il a aussi des `RestaurantSettings` et une `Subscription` uniques.
- `Category` regroupe plusieurs `Dish`. Un plat peut avoir des groupes d’options `DishOptionGroup`, eux-mêmes composés de `DishOption`.
- `Order` appartient à un restaurant et contient des `OrderItem` et un historique `OrderStatusHistory`. Les lignes de commande gardent nom/prix/quantité et peuvent survivre à la suppression d’un plat via `dishId` optionnel.
- `Review` appartient à un restaurant et peut viser un plat.
- `Subscription` appartient à un restaurant et possède plusieurs `Invoice`. `SubscriptionHistory` représente aussi des événements d’abonnement distincts.
- `Coupon` et `Notification` appartiennent à un restaurant.
- `Testimonial` et `FAQItem` sont des entités sans relation obligatoire à un restaurant, chargées depuis PostgreSQL et initialisées par `prisma/seed.ts`.

**À noter :** les options de plats et les notifications ont un cycle fonctionnel dans l’application. Les coupons et la gestion du stock restent des entités de schéma sans cycle complet.

## 3. Fonctionnalités existantes

Légende : **✅ terminé dans le périmètre observé** ; **🟡 partiel / simulé / dépendant d’un flux incomplet** ; **❌ incohérent ou en échec visible dans le code**.

### Front public

| Parcours | État | Ce qui est effectivement présent |
|---|---:|---|
| Accueil marketing (`/`) | 🟡 | Sections hero, étapes, plats, simulateur QR, restaurants, prix, témoignages, FAQ et CTA. Témoignages, FAQ, plats de vitrine et restaurants mis en avant sont chargés depuis les API/DB; certaines statistiques et promesses restent des textes fixes non reliés à une mesure visible. |
| Annuaire (`/restaurants`) | ✅ | Charge `/api/restaurants`, recherche texte, filtres par villes et catégories/cuisines dérivées des établissements présents, et filtre « ouverts ». |
| Menu restaurant (`/restaurant/[slug]`) | ✅ | Charge le restaurant par slug ou ID via `/api/restaurants/[slug]`, affiche les plats et options disponibles, filtre par catégorie, ajoute au panier et ouvre la visualisation 3D. Le paramètre `?table=` est transmis au panier. Le statut d’ouverture suit les horaires et les avis utilisent les agrégats réels. |
| Panier et formulaire (`/cart`) | ✅ / 🟡 | Panier local mono-restaurant avec confirmation avant remplacement, options de plats et prix recalculés côté serveur. Le formulaire ne demande aucun compte, exige nom, WhatsApp E.164 et consentement, et adapte table/adresse au mode. Le règlement reste manuel/en attente. |
| Paiement | 🟡 | Les choix `CASH_ON_DELIVERY`, `MTN_MOMO`, `MOOV_MONEY` et `CARD` existent. Le serveur persiste le moyen et crée la commande en `PENDING`; aucune passerelle, confirmation de paiement ou webhook n’est visible. |
| Suivi (`/order-tracking`) | ✅ | Recherche publique sans compte, message neutre si aucun code ne correspond, code copiable, lien direct, timeline et historique. SSE actualise statut et historique; polling 5 s en secours si le flux échoue. |
| Contact et pages légales | 🟡 | Le formulaire Contact persiste les demandes et applique honeypot/limitation de débit. L’interface `EmailService` existe, mais le fournisseur n’est pas configuré (**à confirmer**). Les tarifs des CGU restent à aligner sur l’API. |
| Accès client sans compte | ✅ | Menu, panier, création et suivi sont publics. Le client voit toujours son code sur la page de suivi et ne dépend pas de WhatsApp pour le récupérer. L’envoi automatique WhatsApp reste à brancher dans une étape séparée. |

### Dashboard

| Section | État | Éléments observés |
|---|---:|---|
| Établissement / Paramètres généraux | ✅ | Chargement des informations via `/api/settings`, champs nom/téléphone/adresse/devise/description préremplis à partir des paramètres ou des données du restaurant. La sauvegarde met également à jour le profil restaurant. |
| Horaires | ✅ | Édition des jours actifs et heures d’ouverture/fermeture, validation de format et sauvegarde JSON synchronisée aux paramètres et au restaurant. |
| Enregistrer / rafraîchir les paramètres | ✅ | Le bouton Enregistrer est désactivé si le formulaire n’a pas changé ; actualisation via `fetchSettings`; notifications de succès/erreur présentes. |
| Abonnement | 🟡 | Catalogue partagé, affichage de l’usage, essai de 14 jours, changement sans paiement et annulation. Les plans expirés/annulés ou en attente de règlement passent en lecture seule. Aucun encaissement ni renouvellement automatique n’est intégré. |
| Équipe | 🟡 | Liste, recherche, filtres par rôle, ajout, édition, activation/désactivation et suppression via `/api/team`. Les opérations sont limitées au restaurant de la session. La création d’un `TeamMember` ne crée toutefois pas de compte `User`; la connexion réelle des nouveaux membres reste à confirmer/implémenter. |
| Plats | ✅ / 🟡 | Liste, recherche, catégorie, disponibilité, ajout/édition/suppression via API. Le formulaire exige une image/URL ; la gestion de chargement réel d’un fichier n’est pas confirmée. |
| Catégories | ✅ | CRUD par API, catégories triées et suppression empêchée si des plats y sont encore associés. |
| Commandes | ✅ | Tableau Kanban et détail actualisés par SSE avec polling 10 s en secours. L’API limite les transitions et journalise chaque transition avec une notification en transaction. |
| Tables et QR codes | ✅ | Gestion des tables et QR générés localement depuis le slug et le numéro réel de table. Le dashboard permet taille/couleurs, logo optionnel, téléchargement PNG et impression. |
| Analytics | ✅ / 🟡 | Chiffre d’affaires et panier moyen hors commandes annulées, volume, tables, plats, modes de service, statuts et heures de pointe agrégés en base. Filtres jour/semaine/mois/personnalisé, fuseau par défaut `Africa/Porto-Novo`, export CSV. Validation sur PostgreSQL réel encore nécessaire. |
| Notifications | ✅ | Centre lu/non lu alimenté par `Notification`; nouvelles commandes, transitions de statut et nouveaux avis sont enregistrés. Le badge non lu pulse à l’arrivée d’une notification. |
| Accès dashboard | ✅ / 🟡 | Le middleware vérifie le JWT et permet les rôles propriétaire et staff; chaque endpoint d’administration vérifie aussi la session, le rôle et l’isolation restaurant. Le mécanisme n’octroie pas de compte à un `TeamMember` créé depuis l’interface, ce qui limite l’usage effectif des rôles staff. |

### API et données

| Groupe d’API | État | Couverture observée |
|---|---:|---|
| `/api/auth/*` | ✅ | `POST` login/register/logout et `GET` `/me`; mots de passe bcrypt, cookie `auth_token` HttpOnly et `JWT_SECRET` obligatoire, sans valeur de repli. |
| `/api/restaurants`, `/api/restaurants/[slug]`, `/api/restaurants/featured`, `/api/restaurant/me` | ✅ / 🟡 | Annuaire et fiche/menu publics, recherche par slug ou ID, horaires calculés et agrégats d’avis. La route `/api/restaurant/me` reste réservée au propriétaire connecté. |
| `/api/faq`, `/api/testimonials`, `/api/dishes/showcase` | ✅ | Lectures publiques du contenu actif de landing et des plats à la une depuis PostgreSQL. |
| `/api/orders`, `/api/orders/[trackingCode]` | ✅ / 🟡 | Création publique : plats/options/disponibilité et prix sont rechargés/validés côté serveur; table active vérifiée pour le sur-place; WhatsApp E.164 et consentement requis; commande, lignes et historique sont transactionnels. Code de 8 caractères aléatoires sans `0/O/1/I`; formats historiques acceptés. Le notifier est isolé après commit. Lecture publique limitée au DTO; transitions de statut authentifiées et tenant-scoped. |
| `/api/analytics` | ✅ / 🟡 | Agrégats Prisma/PostgreSQL sur `Order.total`, `OrderItem.dishId` et `Dish`, avec périodes calendaires locales, distribution par statut/mode, top ventes, tables et heures de pointe. L’API est restaurant-scoped et accepte un fuseau IANA; le défaut actuel est `Africa/Porto-Novo`. |
| `/api/events/restaurants/[restaurantId]`, `/api/events/orders/[trackingCode]` | ✅ / 🟡 | Flux SSE restaurant authentifié et flux de suivi public par code. Le bus est local au processus et nécessite un hébergement compatible avec des connexions persistantes; la diffusion multi-instance est **à confirmer**. |
| `/api/notifications` | ✅ | Lecture tenant-scoped des 50 dernières notifications et compteur non lu; PATCH lu/non lu limité au restaurant de session. |
| `/api/reviews` | 🟡 | Création publique d’avis limitée par IP; avis et notification sont créés dans une transaction. La preuve de commande et une interface de dépôt d’avis restent à faire. |
| `/api/contact` | ✅ / 🟡 | Persiste les demandes dans `ContactMessage`, applique rate limit et honeypot. L’envoi e-mail dépend du fournisseur qui reste à confirmer; l’état retourné ne prétend pas qu’un e-mail a été délivré. |
| `/api/dishes`, `/api/categories`, `/api/tables`, `/api/team`, `/api/settings` | ✅ / 🟡 | Endpoints d’administration authentifiés, validés par Zod et filtrés avec le restaurant de session. Les créations de plats, tables et membres respectent les limites du plan dans des transactions sérialisables; la réactivation d’un membre est aussi contrôlée. Les modifications métier sont refusées lorsque l’abonnement est expiré, annulé ou en attente de règlement. `/api/dishes/showcase` est une lecture publique dédiée à la vitrine. |
| `/api/subscription` | 🟡 | Lecture/initialisation d’essai, changement sans paiement et annulation; réservé au propriétaire selon la matrice de rôles. N’émet pas de facture payée sans encaissement. |
| `/api/qr-codes` | ✅ | Lecture des tables protégée par rôle; renvoie des URLs menu/table et des SVG générés localement. |
| `/api/recommendations` | 🟡 | Sélectionne dans PostgreSQL les plats disponibles populaires/spécialités; `mood` est validé et renvoyé mais ne personnalise pas encore le classement. |

## 4. Travail réalisé jusqu’à présent

### État des améliorations dashboard mentionnées

| Amélioration attendue | Présence dans le code |
|---|---|
| Pré-remplissage des informations établissement | **Oui.** `GET /api/settings` crée des paramètres initiaux à partir du restaurant et `SettingsTab` remplit le formulaire avec ces valeurs. |
| Bouton Enregistrer désactivé sans modification | **Oui.** `SettingsTab` compare un snapshot JSON et transmet `isDirty` à `Header`; l’action est désactivée si `!isDirty`. |
| Rafraîchissement des informations | **Oui.** `Header` déclenche `fetchSettings()` avec `cache: 'no-store'`. |
| Horaires modifiables | **Oui.** `OpeningHoursSection` gère l’activation par jour et les deux champs horaires ; `SettingsTab` valide puis enregistre. |
| Section Abonnement visible | **Oui.** Elle est déclarée dans les items de navigation du dashboard et rend `SubscriptionTab`. Le paiement de l’abonnement n’est toutefois pas intégré. |
| Ajout d’un membre avec le bon ID de restaurant | **Oui.** La création vérifie `restaurantId` puis l’inclut dans le payload POST de `TeamTab`. |
| Formulaire de plat | **Oui.** Création/édition avec nom, prix, catégorie, image et disponibilité, puis appel API. Le formulaire bloque la soumission sans image/URL. |
| Étapes/colonnes de commande en quatre par ligne | **Oui pour le Kanban dashboard.** `OrdersTab` utilise `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`. Le suivi client a, lui, six étapes et une grille de six colonnes à partir de `md`. |

### Résumé de ce qui est construit

- Une application App Router avec pages publiques, authentification propriétaire, parcours de commande et dashboard.
- Un schéma PostgreSQL/Prisma assez large (restaurant, équipe, menu, tables, commandes, abonnements, factures, avis, coupons, notifications, FAQ et témoignages) avec historique de migrations versionnées.
- Des handlers API pour les opérations principales et des formulaires de gestion.
- Une vitrine marketing constituée de sections modulaires, des images de démonstration et un simulateur de QR.
- Les témoignages, FAQ, plats à la une et restaurants mis en avant sont servis depuis PostgreSQL; le seed versionné fournit les premiers témoignages et FAQ.
- Le stockage navigateur de données métier et ses constantes fictives de restaurants/plats ont été supprimés. Le panier reste un cache temporaire `localStorage`, revalidé côté serveur à la création de commande.
- Le panier est mono-restaurant (confirmation avant remplacement), conserve les options choisies et le formulaire public exige WhatsApp E.164 avec consentement. Les prix/options sont revalidés côté serveur et commande/lignes/historique sont créés atomiquement.
- Le code de suivi est généré côté serveur, visible et copiable sans dépendre de WhatsApp. Le contact client est stocké via `ContactMessage`; son abstraction `EmailService` existe, mais le fournisseur reste **à confirmer**.
- Le `OrderNotifier` est appelé après validation de la transaction; son implémentation actuelle journalise uniquement et ses erreurs n’annulent pas la commande. Le calcul d’ouverture utilise `Africa/Porto-Novo`; rendre le fuseau paramétrable sera nécessaire si l’offre s’étend à d’autres pays (**à confirmer**).
- Les analytics n’utilisent plus de champs inexistants ni de calculs par le composant : Prisma/PostgreSQL agrège les commandes, les plats, les modes et les heures, avec périodes locales et export CSV. Le défaut de fuseau est `Africa/Porto-Novo`; une préférence par restaurant est **à confirmer**.
- Le dashboard et le suivi client sont branchés aux flux SSE avec reconnexion EventSource et polling de secours. Le bus en mémoire est mono-processus; confirmer la compatibilité des connexions persistantes et prévoir un pub/sub partagé pour plusieurs instances (**à confirmer**).
- Les notifications de nouvelle commande, transition de statut et nouvel avis sont persistées et listées dans le dashboard avec état lu/non lu et badge animé. L’API de dépôt d’avis est publique et limitée par IP, mais ne vérifie pas que l’avis provient d’une commande terminée.
- Les horaires et avis de la fiche viennent de données réelles; la devise provient des paramètres. Les évolutions récentes du schéma nécessitent l’application des migrations `20261103080000_add_contact_messages`, `20261103083000_add_order_whatsapp_consent` et `20261104120000_default_subscription_payments_to_pending` (`yarn db:migrate`).
- Le catalogue de plans est centralisé dans `src/lib/subscription/catalog.ts` et partagé par l’API, le dashboard, la landing et les CGU. Les tarifs repris de l’ancienne API (Starter 15 000/144 000 FCFA, Pro 35 000/336 000 FCFA, Enterprise 75 000/720 000 FCFA par mois/an) sont **à confirmer**. Starter est limité à 30 plats, 10 tables actives et 3 membres actifs; Pro et Enterprise sont illimités sur ces ressources.
- Les nouvelles inscriptions reçoivent un essai Pro de 14 jours. Changer de formule active la période choisie sans paiement, facture payée ni renouvellement automatique; l’annulation prend effet immédiatement. À expiration, annulation ou état `PAST_DUE`, les lectures restent accessibles mais les modifications métier sont refusées jusqu’au changement de formule. Les compteurs de tables et membres portent uniquement sur les éléments actifs.
- Les nouvelles factures et entrées d’historique ont un statut par défaut `PENDING`. Les anciens enregistrements `PAID` ne sont pas une preuve d’encaissement et s’affichent « À vérifier »; leur historique doit être rapproché manuellement avant une éventuelle intégration de paiement.
- Les offres Enterprise n’ont actuellement aucune capacité active différente de Pro; le prix et la différenciation commerciale sont **à confirmer**. Le champ historique `Restaurant.subscriptionPlan` et l’enum `SubscriptionPlan` contiennent encore les anciens identifiants et ne sont pas utilisés par le cycle courant `Subscription.planId`; leur migration est à confirmer avant réutilisation.
- `AuthContext.reloadRestaurantData()` utilise `GET /api/restaurant/me`, qui renvoie le restaurant du propriétaire authentifié.
- Les QR tiers ont été remplacés par `src/lib/qr-code.ts` et la dépendance `qrcode`; les exports incluent SVG local, PNG, impression et options de taille, couleurs et logo. Le lien embarque le slug et le numéro réel de table.
- Une base de styles avec palette claire, couleurs chaudes et composants utilitaires, mais appliquée de façon inégale sur le front public.

### Socle qualité et sécurité ajouté

- `next.config.mjs` ne masque plus les erreurs de TypeScript/ESLint; `tsconfig.json` active `strict: true`. Le script `lint` lance ESLint CLI et `test` lance Vitest. `yarn.lock` est le lockfile de référence; `bun.lock` a été supprimé.
- ESLint 9 et `eslint-config-next` sont alignés sur Next 16.3.6. `yarn lint` s’exécute sans erreur bloquante; des avertissements de base subsistent (apostrophes JSX, effets React, `<img>` et variables/imports inutilisés). Aucun `any` explicite ne reste dans `src/`.
- `src/lib/auth/jwt.ts`, `src/lib/auth/session.ts` et `src/lib/auth/permissions.ts` centralisent la vérification du cookie, le rechargement du compte depuis la base et la matrice des rôles. `JWT_SECRET` n’a pas de valeur de repli. Le middleware accepte le propriétaire et le staff; les handlers appliquent ensuite leur permission.
- Le propriétaire dispose des permissions d’administration; `MANAGER` gère menu, commandes, tables, QR et analytics; `CHEF` gère menu et commandes; `WAITER` gère commandes, lecture tables et QR; `CASHIER` gère commandes et analytics; `DELIVERY` gère les commandes. La matrice est dans `src/lib/auth/permissions.ts`.
- Les endpoints admin des plats, catégories, tables, équipe, paramètres, abonnement, QR, analytics et commandes utilisent l’ID restaurant issu de la session pour filtrer les requêtes. Les entrées correspondantes sont validées par Zod; les réponses distinguent validation, authentification, autorisation et ressource absente.
- La création de commande valide les options et calcule le total depuis la base; le DTO de suivi exclut les coordonnées client, mais fournit le téléphone public du restaurant et sa devise. Les codes historiques restent acceptés avec les nouveaux codes `QR-` + 8 caractères sans caractères ambigus.
- `src/lib/rate-limit.ts` limite la création de commandes (10 requêtes / 10 min / IP), le suivi (180 / 15 min / IP), le contact (5 / heure / IP) et les avis (3 / heure / IP). La mémoire est locale au processus; les quotas ne sont pas partagés entre instances. La confiance envers les en-têtes IP et l’hébergement SSE sont **à confirmer**.
- Vitest couvre le limiteur, QR, E.164, horaires, calcul des prix/options, analytics (agrégats et plages horaires), export CSV, code de suivi, transitions, notifications, revue, cycle de vie SSE et règles de limites/états d’abonnement. Les tests Prisma sont mockés; une validation sur PostgreSQL réel reste nécessaire.
- `/api/dishes/showcase` fournit les données publiques de la vitrine sans rendre publique la route d’administration `/api/dishes`. Des frontières Suspense autour des composants utilisant `useSearchParams` permettent aussi au build Next de terminer.

### Dette technique, incohérences et bugs à traiter

1. **Authentification staff incomplète.** `POST /api/team` crée un `TeamMember`, mais ne crée ni ne lie un `User`; un membre créé n’a donc pas nécessairement de compte de connexion. Le processus d’invitation/activation est à confirmer.
2. **Permissions personnalisées non raccordées.** Le modèle `TeamMember.permissions` existe, mais l’API applique la matrice fixe issue de `TeamMember.role`. L’usage souhaité des permissions personnalisées est à confirmer.
3. **Paiement et tarifs à confirmer.** Le catalogue partagé reprend les anciens tarifs API, mais aucun prestataire ni encaissement d’abonnement n’est intégré. Les prix Enterprise et sa différenciation par rapport à Pro sont à confirmer. Les identifiants de l’enum historique `SubscriptionPlan` et du champ `Restaurant.subscriptionPlan` restent obsolètes et ne pilotent pas l’API d’abonnement actuelle.
4. **Contenus de seed et métriques marketing.** Les témoignages et FAQ du seed sont des contenus d’exemple; les statistiques fixes du hero ne sont pas liées à des mesures réelles.
5. **Avertissements ESLint résiduels.** Le lint passe mais signale encore des apostrophes JSX, appels d’état dans des effets, éléments `<img>` et imports/variables inutilisés. À traiter progressivement sans désactiver les contrôles TypeScript.
6. **Convention middleware Next.js.** Le build actuel passe mais affiche un avertissement indiquant que la convention `middleware` est dépréciée au profit de `proxy`; migration ultérieure à planifier en suivant la version Next installée.
7. **Accès public aux tables de l’aperçu.** `/api/restaurants/featured` inclut les numéros de table nécessaires au simulateur. Confirmer que cette exposition est acceptable; ces numéros ne suffisent pas à accéder aux données privées, mais peuvent alimenter les liens publics de commande.

## 5. Audit du design actuel (front-end public)

Cet audit est statique : il se fonde sur les composants et CSS du dépôt, pas sur des tests visuels multi-navigateurs.

### Styles, composants et cohérence

- La base existe déjà : fond ivoire, surfaces claires, terre cuite et vert (`src/app/design-system.css`), règles globales et animations dans `src/app/globals.css`.
- La police définie est **Plus Jakarta Sans**, chargée par URL Google Fonts ; l’import Font Awesome est aussi externe. La section hero de `HeroSection.tsx` parle de « Playfair Display », mais aucune police de ce nom n’est chargée dans les styles consultés.
- Les composants emploient beaucoup de classes Tailwind `stone-*`, `amber-*` et `orange-*` directement, en parallèle des tokens. La palette du système et les couleurs écrites dans les pages ne forment donc pas une source de vérité unique.
- Les cartes à grands rayons, ombres, dégradés, badges, animations et effets hover sont récurrents. Cela donne une direction chaleureuse, mais l’empilement peut concurrencer le contenu et les photos de plats.
- L’interface utilise à la fois Lucide et Font Awesome. Les classes de présentation, libellés, devises et règles de fallback sont parfois codés au niveau des pages plutôt que centralisés.
- Il existe une base responsive (grilles et breakpoints Tailwind), mais aucun test visuel/mobile ou rapport d’accessibilité n’est fourni.

### Problèmes concrets par page

| Page / composant | Constats à partir du code |
|---|---|
| Accueil (`src/components/pages/LandingPage/`) | Longue page marketing à nombreuses sections, animations en entrée, maquette de téléphone et textes/indicateurs fixes. Les statistiques du hero (« +32 % », « 1.5s ») ne sont pas reliées à des données visibles. Les paiements Mobile Money automatiques ne sont pas présentés comme une fonction active. Le style annoncé « Playfair » ne correspond pas à la police chargée. |
| Annuaire (`RestaurantsPage.tsx`) | Cartes à image, note, ville et statut ; la recherche et les filtres sont dans une grande carte de contrôle. Villes et catégories sont dérivées des établissements chargés. |
| Menu (`RestaurantDetailPage.tsx`, `RestaurantHero.tsx`, `RestaurantDishCard.tsx`) | En-tête photo haut (hauteur responsive jusqu’à `md:h-96`), navigation de catégories sticky, grille d’une colonne mobile puis deux/trois colonnes, bouton panier flottant. Statut ouvert, agrégats d’avis et devise sont désormais issus des données restaurant. Le champ recherche dans les plats n’est pas visible dans cette page. |
| Carte de plat | Photos d’une hauteur imposée, description limitée à deux lignes, allergènes tronqués, action Ajouter de petite taille visuelle sur écran étroit. Le bouton 3D et les badges ajoutent encore des éléments à l’image. Les images utilisent `<img>` et `next.config.mjs` désactive l’optimisation Next Image. |
| Panier (`CartPage.tsx`) | Structure responsive à deux colonnes sur desktop et une sur mobile, résumé et formulaire réunis sur le même écran. Les champs d’adresse/table, mode, coordonnées, notes et paiement forment un formulaire dense. Le panier local et la sauvegarde des données après actualisation ne sont pas accompagnés d’un état de synchronisation serveur. |
| Suivi (`OrderTrackingPage.tsx`, `OrderTrackingTimeline.tsx`) | Timeline à six états, six colonnes dès `md`, empilée sur mobile ; lisibilité des libellés et progression à éprouver sur téléphone. Le statut et l’historique arrivent par SSE avec polling de secours. |
| Contact et pages légales (`StaticPages.tsx`) | Visuels sobres ; le formulaire contact persiste maintenant les demandes, mais le service e-mail reste non configuré. Les CGU réutilisent le catalogue partagé et précisent que les tarifs sont à confirmer et le paiement d’abonnement non intégré. |

### À conserver / à refaire

- **À conserver comme base :** ambiance de restauration chaleureuse, palette terre cuite/ivoire/vert, photos locales disponibles, catégories sticky, affichage du panier accessible pendant le menu, états de chargement/erreur/état vide déjà présents, et adaptation des grilles aux breakpoints.
- **À refaire ou harmoniser :** hiérarchie et densité des sections, systèmes de couleurs et typographie, cartes de plats et d’établissements, traitement des photos, cohérence des informations (statut, note, prix, devise), formulaires mobile, microcopy, cohérence des interactions et états focus/erreur. Ne pas refondre l’architecture fonctionnelle en même temps sans besoin : le manque principal est la qualité visuelle et la cohérence du front public.

## 6. Direction de refonte du design — à reprendre ultérieurement

La refonte visuelle du front public est identifiée comme le principal chantier produit, mais elle est **hors du périmètre de la mission qualité/sécurité actuelle**. Ne pas modifier la mise en page ou l’apparence lors des changements API. Pour une phase future, la direction recommandée est un **menu éditorial gourmand, chaleureux et contemporain**, inspiré des matières et couleurs locales sans surcharger l’écran de décorations. Le plat, son prix, sa description et l’action de commande doivent dominer.

### Direction artistique et tokens de départ

Ces valeurs sont une proposition, pas des valeurs déjà toutes codées :

| Token proposé | Valeur indicative | Usage |
|---|---|---|
| `color-ink` | `#211A16` | Titres et texte principal. |
| `color-canvas` | `#F8F4ED` | Fond général doux. |
| `color-surface` | `#FFFFFF` | Cartes et feuilles de formulaire. |
| `color-brand` | `#B85F32` | Terre cuite pour action principale, dérivée de l’identité actuelle. |
| `color-brand-dark` | `#8F4322` | Survol et contrastes de marque. |
| `color-herb` | `#28624E` | Disponibilité, confirmation et éléments secondaires. |
| `color-muted` | `#716A63` | Texte secondaire lisible. |
| `color-border` | `#E7DED2` | Séparateurs et contours discrets. |
| Espacement | Échelle de 4 px : 4, 8, 12, 16, 24, 32, 48, 64 | Rythme commun entre composants. |
| Rayons | 10 px champs/badges, 16 px cartes, 24 px surfaces majeures | Moins d’effets « tout en pilule », formes cohérentes. |
| Ombres | Une ombre diffuse légère, réservée aux éléments élevés | Réduire les ombres superposées et les bordures décoratives. |
| Typographie | Sans-serif lisible pour les UI ; éventuellement une serif éditoriale limitée aux grands titres | Une seule hiérarchie de tailles/poids ; héberger les fontes retenues ou prévoir des fallbacks. |

Centraliser ces tokens dans `src/app/design-system.css`, puis remplacer progressivement les couleurs et rayons ad hoc. Respecter les contrastes, `prefers-reduced-motion` et les tailles tactiles (cible d’au moins 44 × 44 px pour les actions principales).

### Composants à créer ou refondre

1. **En-tête restaurant compact** : logo, nom, ouvert/fermé déterminé par les données, adresse, horaires, partage, livraison minimale et frais affichés sans valeur fictive.
2. **Navigation du menu** : catégories scrollables avec état actif, position sticky qui ne masque pas le contenu, compteur de plats et recherche réellement disponible si le menu est long.
3. **Carte plat mobile-first** : photo au ratio stable, nom et description lisibles, prix/devise du restaurant, allergènes accessibles, disponibilité, quantités et action Ajouter clairement touchable. Montrer la vue 3D seulement quand elle apporte une vraie valeur.
4. **Panier persistant** : bouton flottant avec nombre et total, panneau ou page de commande synthétique, modification par incréments, suppression, frais de livraison explicités et confirmation de panier multi-restaurant compréhensible.
5. **Formulaire de commande** : distinguer les champs selon sur place / retrait / livraison, résumer le total avant confirmation et énoncer le statut réel des paiements.
6. **Suivi de commande** : progression compacte et verticale sur téléphone, détails temporels disponibles, états annulée/erreur/retard/rechargement, rafraîchissement clairement annoncé.
7. **Système d’états commun** : skeletons, erreurs récupérables, actions désactivées, confirmations, focus visible et annonces accessibles pour les toasts.

### Parcours client cible

1. **Scan** : ouvrir directement le menu du bon restaurant et préremplir la table depuis le QR, sans formulaire d’entrée ni redirection non nécessaire.
2. **Découverte** : confirmer immédiatement l’établissement, son statut réel, la table et les modes de service.
3. **Choix** : parcourir des catégories lisibles, rechercher, comprendre les plats (photo, description, prix, allergènes) et ajouter sans perdre sa position.
4. **Panier** : afficher un récapitulatif toujours accessible, éviter les ajouts involontaires à un panier d’un autre établissement et conserver les choix en cas de retour.
5. **Commande** : limiter les champs au strict nécessaire, adapter les champs à la commande et présenter le mode de paiement réellement supporté.
6. **Suivi** : montrer le code, l’état courant, la prochaine étape et les actions utiles ; informer lorsque l’état change.

### Ordre d’implémentation par page

| Priorité | Écran | Cible |
|---:|---|---|
| 1 | Menu restaurant et carte plat | C’est le point d’entrée principal depuis le QR : traiter d’abord la lisibilité des plats, le statut et l’ajout au panier. |
| 2 | Panier / checkout | Réduire les frictions et erreurs mobiles ; valider les frais, le type de commande et le paiement. |
| 3 | Suivi de commande | Rendre la timeline compréhensible sur téléphone et les changements de statut fiables. |
| 4 | Annuaire restaurants | Simplifier recherche/filtres et créer une hiérarchie visuelle plus orientée photos et découverte. |
| 5 | Vitrine d’accueil | Réduire le bruit décoratif, remplacer les chiffres non sourcés et clarifier la proposition de valeur. |
| 6 | Contact et pages informatives | Harmoniser le style et les informations commerciales avec les fonctionnalités réelles. |

Travailler mobile-first sur une largeur de téléphone typique ; vérifier notamment les vues 320–390 px, les zones de saisie avec clavier ouvert, le bouton panier au-dessus des zones système, la navigation sticky et la lecture au soleil. Ajouter ensuite des contrôles à tablette et desktop, sans laisser les breakpoints desktop définir l’expérience du scan QR.

### Interactions et animations

- Conserver des transitions brèves (environ 150–220 ms) sur l’ajout au panier, l’ouverture du détail et le changement d’état ; éviter de faire animer toutes les cartes à l’apparition.
- Montrer un retour immédiat et non bloquant à l’ajout (quantité mise à jour / toast), sans deux notifications identiques.
- Prévoir des placeholders d’image, un état menu vide et une erreur de chargement avec action de reprise.
- Respecter `prefers-reduced-motion`; ne pas utiliser d’animation infinie pour les icônes décoratives.
- Conserver les annonces de statut en texte et les états clavier/focus, pas uniquement la couleur ou le mouvement.

## 7. Fonctionnalités proposées

Les priorités ci-dessous sont des propositions. La complexité et l’impact sont estimatifs.

| Priorité | Fonctionnalité | Valeur | Complexité | Impact architecture |
|---|---|---|---|---|
| Haute | Paiement réel Mobile Money (MTN/Moov) puis carte si nécessaire | Réduire le paiement manuel et permettre de confirmer la transaction au restaurateur et au client. | Élevée | Ajouter l’intégration d’un prestataire, références de transaction, callbacks/webhooks idempotents, statuts paiement et gestion d’échec/remboursement ; conserver les commandes comme source de vérité. |
| Haute | Création et activation des comptes d’équipe | Permettre aux membres déjà enregistrés via `TeamMember` de se connecter avec leur rôle réel. | Moyenne | Définir un flux d’invitation/activation, lier `TeamMember.userId`, sécuriser la création d’identifiants et garantir la cohérence entre `User.restaurantId` et l’adhésion active. |
| Haute | Diffusion SSE multi-instance | Assurer les événements lorsque plusieurs instances ou un hébergement serverless sont utilisés. | Moyenne | Choisir un pub/sub partagé et vérifier les limites de connexions persistantes et de buffering de l’hébergement (**à confirmer**). |
| Moyenne | Personnalisation de marque par restaurant | Rendre les menus plus reconnaissables : logo, couverture, couleurs, éventuellement police et présentation. | Moyenne | Ajouter un thème validé au modèle restaurant/settings et l’appliquer avec variables CSS sur les pages menu ; conserver une palette accessible. |
| Moyenne | Fuseau horaire paramétrable | Aligner les périodes analytics et horaires sur le fuseau propre à chaque restaurant. | Faible à moyenne | Ajouter et valider un champ IANA dans les paramètres restaurant; actuellement `Africa/Porto-Novo` est le défaut (**à confirmer**). |
| Moyenne | Promotions / coupons | Permettre des campagnes simples avec dates, seuil minimum et remise ; `Coupon` existe déjà dans Prisma. | Moyenne | Ajouter CRUD et validation serveur, calcul du prix, application atomique de la remise et règles d’expiration ; écran dashboard et affichage menu. |
| Moyenne | Multilingue FR/EN (puis langues locales selon besoin) | Servir les touristes et clients aux préférences linguistiques différentes. | Élevée | Introduire des messages localisés, préférence de langue et traductions de contenu restaurant ; modifier routes, formulaire, menu et dashboard. Choix des langues locales à confirmer avec les utilisateurs. |
| Moyenne | Gestion du stock / disponibilité | Éviter de vendre un plat ou ingrédient épuisé et aider l’équipe à réapprovisionner. | Élevée | Modèle d’inventaire/mouvements, seuils et décrémentation cohérente avec la commande ; le `isAvailable` du plat ne constitue pas un stock. |
| Basse | Avis clients vérifiés après commande | Augmenter la confiance avec des retours liés à une expérience réelle ; `Review` existe mais n’est pas relié à une commande. | Moyenne | Lier l’avis à une commande terminée, ajouter API/modération et alimenter rating/reviewCount avec des agrégats réels. |
| Basse | Modèles de signalétique QR imprimables | Faciliter l’identité visuelle sur les tables et la pose des codes en série. | Faible à moyenne | Ajouter des modèles PDF/SVG avec nom du restaurant et numéro de table; la génération locale, les couleurs, le logo, le PNG et l’impression navigateur existent déjà. |
| Basse | PWA et consultation hors ligne | Améliorer la réouverture du menu avec un réseau instable. | Moyenne à élevée | Manifest, service worker, stratégie cache versionnée des menus/images ; les commandes restent en ligne et ne doivent pas être confirmées hors connexion. |

## 8. Feuille de route

### Court terme — valider les parcours réels et consolider la qualité

1. **Maintenir** `yarn typecheck`, `yarn lint`, `yarn test` et `yarn build`; enrichir les tests au-delà des mocks avec une base PostgreSQL dédiée.
2. **Confirmer la matrice de permissions avec le produit**, notamment les permissions granulaires et les tâches des rôles `MANAGER`, `CHEF`, `WAITER`, `CASHIER` et `DELIVERY`.
3. **Définir le cycle de vie des comptes staff** avant d’exposer l’accès dashboard à de nouveaux membres.
4. **Remplacer ou compléter le rate limiter en mémoire** par une solution partagée si plusieurs instances sont déployées; confirmer l’en-tête IP de confiance du proxy.
5. **Tester en navigateur les exports QR** (PNG, logo, couleurs, impression) et les liens de table sur les écrans réels.

**Dépendances :** valider les rôles et le cycle des comptes staff avant les tests d’autorisation de bout en bout; choisir le stockage partagé avant de prétendre appliquer des quotas globaux. La refonte du front public est reportée à une phase produit distincte et ne doit pas être mélangée à la présente mission.

### Moyen terme — fiabilité produit et outils restaurateur

1. Implémenter paiements Mobile Money dans un ordre compatible avec le prestataire retenu; ajouter webhooks et tests de répétition/échec.
2. Déployer un pub/sub partagé si les SSE doivent desservir plusieurs instances; conserver le polling de secours.
3. Confirmer les tarifs et la différenciation Enterprise; intégrer un prestataire de paiement avant d’activer encaissement, factures payées ou renouvellement automatique.
4. Ajouter des tests d’intégration pour authentification/autorisation, CRUD, isolation multi-tenant et calculs financiers.
5. Reprendre ensuite le redesign public mobile-first décrit en section 6, sans modifier les contrats de sécurité validés.

**Dépendances :** les paiements dépendent du recalcul de prix serveur et d’une gestion sûre des statuts; le SSE multi-instance dépend d’un pub/sub partagé et d’un hébergement adapté; les tests d’intégration dépendent d’une configuration PostgreSQL dédiée.

### Long terme — différenciation et expansion

1. Ajouter personnalisation de marque et multilingue selon les besoins validés.
2. Ajouter promotions/coupons et avis vérifiés, après définition de règles de fraude/modération.
3. Développer l’inventaire lorsque la gestion opérationnelle et les unités/recettes sont spécifiées.
4. Ajouter PWA/cache offline pour la consultation, uniquement avec une stratégie de fraîcheur et sans masquer l’échec d’envoi d’une commande.
5. Valider le périmètre et le prix Enterprise avant d’y ajouter des fonctions multi-sites, POS ou exports.

## 9. Guide pour reprendre le projet

### Prérequis et installation

- Node.js **20 ou supérieur** et Yarn **1.22 ou supérieur**, déclarés dans `package.json`.
- PostgreSQL accessible et une URL de connexion configurée pour Prisma.
- Le script `postinstall` exécute `prisma generate`.

Commandes déclarées :

```bash
yarn install
cp .env.example .env.local
# Renseigner les variables localement, sans committer les secrets.
yarn dev
```

Le serveur Next de développement écoute sur le port 3000 (`0.0.0.0`). Commandes de projet :

| Besoin | Commande | Note |
|---|---|---|
| Développement | `yarn dev` | Next dev sur le port 3000. |
| Production localement | `yarn build` puis `yarn start` | Le build ne masque plus les erreurs TypeScript. `next build` ne lance pas le script ESLint; lancer aussi `yarn lint`. |
| Vérification TypeScript | `yarn typecheck` | `tsc --noEmit`, compilateur en mode strict. |
| Lint | `yarn lint` | ESLint CLI via `eslint src`; exit réussi avec avertissements à résorber. |
| Migration Prisma locale | `yarn db:migrate` | Exécute `prisma migrate dev`; nécessite PostgreSQL et un schéma/migrations cohérents. |
| Synchronisation schéma | `yarn db:push` | `prisma db push`, sans créer de migration versionnée. |
| Interface Prisma Studio | `yarn db:studio` | Nécessite une connexion DB. |
| Tests | `yarn test` | Vitest; couvre notamment commandes, analytics/périodes/CSV, notifications, avis, SSE et plusieurs routes Prisma mockées. |

### Variables d’environnement

Noms observés seulement — **aucune valeur secrète ne doit être copiée dans ce document ou commitée** :

| Nom | Rôle visible / réserve |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL utilisée par Prisma. |
| `JWT_SECRET` | Obligatoire pour signer/vérifier les sessions; l’authentification renvoie une erreur de configuration si absent. |
| `NEXT_PUBLIC_APP_URL` | Origine applicative prioritaire pour la génération des liens QR; la route peut sinon utiliser l’origine de la requête. |

Ces trois noms sont les entrées déclarées dans `.env.example`; leurs valeurs y sont laissées vides. Ne pas lire ou publier les valeurs de `.env` ; ce fichier est local et ne fait pas partie des instructions. Il n’existe plus de valeur de repli JWT.

### Conventions et points d’attention

- Les pages suivent l’App Router (`src/app/**/page.tsx`) et les endpoints utilisent `route.ts`.
- Alias TypeScript `@/*` vers `src/*` ; composants majoritairement fonctionnels React et fichiers `.tsx`.
- Le code mêle français et anglais dans noms de variables, commentaires et libellés. Réutiliser le vocabulaire local du module touché et éviter d’en accentuer l’incohérence.
- Lire en premier : `package.json`, `src/app/layout.tsx`, `src/types/index.ts`, `prisma/schema.prisma`, `src/lib/prisma.ts`, `src/context/AuthContext.tsx`, `src/context/CartContext.tsx`, `src/context/OrderContext.tsx`, puis les composants concernés.
- Pour le dashboard, lire `src/components/dashboard/RestaurantDashboard.tsx` et l’onglet ciblé. Attention au mélange d’état local et API signalé en section 4.
- Pour la commande, lire ensemble `RestaurantDetailPage.tsx`, `CartContext.tsx`, `CartPage.tsx`, `OrderContext.tsx`, `src/app/api/orders/route.ts` et le schéma Prisma. Le serveur recalcule maintenant le total depuis les plats disponibles en base.
- Garder les statuts partagés cohérents entre enums Prisma, `src/types/index.ts`, Kanban dashboard et timeline de suivi.
- Les helpers d’authentification/permissions sont sous `src/lib/auth/`; les erreurs Zod/Prisma sont traitées dans `src/lib/api/validation.ts`, et le rate limit est dans `src/lib/rate-limit.ts`.
- Les quotas de rate limit ne sont pas distribués; avant le déploiement multi-instance, choisir une solution partagée et confirmer que le proxy écrase les en-têtes IP entrants.
- Les routes de suivi acceptent les codes historiques `QR-####` et les nouveaux codes `QR-` + 8 caractères sans caractères ambigus. Seul le panier est stocké localement; il reste un cache non fiable, et le serveur revalide le catalogue et les prix lors de la commande.
- Ne pas supposer que la création d’un `TeamMember` crée aussi un compte de connexion; cette relation doit être implémentée/confirmée avant de donner l’accès dashboard à un nouveau membre.
- Éviter d’éditer `generated/prisma/` à la main. Modifier `prisma/schema.prisma`, créer une migration avec la procédure choisie, puis régénérer le client.
- Les paramètres d’ouverture historiques peuvent être un texte libre ou un JSON par jour ; `SettingsTab` contient une logique de conversion et peut refuser les formats inconnus.
- La priorité de la mission en cours est **la qualité et la sécurité API**. La refonte visuelle est explicitement reportée; préserver la mise en page et l’apparence lors de corrections API.
