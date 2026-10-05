 import { useEffect, useState } from 'react';
  import { Link } from 'react-router-dom'; 
  import api from '../services/api'; 
  import { EtoileNote } from '../components/UtilsAffichage.jsx'; 
  import '../styles/accueil.css'; 
  function Prestataires() { 
    const [prestataires, setPrestataires] = useState([]); 
    const [recherche, setRecherche] = useState(''); 
    const [chargement, setChargement] = useState(true); 
    useEffect(() => { 
        api.get('/prestataires?limite=50').then((res) => setPrestataires(res.data)).finally(() => setChargement(false)); }, []); 
        const filtres = prestataires.filter((p) => { 
            const terme = recherche.trim().toLowerCase(); 
            if (!terme) return true; 
            return p.nom.toLowerCase().includes(terme) || p.metier?.toLowerCase().includes(terme); }); 
            return ( 
             <div className="conteneur" style={{ marginTop: 32, marginBottom: 48 }}> 
             <h1 className="section-titre" style={{ marginBottom: 20 }}>Nos prestataires</h1> 
             <input placeholder="Rechercher un prestataire, un métier..." value={recherche} onChange={(e) => setRecherche(e.target.value)} style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid var(--bordure)', width: '100%', maxWidth: 400, marginBottom: 24 }} /> 
             {chargement ? ( 
                 <p>Chargement...</p> ) : ( <div className="grille-cartes"> 
                      {filtres.map((prestataire) => ( <div className="carte-prestataire" key={prestataire._id}> <div className="carte-prestataire-avatar" style={prestataire.photo ? { backgroundImage: `url(${prestataire.photo})` } : undefined} /> 
                      <h3>{prestataire.nom}</h3> 
                      <EtoileNote note={prestataire.noteMoyenne} nombreAvis={prestataire.nombreAvis} /> 
                      {prestataire.ville && <div className="carte-meta">📍 {prestataire.ville}</div>} 
                      <p className="metier">{prestataire.metier || prestataire.categories?.[0]?.nom || 'Prestataire'}</p> 
                      <Link to={`/prestataires/${prestataire._id}`} className="bouton bouton-plein">Voir profil</Link> </div> ))} {filtres.length === 0 && <p>Aucun prestataire trouvé.</p>} </div> )} </div> ); } 
                      export default Prestataires;