import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormulaireMotDePasse from '../components/FormulaireTemp.jsx';

// À remplacer par ta vraie adresse de support
const EMAIL_SUPPORT = 'contact@toolly.cm';

const LIBELLES_VERIFICATION = {
  verifie: 'Compte vérifié',
  en_attente: "Vérification en cours d'examen",
  non_verifie: 'Compte non vérifié',
};

function Parametres() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [motDePasseOuvert, setMotDePasseOuvert] = useState(false);

  useEffect(() => {
    api
      .get('/auth/moi')
      .then((res) => setProfil(res.data))
      .catch((error) => console.error('Erreur lors du chargement des paramètres', error))
      .finally(() => setChargement(false));
  }, []);

  const seDeconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    navigate('/');
  };

  if (chargement) return <p>Chargement...</p>;
  if (!profil) return <p>Impossible de charger les paramètres.</p>;

  const estPrestataire = profil.role === 'prestataire';

  return (
    <div className="parametres-page">
      <h1 className="section-titre" style={{ marginBottom: 20 }}>
        Paramètres
      </h1>

      <div className="bloc-info">
        <div className="bloc-info-entete">
          <span>Compte</span>
        </div>
        {/* À remplacer par /mon-compte/modifier-profil quand cette page existera */}
        <Link to="/mon-compte" className="ligne-parametre">
          <span>
            Modifier mes informations
            <small>Nom, téléphone, photo...</small>
          </span>
          <span>›</span>
        </Link>
        <button type="button" className="ligne-parametre" onClick={() => setMotDePasseOuvert(true)}>
          <span>Changer le mot de passe</span>
          <span>›</span>
        </button>
      </div>

      {estPrestataire && (
        <div className="bloc-info">
          <div className="bloc-info-entete">
            <span>Vérification du profil</span>
          </div>
          {profil.statutVerification === 'non_verifie' ? (
            <Link to="/mon-compte/verification" className="ligne-parametre">
              <span>
                {LIBELLES_VERIFICATION.non_verifie}
                <small>
                  {profil.motifRejetVerification
                    ? `Dernière demande refusée : ${profil.motifRejetVerification}`
                    : 'Envoie au moins 5 photos pour lancer la vérification'}
                </small>
              </span>
              <span>›</span>
            </Link>
          ) : (
            <div className="ligne-parametre desactivee">
              <span>{LIBELLES_VERIFICATION[profil.statutVerification]}</span>
            </div>
          )}
        </div>
      )}

      <div className="bloc-info">
        <div className="bloc-info-entete">
          <span>Aide et informations légales</span>
        </div>
        <a href={`mailto:${EMAIL_SUPPORT}`} className="ligne-parametre">
          <span>
            Contacter le support
            <small>{EMAIL_SUPPORT}</small>
          </span>
          <span>›</span>
        </a>
        <div className="ligne-parametre desactivee">
          <span>Conditions d'utilisation</span>
          <span className="etiquette-bientot">Bientôt</span>
        </div>
        <div className="ligne-parametre desactivee">
          <span>Politique de confidentialité</span>
          <span className="etiquette-bientot">Bientôt</span>
        </div>
      </div>

      <div className="bloc-info">
        <button type="button" className="ligne-parametre danger" onClick={seDeconnecter}>
          <span>Se déconnecter</span>
        </button>
      </div>

      {motDePasseOuvert && <FormulaireMotDePasse onFermer={() => setMotDePasseOuvert(false)} />}
    </div>
  );
}

export default Parametres;