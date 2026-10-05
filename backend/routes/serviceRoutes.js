const express = require('express');
const { proteger, autoriserRoles } = require('../middleware/auth');
const {
  listerServices,
  obtenirService,
  creerService,
  listerMesServices,
  modifierService,
  supprimerService,
} = require('../controllers/serviceController');

const router = express.Router();

// Public
router.get('/', listerServices);

// Prestataire (routes spécifiques avant /:id pour éviter les conflits de route)
router.get('/mes-services', proteger, autoriserRoles('prestataire'), listerMesServices);
router.post('/', proteger, autoriserRoles('prestataire'), creerService);
router.put('/:id', proteger, autoriserRoles('prestataire'), modifierService);
router.delete('/:id', proteger, autoriserRoles('prestataire'), supprimerService);

// Public (déclarée après pour ne pas intercepter /mes-services)
router.get('/:id', obtenirService);

module.exports = router;
