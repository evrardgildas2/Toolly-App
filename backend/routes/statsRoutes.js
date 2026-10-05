const express = require('express');
const { obtenirStatsPubliques } = require('../controllers/statsController');

const router = express.Router();

router.get('/publiques', obtenirStatsPubliques);

module.exports = router;
