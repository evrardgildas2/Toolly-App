const multer = require('multer');

// On garde les fichiers en mémoire (pas sur le disque du serveur) : ils sont
// aussitôt renvoyés vers Cloudinary, jamais stockés localement.
const stockage = multer.memoryStorage();

const filtreImages = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont acceptées'), false);
  }
};

const upload = multer({
  storage: stockage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max par image
  fileFilter: filtreImages,
});

module.exports = upload;
