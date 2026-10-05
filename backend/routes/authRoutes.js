const express = require('express');
const { inscription, connexion, obtenirMoi, modifierMoi } = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

const router = express.Router();

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.get('/moi', proteger, obtenirMoi);
router.patch('/moi', proteger, modifierMoi);

module.exports = router;
