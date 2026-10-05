import { useEffect, useState } from 'react';
import api from '../../services/api';

function AdminVerifications() {
  const [prestataires, setPrestataires] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    try {
      const reponse = await api.get('/prestataires/verification/en-attente');
      setPrestataires(reponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des vérifications', error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const approuver = async (id) => {
    await api.patch(`/prestataires/${id}/verification/approuver`);
    charger();
  };

  const rejeter = async (id) => {
    const motif = window.prompt('Motif du rejet (optionnel) :', 'Photos non conformes à la catégorie');
    await api.patch(`/prestataires/${id}/verification/rejeter`, { motif });
    charger();
  };

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="section-titre" style={{ marginBottom: 20 }}>
        Vérifications en attente ({prestataires.length})
      </h1>

      {prestataires.length === 0 && <p className="etat-vide">Aucune demande de vérification en attente.</p>}

      {prestataires.map((prestataire) => (
        <div className="bloc-info" key={prestataire._id}>
          <div className="bloc-info-entete">
            <span>
              {prestataire.nom} — {prestataire.email}
            </span>
          </div>
          <p style={{ color: 'var(--texte-secondaire)', marginBottom: 10 }}>
            Catégorie(s) : {prestataire.categories?.map((c) => c.nom).join(', ') || '—'} · Demande envoyée le{' '}
            {new Date(prestataire.dateDemandeVerification).toLocaleDateString('fr-FR')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {prestataire.photosVerification?.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 10 }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="bouton bouton-plein" onClick={() => approuver(prestataire._id)}>
              ✅ Approuver
            </button>
            <button className="bouton bouton-contour" onClick={() => rejeter(prestataire._id)}>
              ❌ Rejeter
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminVerifications;
