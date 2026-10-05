# Toolly 2.0 — Base du projet (Phase 1, étape 1 et 2)

## Structure

- `backend/` — API Node.js/Express + MongoDB (Mongoose)
- `frontend/` — Application React (Vite)

## Démarrage du backend

```bash
cd backend
npm install
cp .env.example .env
# Modifier .env : renseigner MONGO_URI (local ou MongoDB Atlas) et JWT_SECRET
npm run dev
```

L'API démarre sur `http://localhost:5000`. Test rapide : `GET http://localhost:5000/api/sante`.

## Démarrage du frontend

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`.

## Ce qui est déjà en place

- Modèle `Utilisateur` de base avec discriminateurs Mongoose pour `client`, `prestataire`, `administrateur` (évite de dupliquer nom/email/mot de passe/téléphone dans chaque rôle).
- Inscription et connexion avec JWT, mot de passe haché (bcrypt).
- Modèles `Categorie`, `Service`, `Mission` (avec double confirmation client/prestataire et historique des statuts).
- Frontend : pages Connexion, Inscription (choix du rôle client/prestataire), Accueil.

## Prochaines étapes (suite de la Phase 1)

- Routes/contrôleurs CRUD pour `Categorie` et `Service`
- Routes/contrôleurs pour le flux complet des `Mission` (demande, acceptation, confirmation)
- Messagerie basique
- Notation
- Réalisations
- Commission & intégration paiement
