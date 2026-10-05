const cloudinary = require('../config/cloudinary');

const televerserVersCloudinary = (buffer, dossier) =>
  new Promise((resolve, reject) => {
    const flux = cloudinary.uploader.upload_stream({ folder: dossier }, (erreur, resultat) => {
      if (erreur) reject(erreur);
      else resolve(resultat);
    });
    flux.end(buffer);
  });

// POST /api/upload/image — un seul fichier, champ "image"
const televerserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }
    const resultat = await televerserVersCloudinary(req.file.buffer, 'toolly2');
    return res.status(201).json({ url: resultat.secure_url });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'upload", erreur: error.message });
  }
};

// POST /api/upload/images — plusieurs fichiers, champ "images"
const televerserImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }
    const resultats = await Promise.all(req.files.map((fichier) => televerserVersCloudinary(fichier.buffer, 'toolly2')));
    return res.status(201).json({ urls: resultats.map((r) => r.secure_url) });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'upload", erreur: error.message });
  }
};

module.exports = { televerserImage, televerserImages };
