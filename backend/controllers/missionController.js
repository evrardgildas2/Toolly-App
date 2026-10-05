const Mission = require('../models/Mission');
const Service = require('../models/Service');
const Prestataire = require('../models/Prestataire');
const { creerEtEnvoyerNotification } = require('../utils/notifier');

const POURCENTAGE_COMMISSION = 0.1; // 10% — ajustable plus tard selon la classification

// POST /api/missions
// Réservé au client : demande un service à un prestataire
const demanderMission = async (req, res) => {
  try {
    const { serviceId } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || !service.actif) {
      return res.status(404).json({ message: 'Service introuvable ou inactif' });
    }

    const mission = await Mission.create({
      client: req.utilisateur.id,
      prestataire: service.prestataire,
      service: service._id,
      statut: 'en_attente',
    });

    // Notifie le prestataire qu'une nouvelle demande l'attend
    await creerEtEnvoyerNotification({
      destinataire: service.prestataire,
      type: 'nouvelle_demande_mission',
      message: 'Vous avez reçu une nouvelle demande de mission',
      lien: mission._id,
    });

    return res.status(201).json(mission);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la demande de mission', erreur: error.message });
  }
};

// GET /api/missions/mes-missions
// Pour un client ou un prestataire : ses propres missions
const listerMesMissions = async (req, res) => {
  try {
    const filtre =
      req.utilisateur.role === 'client' ? { client: req.utilisateur.id } : { prestataire: req.utilisateur.id };

    const missions = await Mission.find(filtre)
      .populate('service', 'titre prixMin photo')
      .populate('client', 'nom photo')
      .populate('prestataire', 'nom photo')
      .sort({ createdAt: -1 });

    return res.status(200).json(missions);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération des missions', erreur: error.message });
  }
};

// Petit utilitaire : vérifie que l'utilisateur courant fait bien partie de la mission
const verifierAppartenance = (mission, utilisateur) => {
  const estClient = mission.client.toString() === utilisateur.id;
  const estPrestataire = mission.prestataire.toString() === utilisateur.id;
  return { estClient, estPrestataire, appartient: estClient || estPrestataire };
};

// PATCH /api/missions/:id/accepter
// Réservé au prestataire concerné : fixe les dates et le prix convenu
const accepterMission = async (req, res) => {
  try {
    const { dateDebutPrevue, dateFinPrevue, prixConvenu } = req.body;

    const mission = await Mission.findById(req.params.id).populate('service');
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }
    if (mission.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Cette mission ne vous concerne pas" });
    }
    if (mission.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Cette mission ne peut plus être acceptée' });
    }

    mission.statut = 'acceptee';
    mission.dateDebutPrevue = dateDebutPrevue;
    mission.dateFinPrevue = dateFinPrevue;
    mission.prixConvenu = prixConvenu || mission.service.prixMin;
    await mission.save();

    await creerEtEnvoyerNotification({
      destinataire: mission.client,
      type: 'mission_acceptee',
      message: 'Votre demande de mission a été acceptée',
      lien: mission._id,
    });

    return res.status(200).json(mission);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'acceptation", erreur: error.message });
  }
};

// PATCH /api/missions/:id/refuser
// Réservé au prestataire concerné
const refuserMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }
    if (mission.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Cette mission ne vous concerne pas" });
    }
    if (mission.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Cette mission ne peut plus être refusée' });
    }

    mission.statut = 'refusee';
    await mission.save();

    await creerEtEnvoyerNotification({
      destinataire: mission.client,
      type: 'mission_refusee',
      message: 'Votre demande de mission a été refusée',
      lien: mission._id,
    });

    return res.status(200).json(mission);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du refus', erreur: error.message });
  }
};

