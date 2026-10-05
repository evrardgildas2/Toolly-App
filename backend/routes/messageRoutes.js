const express = require('express');
const { proteger } = require('../middleware/auth');
const { envoyerMessage, obtenirConversation, listerConversations } = require('../controllers/messageController');

const router = express.Router();

router.get('/', proteger, listerConversations);
router.post('/', proteger, envoyerMessage);
router.get('/:autreUtilisateurId', proteger, obtenirConversation);

module.exports = router;