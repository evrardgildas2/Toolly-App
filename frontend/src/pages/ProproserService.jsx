import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { televerserImage } from '../services/upload';


function ProposerService() { 
 const navigate = useNavigate(); 
 const [categories, setCategories] = useState([]); 
 const [categorieId, setCategorieId] = useState(''); 
 const [titre, setTitre] = useState(''); 
 const [description, setDescription] = useState(''); 
 const [prixMin, setPrixMin] = useState(''); 
 const [fichierPhoto, setFichierPhoto] = useState(null); 
 const [apercuPhoto, setApercuPhoto] = useState(null); 
 const [envoiEnCours, setEnvoiEnCours] = useState(false); 
 const [erreur, setErreur] = useState(''); 

  useEffect(() => { api.get('/auth/moi').then((res) => { const mesCategories = res.data.categories || []; setCategories(mesCategories); 
    if (mesCategories.length === 1) setCategorieId(mesCategories[0]._id); }); }, []); 
  const gererSelectionPhoto = (e) => { const fichier = e.target.files[0]; 
    setFichierPhoto(fichier); 
    setApercuPhoto(fichier ? URL.createObjectURL(fichier) : null); }; 
  const gererEnvoi = async (e) => { e.preventDefault(); setErreur(''); setEnvoiEnCours(true);
   try { let photo = null; if (fichierPhoto) photo = await televerserImage(fichierPhoto); 
   await api.post('/services', { categorie: categorieId, titre, description, prixMin: Number(prixMin), photo }); navigate('/mon-compte'); }
   catch (error) { setErreur(error.response?.data?.message || 'Erreur lors de la création du service'); } 
   finally { setEnvoiEnCours(false); } }; 
   return ( 
   <div className="bloc-info" style={{ maxWidth: 520 }}> 
   <div className="bloc-info-entete">
    <span>+ Proposer un service</span>
    </div> 
    <form onSubmit={gererEnvoi} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}> 
        <label>Catégorie <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)} required> 
            <option value="">Sélectionner</option> 
            {categories.map((c) => <option key={c._id} value={c._id}>{c.nom}</option>)} 
            </select> 
            </label> <label>Nom du service <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : Réparation de fuite d'eau" required /> </label> 
            <label>Description <textarea value={description} onChange={(e) => setDescription(e.target.value)} required /> </label>
             <label>Prix de départ (FCFA) <input type="number" value={prixMin} onChange={(e) => setPrixMin(e.target.value)} min="0" required /> </label> 
             <label>Photo du service <input type="file" accept="image/*" onChange={gererSelectionPhoto} /> </label> 
             {apercuPhoto && <img src={apercuPhoto} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10 }} />}
              {erreur && <p className="message-erreur">{erreur}</p>} <button type="submit" className="bouton bouton-plein" disabled={envoiEnCours}> {envoiEnCours ? 'Création...' : 'Publier le service'} </button> </form> </div> ); } 
              export default ProposerService;