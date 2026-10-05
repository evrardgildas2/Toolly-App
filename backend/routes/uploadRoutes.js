const express = require('express');
const upload = require('../middleware/upload');
const { proteger } = require('../middleware/auth');
const { televerserImage, televerserImages } = require('../controllers/uploadController');

const router = express.Router();

router.post('/image', proteger, upload.single('image'), televerserImage);
router.post('/images', proteger, upload.array('images', 10), televerserImages);

module.exports = router;
