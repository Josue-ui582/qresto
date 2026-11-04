# Déployer une démo gratuite sur Vercel

Cette procédure utilise les offres gratuites Vercel Hobby, Neon Free et Cloudinary Free. Elle ne requiert ni domaine acheté ni prestataire de paiement ou de messagerie. Le site sera servi sur `*.vercel.app`.

## 1. Créer les services

1. **Neon** : créez un compte et un projet PostgreSQL dans une région proche des utilisateurs. Dans le tableau de bord Neon, copiez la chaîne de connexion **pooled** pour `DATABASE_URL` et la chaîne **directe, non poolée** pour `DIRECT_URL`. Les deux doivent utiliser TLS (`sslmode=require`).
2. **Cloudinary** : créez un compte gratuit et relevez le cloud name, l’API key et l’API secret dans les paramètres du compte. Les téléversements QResto sont signés côté serveur et rangés sous `restaurants/<identifiant>`.
3. **Vercel** : créez un compte gratuit et reliez-le au compte GitHub qui héberge le dépôt.

Les limites gratuites des fournisseurs s’appliquent; surveillez les quotas dans leurs tableaux de bord. N’ajoutez aucun secret au dépôt, à une capture, à un ticket public ou aux journaux de commandes.

## 2. Variables d’environnement Vercel

Importez le dépôt dans Vercel, gardez la racine du projet et le framework Next.js détecté automatiquement, puis ajoutez les variables suivantes dans **Settings → Environment Variables**. Configurez-les pour **Production** (et Preview si les previews doivent aussi être des démos).

| Variable | Valeur à saisir |
|---|---|
| `APP_ENV` | `staging` |
| `DATABASE_URL` | URL Neon pooled, TLS activé |
| `DIRECT_URL` | URL Neon directe/non poolée, TLS activé |
| `JWT_SECRET` | Secret aléatoire d’au moins 32 caractères, généré hors du dépôt |
| `NEXT_PUBLIC_APP_URL` | Origine `https://<projet>.vercel.app` prévue |
| `STORAGE_PROVIDER` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name du compte Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |
| `WHATSAPP_PROVIDER` | `simulated` |
| `PAYMENT_PROVIDER` | `simulated` |
| `ALLOW_REAL_PROVIDERS_IN_STAGING` | `false` |
| `DEMO_OWNER_PASSWORD` | Mot de passe fort, défini uniquement dans le gestionnaire de secrets |
| `DEMO_OWNER_EMAIL` | Facultatif; sinon `demo@qresto.example` |

`UPLOADS_DIRECTORY` n’est utile qu’en développement local. Il ne faut pas configurer un stockage local en staging. Un démarrage staging est refusé si Cloudinary n’est pas sélectionné ou si ses identifiants manquent. Un fournisseur réel en staging est refusé sans `ALLOW_REAL_PROVIDERS_IN_STAGING=true`; QResto force néanmoins les intégrations WhatsApp et paiement en mode simulé en staging.

La variable `NEXT_PUBLIC_APP_URL` est utilisée pour les URL publiques et est intégrée au build. Renseignez l’origine Vercel prévue avant le premier déploiement, puis corrigez-la avec l’URL effective et redéployez si le nom du projet a changé.

## 3. Premier déploiement

1. Dans Vercel, choisissez **Add New → Project**, importez `Josue-ui582/qresto`, conservez la racine du dépôt et le build Next.js par défaut. Ajoutez les variables ci-dessus avant le premier build et déployez.
2. Depuis un environnement administrateur local, fournissez temporairement `DIRECT_URL` et `DATABASE_URL` via des variables d’environnement locales sécurisées (ne les collez ni dans une commande enregistrée ni dans Git), puis lancez :

   ```sh
   yarn db:deploy
   ```

   `db:deploy` applique uniquement les migrations versionnées et utilise `DIRECT_URL` pour la connexion non poolée. Le script `build` exécute aussi `prisma generate`, ce qui génère le client dans `generated/prisma` avant `next build`.
