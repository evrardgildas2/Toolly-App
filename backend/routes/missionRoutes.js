const express = require('express');
const { proteger, autoriserRoles } = require('../middleware/auth');
const {
  demanderMission,
  listerMesMissions,
  accepterMission,
  refuserMission,
  demarrerMission,
  confirmerFinMission,
  annulerMission,
} = require('../controllers/missionController');

const router = express.Router();

// Client
router.post('/', proteger, autoriserRoles('client'), demanderMission);

// Client + Prestataire
router.get('/mes-missions', proteger, autoriserRoles('client', 'prestataire'), listerMesMissions);
router.patch('/:id/confirmer-fin', proteger, autoriserRoles('client', 'prestataire'), confirmerFinMission);
router.patch('/:id/annuler', proteger, autoriserRoles('client', 'prestataire'), annulerMission);

// Prestataire
router.patch('/:id/accepter', proteger, autoriserRoles('prestataire'), accepterMission);
router.patch('/:id/refuser', proteger, autoriserRoles('prestataire'), refuserMission);
router.patch('/:id/demarrer', proteger, autoriserRoles('prestataire'), demarrerMission);

module.exports = router;
