 import { useEffect, useState } from 'react';
  import { Link } from 'react-router-dom';
   import api from '../services/api'; 
   import '../styles/accueil.css'; 
   function Realisations() { 
    const [realisations, setRealisations] = useState([]); 
    const [chargement, setChargement] = useState(true); 
    useEffect(() => { api.get('/realisations').then((res) => setRealisations(res.data)).finally(() => setChargement(false)); }, []); 
    return ( 
      <div className="conteneur" style={{ marginTop: 32, marginBottom: 48 }}> 
      <h1 className="section-titre" style={{ marginBottom: 20 }}> réalisations</h1> 
      {chargement ? ( 
        <p>Chargement...</p> ) : ( 
        <div className="grille-cartes"> 
        {realisations.map((r) => ( 
            <div className="carte" key={r._id}> 
            <div className="carte-image" style={{ backgroundImage: r.photos?.[0] ? `url(${r.photos[0]})` : undefined }}> 
                {r.categorie?.nom && <span className="carte-badge">{r.categorie.nom}</span>} </div> 
                <div className="carte-corps"> <h3>{r.titre}</h3> 
                {r.ville && <div className="carte-meta">📍 {r.ville}</div>} 
                <Link to={`/realisations/${r._id}`} className="bouton bouton-plein carte-bouton">Voir plus</Link> </div> </div> ))} 
                {realisations.length === 0 && <p>Aucune réalisation publiée pour le moment.</p>} </div> )} </div> ); } 
                export default Realisations; 