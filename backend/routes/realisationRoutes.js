const express = require('express');
const { proteger, autoriserRoles } = require('../middleware/auth');
const {
  listerRealisationsPubliques,
  obtenirRealisation,
  creerRealisation,
  listerMesRealisations,
  modifierRealisation,
  supprimerRealisation,
} = require('../controllers/realisationController');

const router = express.Router();

// Public
router.get('/', listerRealisationsPubliques);

// Prestataire (routes spécifiques avant /:id)
router.get('/mes-realisations', proteger, autoriserRoles('prestataire'), listerMesRealisations);
router.post('/', proteger, autoriserRoles('prestataire'), creerRealisation);
router.put('/:id', proteger, autoriserRoles('prestataire'), modifierRealisation);
router.delete('/:id', proteger, autoriserRoles('prestataire'), supprimerRealisation);

// Public (après /mes-realisations pour ne pas être intercepté)
router.get('/:id', obtenirRealisation);

module.exports = router;
