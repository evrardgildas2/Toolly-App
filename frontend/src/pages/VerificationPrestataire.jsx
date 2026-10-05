import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { televerserImages } from '../services/upload';

const NOMBRE_MIN_PHOTOS = 5;

function VerificationPrestataire() {
  const [fichiers, setFichiers] = useState([]);
  const [apercus, setApercus] = useState([]);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const navigate = useNavigate();

  const gererSelection = (e) => {
    const nouveauxFichiers = Array.from(e.target.files);
    setFichiers(nouveauxFichiers);
    setApercus(nouveauxFichiers.map((f) => URL.createObjectURL(f)));
    setErreur('');
  };

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setErreur('');

    if (fichiers.length < NOMBRE_MIN_PHOTOS) {
      setErreur(`Il faut au moins ${NOMBRE_MIN_PHOTOS} photos en concordance avec votre catégorie.`);
      return;
    }

    setEnvoiEnCours(true);
    try {
      const urls = await televerserImages(fichiers);
      await api.post('/prestataires/verification', { photosVerification: urls });
      setSucces(true);
      setTimeout(() => navigate('/mon-compte'), 2000);
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'envoi des photos");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (succes) {
    return (
      <div className="bloc-info">
        <strong>✅ Photos envoyées avec succès !</strong>
        <p>Votre demande est maintenant en attente de validation par un administrateur. Redirection...</p>
      </div>
    );
  }

  return (
    <div className="bloc-info" style={{ maxWidth: 640 }}>
      <div className="bloc-info-entete">
        <span>📸 Vérification de votre profil</span>
      </div>
      <p style={{ color: 'var(--texte-secondaire)', marginBottom: 16 }}>
        Envoyez au moins {NOMBRE_MIN_PHOTOS} photos de votre travail, en concordance avec votre catégorie de
        service. Un administrateur les examinera avant de valider votre statut de prestataire vérifié.
      </p>

      <form onSubmit={gererEnvoi}>
        <input type="file" accept="image/*" multiple onChange={gererSelection} />

        {apercus.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '16px 0' }}>
            {apercus.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Aperçu ${i + 1}`}
                style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10 }}
              />
            ))}
          </div>
        )}

        <p style={{ fontSize: '0.85rem', color: 'var(--texte-secondaire)' }}>
          {fichiers.length} photo{fichiers.length > 1 ? 's' : ''} sélectionnée{fichiers.length > 1 ? 's' : ''}
          {fichiers.length < NOMBRE_MIN_PHOTOS && fichiers.length > 0 && ` (${NOMBRE_MIN_PHOTOS - fichiers.length} de plus requise${NOMBRE_MIN_PHOTOS - fichiers.length > 1 ? 's' : ''})`}
        </p>

        {erreur && <p className="message-erreur">{erreur}</p>}

        <button type="submit" className="bouton bouton-plein" disabled={envoiEnCours} style={{ marginTop: 12 }}>
          {envoiEnCours ? 'Envoi en cours...' : 'Envoyer pour vérification'}
        </button>
      </form>
    </div>
  );
}

export default VerificationPrestataire;
