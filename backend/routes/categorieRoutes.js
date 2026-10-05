const express = require('express');
const { proteger, autoriserRoles } = require('../middleware/auth');
const {
  listerCategories,
  creerCategorie,
  proposerCategorie,
  listerCategoriesEnAttente,
  approuverCategorie,
  rejeterCategorie,
} = require('../controllers/categorieController');

const router = express.Router();

// Public
router.get('/', listerCategories);

// Administrateur
router.post('/', proteger, autoriserRoles('administrateur'), creerCategorie);
router.get('/en-attente', proteger, autoriserRoles('administrateur'), listerCategoriesEnAttente);
router.patch('/:id/approuver', proteger, autoriserRoles('administrateur'), approuverCategorie);
router.patch('/:id/rejeter', proteger, autoriserRoles('administrateur'), rejeterCategorie);

// Prestataire
router.post('/proposer', proteger, autoriserRoles('prestataire'), proposerCategorie);

module.exports = router;
