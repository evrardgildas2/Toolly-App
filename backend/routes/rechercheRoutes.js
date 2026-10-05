const express = require('express'); 
const { rechercheGlobale } = require('../controllers/rechercheController'); 
const router = express.Router(); 
router.get('/', rechercheGlobale); 
module.exports = router;