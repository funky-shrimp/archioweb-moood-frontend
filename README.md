# Mooodboard - Frontend

Application web moderne de création et partage de moodboards interactifs. Créez des tableaux visuels personnalisés avec des éléments multimédias (images, textes, vidéos, audio) et partagez-les avec la communauté.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Build et Déploiement](#build-et-déploiement)
- [Architecture](#architecture)
- [Bonnes Pratiques](#bonnes-pratiques)
- [Équipe](#équipe)
- [Liens](#liens)

## ✨ Fonctionnalités

### 1. Gestion des utilisateurs
- **Inscription et connexion** : Authentification complète via l'API backend
- **Stockage sécurisé** : Token JWT stocké localement avec gestion automatique de session
- **Interface dynamique** : Mise à jour en temps réel de l'UI selon l'état de connexion
- **Profils utilisateurs** : Consultation et modification des profils (username, bio, avatar)

### 2. Gestion des ressources (Boards)
- **CRUD complet** :
  - Création de boards personnalisés avec drag & drop d'éléments
  - Visualisation des boards avec pan/zoom interactif
  - Modification et suppression des boards personnels
- **Exploration** :
  - Liste paginée des boards publics
  - Recherche avec filtres (tags, utilisateurs)
  - Données agrégées (likes, commentaires)
- **Interactions sociales** :
  - Système de likes
  - Commentaires
  - Suivi d'utilisateurs (Follow)

### 3. Fonctionnalités temps réel
- **Canvas interactif** : Manipulation fluide des éléments avec animations
- **Drag & drop** : Positionnement précis des éléments multimédias
- **Pan & Zoom** : Navigation intuitive sur les boards
- **Feedback visuel** : Animations et transitions optimisées

## 🛠 Stack Technique

- **Framework** : Vue 3 (Composition API avec `<script setup>`)
- **Build Tool** : Vite
- **State Management** : Pinia
- **Routing** : Vue Router avec gardes d'authentification
- **HTTP Client** : Axios
- **Styling** : CSS Scoped (responsive-first)

## 📦 Installation

### Prérequis
- Node.js >= 18.x
- npm >= 9.x

### Étapes d'installation

```bash
# Cloner le repository
git clone https://github.com/votre-org/archioweb-moood-frontend.git
cd archioweb-moood-frontend

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:3000/api

# Mode développement avec fixtures (true/false)
VITE_USE_FIXTURES=false
```

### Variables pour la production (Render)

Configurez les variables d'environnement suivantes dans Render :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend déployée | `https://your-api.onrender.com/api` |
| `VITE_USE_FIXTURES` | Désactiver les fixtures en production | `false` |

## 💻 Développement

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Mode développement avec fixtures

Pour développer sans backend :

```env
VITE_USE_FIXTURES=true
```

Les fixtures se trouvent dans `src/_dev/fixtures.js`

### Commandes utiles

```bash
# Linter
npm run lint

# Format du code
npm run format

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🚀 Build et Déploiement

### Build local

```bash
npm run build
```

Le build sera généré dans le dossier `dist/`

### Déploiement sur Render

#### Configuration Render

1. **Service** : Static Site
2. **Build Command** : `npm install && npm run build`
3. **Publish Directory** : `dist`
4. **Node Version** : 18.x

#### Variables d'environnement Render

Configurez dans l'interface Render :
- `VITE_API_URL` = URL de votre API backend
- `VITE_USE_FIXTURES` = `false`

#### Déploiement automatique

Le projet est configuré pour le déploiement automatique depuis la branche `main` :

```bash
# Pousser les changements
git add .
git commit -m "Description des modifications"
git push origin main
```

Render détectera automatiquement les changements et déclenchera un nouveau build.

## 🏗 Architecture

### Structure du projet

```
src/
├── assets/          # Fichiers statiques (styles globaux, images)
├── components/      # Composants réutilisables
│   ├── BoardCanvas.vue
│   ├── BoardCard.vue
│   ├── Header.vue
│   ├── ProfileEdit.vue
│   └── ...
├── pages/           # Vues/Pages de l'application
│   ├── Explore.vue
│   ├── BoardView.vue
│   ├── BoardEdit.vue
│   ├── Profile.vue
│   └── ...
├── router/          # Configuration du routeur
│   └── index.js
├── services/        # Services (API, utilitaires)
│   └── api.js
├── stores/          # State management (Pinia)
│   └── auth.js
├── _dev/            # Données de développement
│   └── fixtures.js
├── App.vue          # Composant racine
└── main.js          # Point d'entrée
```

### Routes principales

| Route | Page | Protection |
|-------|------|------------|
| `/` | Redirection vers Explore | - |
| `/explore` | Liste des boards publics | - |
| `/search` | Recherche de boards | - |
| `/board/:id` | Détail d'un board | - |
| `/board/edit` | Création de board | Auth requise |
| `/profile/:username` | Profil utilisateur | - |
| `/login` | Connexion | Public |
| `/signup` | Inscription | Public |

## ✅ Bonnes Pratiques

### 1. Composants Vue.js
- **Composition API** : Utilisation systématique de `<script setup>`
- **Props/Emits** : Typage explicite et documentation
- **Réutilisabilité** : Composants modulaires et découplés
- **Scoped CSS** : Styles isolés par composant

### 2. Gestion d'état
- **Pinia Store** : Centralisation de l'authentification
- **Persistance** : localStorage pour le token JWT
- **Réactivité** : Computed properties pour les états dérivés

### 3. Routing
- **Gardes de navigation** : Protection des routes authentifiées
- **Lazy loading** : Chargement différé des pages
- **Meta-données** : Configuration via route.meta

### 4. Gestion asynchrone
- **Async/await** : Syntaxe moderne pour les appels API
- **Gestion d'erreurs** : Try/catch systématique
- **Feedback utilisateur** : Messages d'erreur explicites
- **Loading states** : Indicateurs de chargement

### 5. Responsive Design
- **Mobile-first** : Approche responsive avec breakpoints
- **Media queries** : `@media (max-width: 768px)`
- **Touch-friendly** : Éléments tactiles adaptés (40px minimum)
- **Navigation mobile** : Menu burger, overlay

### 6. UX/UI
- **Validation client** : Formulaires avec feedback immédiat
- **Messages d'erreur** : Textes clairs et exploitables
- **Transitions** : Animations fluides (CSS transitions)
- **Accessibilité** : Boutons, labels, contraste

## 👥 Équipe

- **[Nom Membre 1]** - [Role]
- **[Nom Membre 2]** - [Role]
- **[Nom Membre 3]** - [Role]
- **Théo** - Frontend Developer

## 🔗 Liens

- **Frontend déployé** : [https://votre-app.onrender.com](https://votre-app.onrender.com)
- **Backend API** : [https://votre-api.onrender.com](https://votre-api.onrender.com)
- **Repository Backend** : [https://github.com/votre-org/archioweb-moood-backend](https://github.com/votre-org/archioweb-moood-backend)
- **Documentation API** : [https://votre-api.onrender.com/docs](https://votre-api.onrender.com/docs)

## 📝 IDE Setup (Recommandé)

### VS Code
- [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Désactiver Vetur si installé

### Browser DevTools
- **Chrome/Edge** : [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox** : [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

---

**Projet réalisé dans le cadre du cours ArchiOWeb - 2026**



