import { useEffect, useState } from 'react';
import api from '../../services/api';
import { televerserImage } from '../../services/upload';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [categoriesEnAttente, setCategoriesEnAttente] = useState([]);
  const [chargement, setChargement] = useState(true);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [fichierLogo, setFichierLogo] = useState(null);
  const [apercuLogo, setApercuLogo] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    try {
      const [resApprouvees, resEnAttente] = await Promise.all([
        api.get('/categories'),
        api.get('/categories/en-attente'),
      ]);
      setCategories(resApprouvees.data);
      setCategoriesEnAttente(resEnAttente.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories', error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const gererSelectionLogo = (e) => {
    const fichier = e.target.files[0];
    setFichierLogo(fichier);
    setApercuLogo(fichier ? URL.createObjectURL(fichier) : null);
  };

  const gererCreation = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoiEnCours(true);
    try {
      let icone = null;
      if (fichierLogo) {
        icone = await televerserImage(fichierLogo);
      }
      await api.post('/categories', { nom, description, icone });
      setNom('');
      setDescription('');
      setFichierLogo(null);
      setApercuLogo(null);
      charger();
    } catch (error) {
      setErreur(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const approuver = async (id) => {
    await api.patch(`/categories/${id}/approuver`);
    charger();
  };

  const rejeter = async (id) => {
    await api.patch(`/categories/${id}/rejeter`);
    charger();
  };

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="section-titre" style={{ marginBottom: 20 }}>Catégories</h1>

      {categoriesEnAttente.length > 0 && (
        <div className="bloc-info">
          <div className="bloc-info-entete">
            <span>⏳ Propositions en attente ({categoriesEnAttente.length})</span>
          </div>
          {categoriesEnAttente.map((categorie) => (
            <div key={categorie._id} className="ligne-diplome" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>{categorie.nom}</h4>
                <p>{categorie.description}</p>
                <p>Proposée par : {categorie.proposeePar?.nom} ({categorie.proposeePar?.email})</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="bouton bouton-plein" onClick={() => approuver(categorie._id)}>
                  Approuver
                </button>
                <button className="bouton bouton-contour" onClick={() => rejeter(categorie._id)}>
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bloc-info">
        <div className="bloc-info-entete">
          <span>+ Créer une catégorie</span>
        </div>
        <form onSubmit={gererCreation} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
          <input placeholder="Nom de la catégorie" value={nom} onChange={(e) => setNom(e.target.value)} required />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Logo (facultatif)</label>
            <input type="file" accept="image/*" onChange={gererSelectionLogo} />
            {apercuLogo && (
              <img src={apercuLogo} alt="Aperçu logo" style={{ width: 50, height: 50, borderRadius: 12, marginTop: 8 }} />
            )}
          </div>
          {erreur && <p className="message-erreur">{erreur}</p>}
          <button type="submit" className="bouton bouton-plein" disabled={envoiEnCours}>
            {envoiEnCours ? 'Création...' : 'Créer la catégorie'}
          </button>
        </form>
      </div>

      <div className="bloc-info">
        <div className="bloc-info-entete">
          <span>Catégories actives ({categories.length})</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {categories.map((categorie) => (
            <div key={categorie._id} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {categorie.icone && (
                <img src={categorie.icone} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
              )}
              {categorie.nom}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminCategories;