// PATCH /api/missions/:id/demarrer
// Réservé au prestataire concerné : passe la mission en cours
const demarrerMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }
    if (mission.prestataire.toString() !== req.utilisateur.id) {
      return res.status(403).json({ message: "Cette mission ne vous concerne pas" });
    }
    if (mission.statut !== 'acceptee') {
      return res.status(400).json({ message: 'La mission doit être acceptée avant de démarrer' });
    }

    mission.statut = 'en_cours';
    mission.dateDebutReelle = new Date();
    await mission.save();

    await creerEtEnvoyerNotification({
      destinataire: mission.client,
      type: 'mission_demarree',
      message: 'Votre mission a démarré',
      lien: mission._id,
    });

    return res.status(200).json(mission);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors du démarrage', erreur: error.message });
  }
};

// PATCH /api/missions/:id/confirmer-fin
// Le client ET le prestataire doivent chacun confirmer pour que la mission passe à "terminee"
const confirmerFinMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }

    const { estClient, estPrestataire, appartient } = verifierAppartenance(mission, req.utilisateur);
    if (!appartient) {
      return res.status(403).json({ message: "Cette mission ne vous concerne pas" });
    }
    if (mission.statut !== 'en_cours') {
      return res.status(400).json({ message: 'La mission doit être en cours pour être confirmée comme terminée' });
    }

    if (estClient) mission.confirmationClient = true;
    if (estPrestataire) mission.confirmationPrestataire = true;

    // La mission ne passe réellement à "terminee" que si les DEUX parties ont confirmé
    if (mission.confirmationClient && mission.confirmationPrestataire) {
      mission.statut = 'terminee';
      mission.dateFinReelle = new Date();
      mission.montantCommission = Math.round((mission.prixConvenu || 0) * POURCENTAGE_COMMISSION);

      // Met à jour le compteur de missions terminées du prestataire (utile
      // pour la classification et le calcul de crédibilité, à venir)
      await Prestataire.findByIdAndUpdate(mission.prestataire, { $inc: { nombreMissionsTerminees: 1 } });

      await creerEtEnvoyerNotification({
        destinataire: mission.client,
        type: 'mission_terminee',
        message: 'La mission est confirmée comme terminée par les deux parties',
        lien: mission._id,
      });
      await creerEtEnvoyerNotification({
        destinataire: mission.prestataire,
        type: 'mission_terminee',
        message: 'La mission est confirmée comme terminée par les deux parties',
        lien: mission._id,
      });
    } else {
      // Une seule des deux parties a confirmé : on informe l'autre qu'une confirmation est attendue
      const destinataireAPrevenir = estClient ? mission.prestataire : mission.client;
      await creerEtEnvoyerNotification({
        destinataire: destinataireAPrevenir,
        type: 'confirmation_attendue',
        message: "L'autre partie a confirmé la fin de la mission — à votre tour de confirmer",
        lien: mission._id,
      });
    }

    await mission.save();

    return res.status(200).json(mission);
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la confirmation', erreur: error.message });
  }
};

// PATCH /api/missions/:id/annuler
// Le client ou le prestataire peut annuler (version simple, sans questionnaire de motifs — voir Phase 2)
const annulerMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission introuvable' });
    }

    const { appartient } = verifierAppartenance(mission, req.utilisateur);
    if (!appartient) {
      return res.status(403).json({ message: "Cette mission ne vous concerne pas" });
    }
    if (['terminee', 'annulee', 'refusee'].includes(mission.statut)) {
      return res.status(400).json({ message: 'Cette mission ne peut plus être annulée' });
    }

    mission.statut = 'annulee';
    await mission.save();

    await Prestataire.findByIdAndUpdate(mission.prestataire, { $inc: { nombreMissionsAnnulees: 1 } });

    const { estClient } = verifierAppartenance(mission, req.utilisateur);
    const destinataireAPrevenir = estClient ? mission.prestataire : mission.client;
    await creerEtEnvoyerNotification({
      destinataire: destinataireAPrevenir,
      type: 'mission_annulee',
      message: 'Une mission a été annulée',
      lien: mission._id,
    });

    return res.status(200).json(mission);
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'annulation", erreur: error.message });
  }
};

module.exports = {
  demanderMission,
  listerMesMissions,
  accepterMission,
  refuserMission,
  demarrerMission,
  confirmerFinMission,
  annulerMission,
};
