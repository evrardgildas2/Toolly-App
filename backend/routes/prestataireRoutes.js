const express = require('express');
const { proteger, autoriserRoles } = require('../middleware/auth');
const {
  listerPrestatairesPublics,
  obtenirPrestatairePublic,
  soumettreVerification,
  listerVerificationsEnAttente,
  approuverVerification,
  rejeterVerification,
} = require('../controllers/prestataireController');

const router = express.Router();

// Public
router.get('/', listerPrestatairesPublics);
router.get('/:id', obtenirPrestatairePublic);

// Prestataire
router.post('/verification', proteger, autoriserRoles('prestataire'), soumettreVerification);

// Administrateur
router.get(
  '/verification/en-attente',
  proteger,
  autoriserRoles('administrateur'),
  listerVerificationsEnAttente
);
router.patch(
  '/:id/verification/approuver',
  proteger,
  autoriserRoles('administrateur'),
  approuverVerification
);
router.patch(
  '/:id/verification/rejeter',
  proteger,
  autoriserRoles('administrateur'),
  rejeterVerification
);

module.exports = router;
