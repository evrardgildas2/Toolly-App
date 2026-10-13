const express = require('express'); 
const { proteger } = require('../middleware/auth'); 
const { listerMesNotifications, marquerCommeLue, toutMarquerCommeLu, } = require('../controllers/notificationController'); 
const router = express.Router(); router.get('/', proteger, listerMesNotifications); 
router.patch('/lire-tout', proteger, toutMarquerCommeLu); 
router.patch('/:id/lue', proteger, marquerCommeLue); 
module.exports = router;