import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/compte.css';

function LayoutAdmin({ enfants }) {
  const location = useLocation();
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');

  const estActif = (chemin) => location.pathname === chemin;

  const seDeconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    navigate('/');
  };

  return (
    <div>
      <div className="compte-barre-haut">
        <strong style={{ color: 'var(--vert-fonce)' }}>Administration</strong>
        <div className="compte-barre-haut-droite">
          <div className="compte-utilisateur-mini">
            <div className="entete-avatar">{utilisateur?.nom?.charAt(0).toUpperCase()}</div>
            {utilisateur?.nom}
          </div>
          <button className="bouton bouton-contour" onClick={seDeconnecter}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="compte-mise-en-page">
        <aside className="compte-barre-laterale">
          <Link to="/admin" className={`compte-nav-lien ${estActif('/admin') ? 'actif' : ''}`}>
             Tableau de bord
          </Link>
          <Link to="/admin/categories" className={`compte-nav-lien ${estActif('/admin/categories') ? 'actif' : ''}`}>
             Catégories
          </Link>
          <Link
            to="/admin/verifications"
            className={`compte-nav-lien ${estActif('/admin/verifications') ? 'actif' : ''}`}
          >
             Vérifications
          </Link>

          <div className="compte-separateur" />

          <Link to="/" className="compte-nav-lien">
            ← Retour au site
          </Link>
        </aside>

        <main className="compte-contenu">{enfants}</main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
