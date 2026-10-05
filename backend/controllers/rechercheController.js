const Categorie = require('../models/Categorie');
 const Service = require('../models/Service');
 const Prestataire = require('../models/Prestataire'); 
 const Realisation = require('../models/Realisation'); 
 // GET /api/recherche?q=terme 
 const rechercheGlobale = async (req, res) => { 
    try { const terme = (req.query.q || '').trim(); 
          if (terme.length < 2) { return res.status(200).json({ categories: [], services: [], prestataires: [], realisations: [] }); } 
          const regex = new RegExp(terme, 'i'); 
          // recherche insensible à la casse 
          const [categories, services, prestataires, realisations] = await Promise.all([ Categorie.find({ nom: regex, statut: 'approuvee' }).select('nom icone').limit(5), 
            Service.find({ titre: regex, actif: true }).select('titre prixMin photo').populate('categorie', 'nom').limit(5), Prestataire.find({ statutVerification: 'verifie', $or: [{ nom: regex }, { metier: regex }], }).select('nom photo metier noteMoyenne').limit(5), 
            Realisation.find({ titre: regex, visible: true }).select('titre photos').limit(5), ]); 
            return res.status(200).json({ categories, services, prestataires, realisations }); 
        } 
          catch (error) { 
            return res.status(500).json({ message: 'Erreur lors de la recherche', erreur: error.message }); } }; 
            module.exports = { rechercheGlobale }; 