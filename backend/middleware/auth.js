const jwt = require('jsonwebtoken');

// Vérifie qu'un token JWT valide est présent, et attache l'utilisateur décodé à req.utilisateur
const proteger = (req, res, next) => {
  const enTete = req.headers.authorization;

  if (!enTete || !enTete.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  const token = enTete.split(' ')[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decode; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Restreint l'accès à certains rôles seulement, ex: autoriserRoles('administrateur')
const autoriserRoles = (...roles) => (req, res, next) => {
  if (!req.utilisateur || !roles.includes(req.utilisateur.role)) {
    return res.status(403).json({ message: 'Accès refusé pour ce rôle' });
  }
  next();
};

module.exports = { proteger, autoriserRoles };