3. Dans le même environnement sécurisé, définissez `APP_ENV=staging` et `DEMO_OWNER_PASSWORD`, puis lancez le seed idempotent :

   ```sh
   yarn db:seed
   ```

   Le seed conserve les contenus FAQ/témoignages et crée le restaurant, le compte restaurateur, le menu, les tables, les commandes et avis de démonstration. Les coordonnées présentes dans ces commandes sont fictives; aucun message WhatsApp ni paiement n’est réellement envoyé ou encaissé.
4. Vérifiez le domaine effectif attribué par Vercel. Si nécessaire, mettez `NEXT_PUBLIC_APP_URL` à jour dans Vercel puis effectuez un nouveau déploiement afin que les URL/QR générés correspondent au domaine final.

Le compte de démonstration utilise `DEMO_OWNER_EMAIL` (ou `demo@qresto.example`) et le mot de passe présent dans `DEMO_OWNER_PASSWORD`. Communiquez ce mot de passe par un canal privé seulement.

## 4. Mises à jour

1. Poussez les changements sur la branche de déploiement; Vercel construit et déploie automatiquement la branche configurée.
2. Avant de promouvoir le nouveau code, appliquez les migrations compatibles sur la base de staging avec `yarn db:deploy` et les mêmes URLs Neon fournies de manière sécurisée.
3. Si le jeu de démo doit être actualisé, relancez `yarn db:seed` avec `APP_ENV=staging` et `DEMO_OWNER_PASSWORD`. Le seed réutilise les identifiants stables et ne crée pas de doublons.
4. Déclenchez ou attendez le redéploiement Vercel. Pour les changements de `NEXT_PUBLIC_APP_URL`, un nouveau build est nécessaire.

## 5. Limites du plan gratuit et temps réel

- Les API ont une durée maximale de 10 secondes (`vercel.json`); le téléversement Cloudinary a également un délai réseau inférieur à cette limite. Les longues tâches doivent être déplacées vers un traitement asynchrone.
- Le bus SSE actuel et le limiteur de débit utilisent une mémoire locale au processus. Sur Vercel serverless, cette mémoire n’est ni partagée entre instances ni durable; les limites par IP sont donc **indicatives, par instance**, et ne constituent pas une protection anti-abus distribuée. Un KV/Redis externe serait nécessaire pour une garantie globale.
- Les données de commandes et notifications sont persistées en PostgreSQL. Si le flux SSE est interrompu, les pages de suivi et le dashboard activent le repli polling (5 s pour le suivi, 10 s pour le dashboard); l’EventSource retente ensuite la connexion. Le polling permet de retrouver l’état même si deux requêtes atteignent des instances distinctes.
- `next/image` est configuré en mode `unoptimized`; aucune liste de domaines distants n’est donc nécessaire pour Cloudinary.

## 6. Checklist de vérification

- [ ] `GET https://<projet>.vercel.app/api/health` répond `200` avec `{"status":"ok"}` sans détails de connexion.
- [ ] `/robots.txt` interdit l’indexation et les réponses ont l’en-tête `X-Robots-Tag: noindex, nofollow, noarchive`.
- [ ] Le bandeau discret annonce l’environnement de démonstration et les intégrations simulées.
- [ ] Le menu du restaurant « Le Maquis du Baobab » s’affiche et ses catégories/plats sont consultables.
- [ ] Une commande de test peut être créée; le code de suivi affiché ouvre sa page et le polling actualise l’état si SSE est coupé.
- [ ] Une commande livrée permet de consulter/déposer un avis; les avis apparaissent dans le dashboard.
- [ ] Le compte restaurateur de démonstration ouvre le dashboard; les commandes et les entrées WhatsApp/paiement simulées sont consultables dans les notifications.
- [ ] Un téléversement JPEG, PNG ou WebP de moins de 5 Mo est présent dans le dossier Cloudinary du restaurant; SVG et fichiers supérieurs à la limite sont refusés.
- [ ] Les cookies d’authentification sur le domaine HTTPS ont `Secure`, `HttpOnly` et `SameSite=Lax`.
- [ ] Aucun vrai numéro client, secret fournisseur ou secret JWT n’est présent dans les données, logs, variables publiques ou commits.
