import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import searchIcon from '../assets/search.svg';
import homeicon from '../Assets/home.svg';
import serviceicon from '../Assets/service2.svg';
import missionicon from '../Assets/book2.svg';
import discovericon from '../Assets/dicovery.svg';


function Header() {
  const location = useLocation();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');
  const navigate = useNavigate();
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const [defile, setDefile] = useState(false);
  const [suggestions, setSuggestions] = useState(null); 
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  useEffect(() => { const gererScroll = () => setDefile(window.scrollY > 20);
    window.addEventListener('scroll', gererScroll); return () => window.removeEventListener('scroll', gererScroll); }, []);  
  const [termeRecherche, setTermeRecherche] = useState(''); 
  const estActif = (chemin) => location.pathname === chemin;

  useEffect(() => { 
    if (!termeRecherche.trim() || termeRecherche.trim().length < 2) { 
      setSuggestions(null); return; 
    } 
    setRechercheEnCours(true); 
    const delai = setTimeout(() => { 
      api .get(`/recherche?q=${encodeURIComponent(termeRecherche.trim())}`) 
      .then((res) => setSuggestions(res.data)) 
      .catch((err) => console.error('Erreur recherche', err)) 
      .finally(() => setRechercheEnCours(false)); }, 300); 
      return () => clearTimeout(delai); }, [termeRecherche]);

  

  const lancerRecherche = (e) => {
     e.preventDefault(); 
     if (termeRecherche.trim()) { 
      navigate(`/services?recherche=${encodeURIComponent(termeRecherche.trim())}`); 
      setRechercheOuverte(false); } };

  return (
    <div className={`entete-bande ${defile ? 'defile' : ''}`}>
    <header className="entete conteneur">
      <Link to="/" className="entete-logo">
        Toolly
      </Link>

         <nav className={`entete-nav ${rechercheOuverte ? 'compact' : ''}`}>
           <Link to="/" className={estActif('/') ? 'actif' : ''}> 
           <span className="nav-icone"><img src={homeicon} alt="" /></span> 
           <span className="nav-texte">Accueil</span>
            </Link> 
            <Link to="/services" className={estActif('/services') ? 'actif' : ''}>
             <span className="nav-icone"><img src={serviceicon} alt="" /></span> 
             <span className="nav-texte">Services</span>
              </Link> 
              <Link to="/realisations" className={estActif('/realisations') ? 'actif' : ''}>
               <span className="nav-icone"><img src={missionicon} alt="" /></span> 
               <span className="nav-texte">Réalisations</span> 
               </Link> 
               <Link to="/discover" className={estActif('/discover') ? 'actif' : ''}> 
               <span className="nav-icone"><img src={discovericon} alt="" /></span> 
               <span className="nav-texte">Discovery</span> 
               </Link> 
               </nav> 

      <div className="entete-actions">
        <div style={{ position: 'relative' }}> 
          <form className="recherche-groupe" onSubmit={lancerRecherche}> 
            <input type="text" 
             className={`recherche-input ${rechercheOuverte ? 'ouverte' : ''}`} placeholder="Services, prestataires, catégories..." value={termeRecherche} 
             onChange={(e) => setTermeRecherche(e.target.value)} 
             onBlur={() => setTimeout(() => { if (!termeRecherche) 
             setRechercheOuverte(false); 
             setSuggestions(null); }, 150)} /> 
             <button type="button" className="entete-recherche" aria-label="Rechercher" 
               onClick={() => setRechercheOuverte(!rechercheOuverte)} > <img src={searchIcon} alt="" /> </button> 
               </form> 
               {rechercheOuverte && suggestions && ( 
                 <div className="suggestions-recherche"> 
                 {suggestions.categories.length === 0 && suggestions.services.length === 0 && suggestions.prestataires.length === 0 && suggestions.realisations.length === 0 ? 
                   ( <p className="suggestions-vide">Aucun résultat pour « {termeRecherche} »</p> ) : ( <> {suggestions.categories.length > 0 && 
                     ( <div className="suggestions-groupe"> 
                       <span className="suggestions-titre-groupe">Catégories</span> 
                        {suggestions.categories.map((c) => ( <Link key={c._id} to={`/services?categorie=${c._id}`} className="suggestion-ligne" onClick={() => setRechercheOuverte(false)}>  {c.nom} </Link> ))} </div> )} {suggestions.services.length > 0 && ( <div className="suggestions-groupe"> <span className="suggestions-titre-groupe">Services</span> {suggestions.services.map((s) => ( <Link key={s._id} to={`/services/${s._id}`} className="suggestion-ligne" onClick={() => setRechercheOuverte(false)}>  {s.titre} </Link> ))} </div> )} {suggestions.prestataires.length > 0 && ( <div className="suggestions-groupe"> <span className="suggestions-titre-groupe">Prestataires</span> {suggestions.prestataires.map((p) => ( <Link key={p._id} to={`/prestataires/${p._id}`} className="suggestion-ligne" onClick={() => setRechercheOuverte(false)}>  {p.nom} {p.metier && `— ${p.metier}`} </Link> ))} </div> )} {suggestions.realisations.length > 0 && ( <div className="suggestions-groupe"> <span className="suggestions-titre-groupe">Réalisations</span> {suggestions.realisations.map((r) => ( <Link key={r._id} to={`/realisations/${r._id}`} className="suggestion-ligne" onClick={() => setRechercheOuverte(false)}> ⭐ {r.titre} </Link> ))} </div> )} </> )} </div> )} </div>

        {utilisateur ? (
          <Link
            to="/mon-compte"
            className="entete-avatar"
            style={utilisateur.photo ? { backgroundImage: `url(${utilisateur.photo})` } : undefined}
            aria-label="Mon profil"
            title={utilisateur.nom}
          >
            {!utilisateur.photo && utilisateur.nom?.charAt(0).toUpperCase()}
          </Link>
        ) : (
          <>
            <Link to="/connexion" className="bouton bouton-contour">
              Se connecter
            </Link>
            <Link to="/inscription" className="bouton bouton-plein">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </header>
    </div>
  );
}

export default Header;
