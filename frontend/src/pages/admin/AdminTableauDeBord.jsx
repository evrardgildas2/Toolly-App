import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

function AdminTableauDeBord() {
  const [stats, setStats] = useState(null);
  const [categoriesEnAttente, setCategoriesEnAttente] = useState(0);
  const [verificationsEnAttente, setVerificationsEnAttente] = useState(0);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resStats, resCategories, resVerifications] = await Promise.all([
          api.get('/stats/publiques'),
          api.get('/categories/en-attente'),
          api.get('/prestataires/verification/en-attente'),
        ]);
        setStats(resStats.data);
        setCategoriesEnAttente(resCategories.data.length);
        setVerificationsEnAttente(resVerifications.data.length);
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord', error);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="section-titre" style={{ marginBottom: 20 }}>Tableau de bord</h1>

      <div className="grille-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="carte-stat">
          <strong>{stats.nombrePrestataires}</strong>
          <span>Prestataires vérifiés</span>
        </div>
        <div className="carte-stat">
          <strong>{stats.nombreServicesRealises}</strong>
          <span>Missions terminées</span>
        </div>
        <div className="carte-stat">
          <strong>{stats.tauxSatisfaction}%</strong>
          <span>Taux de satisfaction</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/admin/categories" className="bloc-info" style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ fontSize: '1.6rem', color: 'var(--vert-vif)' }}>{categoriesEnAttente}</strong>
          <p>Catégorie{categoriesEnAttente > 1 ? 's' : ''} en attente d'approbation</p>
        </Link>
        <Link to="/admin/verifications" className="bloc-info" style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ fontSize: '1.6rem', color: 'var(--vert-vif)' }}>{verificationsEnAttente}</strong>
          <p>Vérification{verificationsEnAttente > 1 ? 's' : ''} prestataire en attente</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminTableauDeBord;
