import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/auth.css';

function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const navigate = useNavigate();

  const gererConnexion = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoiEnCours(true);
    try {
      const reponse = await api.post('/auth/connexion', { email, motDePasse });
      localStorage.setItem('token', reponse.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(reponse.data.utilisateur));
      navigate('/mon-compte');
    } catch (error) {
      setErreur(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="page-auth">
      <h1>Connexion</h1>
      <p className="page-auth-soustitre">Content de vous revoir sur Toolly.</p>

      <form className="formulaire-auth" onSubmit={gererConnexion}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
        </label>

        {erreur && <p className="message-erreur">{erreur}</p>}

        <button type="submit" className="bouton bouton-plein" disabled={envoiEnCours}>
          {envoiEnCours ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="lien-secondaire">
        Pas encore de compte ? <Link to="/inscription">S'inscrire</Link>
      </p>
    </div>
  );
}

export default Connexion;
