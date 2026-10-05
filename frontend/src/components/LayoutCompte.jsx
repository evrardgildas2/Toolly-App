import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import '../styles/compte.css';
import searchicon from '../assets/search.svg';
import homeicon from '../assets/home.svg';
import missionicon from '../assets/book2.svg';
import discovericon from '../assets/dicovery.svg';
import usericon from '../assets/user.svg';
import missionsicon from '../assets/checklist.svg';
import favorisicon from '../assets/favorite.svg';
import messagesicon from '../assets/message.svg';
import settingsicon from '../assets/settings.svg';
import notificationsicon from '../assets/notifications.svg';
import adminicon from '../assets/admin.svg';
import serviceicon from '../assets/service2.svg';

function LayoutCompte({ enfants }) {
  const location = useLocation();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');
  const [nombreNotificationsNonLues, setNombreNotificationsNonLues] = useState(0);

  useEffect(() => {
    const chargerNotifications = async () => {
      try {
        const reponse = await api.get('/notifications');
        setNombreNotificationsNonLues(reponse.data.filter((n) => !n.lu).length);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications', error);
      }
    };
    chargerNotifications();
  }, []);

  const estActif = (chemin) => location.pathname === chemin;

  return (
    <div>
      <div className="compte-barre-haut">
        <div className="compte-recherche">
          <img src={searchicon} alt="icone de recherche" />
          <input placeholder="Rechercher un service, un prestataire..." />
        </div>
        <div className="compte-barre-haut-droite">
          <button className="compte-cloche" aria-label="Notifications">
            <img src={notificationsicon} alt="icone de notifications" />
            {nombreNotificationsNonLues > 0 && (
              <span className="compte-badge-cloche">{nombreNotificationsNonLues}</span>
            )}
          </button>
          <div className="compte-utilisateur-mini">
            <div
              className="entete-avatar"
              style={utilisateur?.photo ? { backgroundImage: `url(${utilisateur.photo})` } : undefined}
            >
              {!utilisateur?.photo && utilisateur?.nom?.charAt(0).toUpperCase()}
            </div>
            {utilisateur?.nom}
          </div>
        </div>
      </div>

      <div className="compte-mise-en-page">
        <aside className="compte-barre-laterale">
          <Link to="/" className="compte-nav-lien">
            <img src={homeicon} alt="icone de la page principale"/> Accueil
          </Link>
          <Link to="/services" className="compte-nav-lien">
            <img src={serviceicon} alt="icone de services" /> Services
          </Link>
          <Link to="/realisations" className="compte-nav-lien">
            <img src={missionicon} alt="icone de réalisations" /> Réalisations
          </Link>
          <Link to="/discover" className="compte-nav-lien">
            <img src={discovericon} alt="icone de discovery" /> Discovery
          </Link>

          <div className="compte-separateur" />

          <Link to="/mon-compte" className={`compte-nav-lien ${estActif('/mon-compte') ? 'actif' : ''}`}>
            <img src={usericon} alt="icone de profil" /> Mon profil
          </Link>
          <Link to="/mon-compte/missions" className="compte-nav-lien">
            <img src={missionsicon} alt="icone de missions" /> Mes missions
          </Link>
          <Link to="/mon-compte/favoris" className="compte-nav-lien">
            <img src={favorisicon} alt="icone de favoris" /> Mes favoris
          </Link>
          <Link to="/mon-compte/messages" className="compte-nav-lien">
            <img src={messagesicon} alt="icone de messages" /> Messages
          </Link>
          <Link to="/mon-compte/parametres" className="compte-nav-lien">
            <img src={settingsicon} alt="icone de paramètres" /> Paramètres
          </Link>
          {utilisateur?.role === 'administrateur' && ( 
            <Link to="/admin" className="compte-nav-lien" style={{ color: 'var(--vert-vif)', fontWeight: 700 }}> <img src={adminicon} alt="" />  Administration </Link> )}

          <div className="compte-aide">
            <strong>Besoin d'aide ?</strong>
            <p>Notre équipe est là pour vous !</p>
            <button className="bouton bouton-contour" style={{ width: '100%', justifyContent: 'center' }}>
              Contacter le support
            </button>
          </div>
        </aside>

        <main className="compte-contenu">{enfants}</main>
      </div>
    </div>
  );
}

export default LayoutCompte;
