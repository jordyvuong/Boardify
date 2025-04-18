# Boardify - Clone de Trello

Boardify est un clone de Trello développé avec Vue.js et Firebase dans le cadre du projet fil rouge EFREI 2B.

## Membres du groupe

- Jordy Vuong
- Dylan Zakaharinivo
- Johan Gourmand
- Emmanuel Mbengo

## Fonctionnalités

- **Authentification complète**: Inscription, connexion et déconnexion des utilisateurs
- **Tableaux personnalisables**: Création, affichage, modification et suppression de tableaux
- **Listes et cartes**: Organisation des tâches en listes et cartes
- **Glisser-déposer**: Réorganisation des listes et des cartes par drag & drop
- **Étiquettes et dates**: Ajout d'étiquettes et de dates d'échéance aux cartes
- **Recherche**: Recherche rapide parmi les tableaux et les cartes

## Technologies utilisées

- **Frontend**:

  - Vue.js 3 (Composition API)
  - Vue Router
  - Pinia (State Management)

- **Backend & Base de données**:

  - Firebase Authentication
  - Firebase Realtime Database
  - Firebase Stockage

## Installation

### Prérequis

- Node.js v14+ et npm
- Compte Firebase

### Étapes d'installation

1. Cloner le dépôt:

   ```bash
   git clone https://github.com/jordyvuong/Boardify.git
   cd boardify
   ```

2. Installer les dépendances:

   ```bash
   npm install
   ```

3. Démarrer le serveur de développement:

   ```bash
   npm run dev
   ```

4. L'application sera disponible à l'adresse: `http://localhost:5173/`

## Structure du projet

```
boardify/
├── public/              # Fichiers statiques
├── src/
│   ├── assets/          # Images et styles
│   ├── components/      # Composants Vue réutilisables
│   ├── firebase/        # Configuration Firebase
│   ├── router/          # Configuration du routeur
│   ├── stores/          # Stores Pinia
│   ├── utils/           # Fonctions utilitaires
│   ├── views/           # Composants de page
│   ├── App.vue          # Composant racine
│   └── main.js          # Point d'entrée de l'application
└── package.json         # Dépendances et scripts
```

## Usage

1. Créez un compte sur la page d'inscription ou connectez-vous
2. Sur la page des tableaux, créez un nouveau tableau
3. Ajoutez des listes et des cartes à votre tableau
4. Utilisez le glisser-déposer pour réorganiser vos listes et cartes
5. Cliquez sur une carte pour voir et modifier ses détails

## Développement

### Commandes disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise l'application compilée

## Remarques de mise en œuvre

- L'application utilise Firebase pour l'authentification et le stockage des données, ce qui élimine le besoin d'un backend traditionnel
- Le code est organisé selon le principe de responsabilité unique, avec des composants Vue.js modulaires
- Le store Pinia centralise la gestion de l'état et la communication avec Firebase
- La fonctionnalité de glisser-déposer est implémentée à l'aide de l'API native HTML5
