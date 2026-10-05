import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { REGIONS_CAMEROUN } from '../constantes/regionsCameroun';
import '../styles/auth.css';

function Inscription() {
  const [estPrestataire, setEstPrestataire] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formulaire, setFormulaire] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    // Champs prestataire
    metier: '',
    categorieId: '',
    region: '',
    ville: '',
    quartier: '',
    description: '',
  });
  const [erreur, setErreur] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (estPrestataire && categories.length === 0) {
      api
        .get('/categories')
        .then((res) => setCategories(res.data))
        .catch((err) => console.error('Erreur lors du chargement des catégories', err));
    }
  }, [estPrestataire, categories.length]);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererInscription = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoiEnCours(true);

    const donnees = {
      role: estPrestataire ? 'prestataire' : 'client',
      nom: formulaire.nom,
      email: formulaire.email,
      motDePasse: formulaire.motDePasse,
      telephone: formulaire.telephone,
    };

    if (estPrestataire) {
      donnees.metier = formulaire.metier;
      donnees.region = formulaire.region;
      donnees.ville = formulaire.ville;
      donnees.quartier = formulaire.quartier;
      donnees.description = formulaire.description;
      if (formulaire.categorieId) {
        donnees.categories = [formulaire.categorieId];
      }
    }

    try {
      const reponse = await api.post('/auth/inscription', donnees);
      localStorage.setItem('token', reponse.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(reponse.data.utilisateur));
      navigate('/mon-compte');
    } catch (error) {
      setErreur(error.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="page-auth">
      <h1>Créer un compte</h1>
      <p className="page-auth-soustitre">Rejoignez Toolly pour trouver ou proposer des services au Cameroun.</p>

      <form className="formulaire-auth" onSubmit={gererInscription}>
        <label>
          Nom complet
          <input name="nom" value={formulaire.nom} onChange={gererChangement} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={formulaire.email} onChange={gererChangement} required />
        </label>
        <label>
          Mot de passe
          <input
            name="motDePasse"
            type="password"
            value={formulaire.motDePasse}
            onChange={gererChangement}
            required
          />
        </label>
        <label>
          Téléphone
          <input name="telephone" value={formulaire.telephone} onChange={gererChangement} required />
        </label>

        <div className="bascule-prestataire" onClick={() => setEstPrestataire(!estPrestataire)}>
          <input type="checkbox" checked={estPrestataire} onChange={() => setEstPrestataire(!estPrestataire)} />
          S'inscrire en tant que prestataire
        </div>

        {estPrestataire && (
          <div className="bloc-champs-prestataire">
            <label>
              Métier / spécialité
              <input
                name="metier"
                placeholder="Ex : Plombier, Coiffeuse, Développeur Web..."
                value={formulaire.metier}
                onChange={gererChangement}
                required={estPrestataire}
              />
            </label>

            <label>
              Catégorie de service
              <select name="categorieId" value={formulaire.categorieId} onChange={gererChangement} required={estPrestataire}>
                <option value="">Sélectionner une catégorie</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </label>

            <div className="ligne-champs">
              <label>
                Région
                <select name="region" value={formulaire.region} onChange={gererChangement} required={estPrestataire}>
                  <option value="">Sélectionner</option>
                  {REGIONS_CAMEROUN.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ville
                <input name="ville" value={formulaire.ville} onChange={gererChangement} required={estPrestataire} />
              </label>
            </div>

            <label>
              Quartier (facultatif)
              <input name="quartier" value={formulaire.quartier} onChange={gererChangement} />
            </label>

            <label>
              Présentez-vous en quelques mots (facultatif)
              <textarea name="description" value={formulaire.description} onChange={gererChangement} />
            </label>

            <p style={{ fontSize: '0.82rem', color: 'var(--texte-secondaire)' }}>
              Après inscription, votre compte sera <strong>non vérifié</strong>. Vous pourrez envoyer vos 5 photos
              minimum depuis votre profil pour qu'un administrateur valide votre statut de prestataire.
            </p>
          </div>
        )}

        {erreur && <p className="message-erreur">{erreur}</p>}

        <button type="submit" className="bouton bouton-plein" disabled={envoiEnCours}>
          {envoiEnCours ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>

      <p className="lien-secondaire">
        Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
      </p>
    </div>
  );
}

export default Inscription;
