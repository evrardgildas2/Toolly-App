const express = require('express');
const { proteger, autoriserRoles } = require('../middleware/auth');
const { creerNotation, listerMesNotationsRecues } = require('../controllers/notationController');

const router = express.Router();

router.post('/', proteger, autoriserRoles('client'), creerNotation);
router.get('/mes-notations-recues', proteger, autoriserRoles('prestataire'), listerMesNotationsRecues);

module.exports = router;
