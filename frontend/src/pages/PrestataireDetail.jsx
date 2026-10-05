 import { useEffect, useState } from 'react'; 
 import { useParams, Link } from 'react-router-dom'; 
 import api from '../services/api'; 
 import { EtoileNote, formaterPrix } from '../components/UtilsAffichage.jsx'; 
 import '../styles/accueil.css';
 import locateicon from '../assets/location2.svg';
 
 function PrestataireDetail() { const { id } = useParams(); 
 const [prestataire, setPrestataire] = useState(null); 
 const [services, setServices] = useState([]); 
 const [realisations, setRealisations] = useState([]); 
 const [chargement, setChargement] = useState(true); 
 useEffect(() => { 
    Promise.all([ api.get(`/prestataires/${id}`), api.get('/services'), api.get('/realisations'), ]) .then(([resPrestataire, resServices, resRealisations]) => { setPrestataire(resPrestataire.data); 
        setServices(resServices.data.filter((s) => s.prestataire?._id === id)); 
        setRealisations(resRealisations.data.filter((r) => r.prestataire?._id === id)); }) .catch((err) => console.error(err)) .finally(() => setChargement(false)); }, [id]); 
        const estConnecte = () => !!localStorage.getItem('token'); 
        if (chargement) 
            return <p className="conteneur">Chargement...</p>; if (!prestataire) 
                return <p className="conteneur">Prestataire introuvable.</p>; 
             return ( 
              <div className="conteneur" style={{ marginTop: 32, marginBottom: 48 }}> 
             < div className="profil-entete"> 
                <div className="profil-avatar-grand" style={prestataire.photo ? { backgroundImage: `url(${prestataire.photo})` } : undefined} /> 
                <div> <div className="profil-nom">{prestataire.nom}</div> {prestataire.metier && <p className="profil-metier">{prestataire.metier}</p>} 
                <div className="profil-meta-ligne"> {prestataire.ville && <span><img src={locateicon} alt="Localisation" /> {prestataire.ville}{prestataire.region ? `, ${prestataire.region}` : ''}</span>} 
                <EtoileNote note={prestataire.noteMoyenne} nombreAvis={prestataire.nombreAvis} /> </div> {prestataire.description && 
                <p className="profil-bio">{prestataire.description}</p>} <Link to={estConnecte() ? `/mon-compte/messages/${prestataire._id}` : '/connexion'}
                 className="bouton bouton-plein" style={{ marginTop: 10 }} > ✉️ Message </Link> </div> </div> 
                 <div className="bloc-info" style={{ marginTop: 24 }}> 
                    <div className="bloc-info-entete"><span>Services proposés ({services.length})</span></div> 
                    <div className="grille-cartes"> {services.map((service) => ( 
                         <div className="carte" key={service._id}> 
                         <div className="carte-image" style={{ backgroundImage: service.photo ? `url(${service.photo})` : undefined }} /> 
                         <div className="carte-corps"> <h3>{service.titre}</h3> 
                         <div className="carte-prix">À partir de <strong>{formaterPrix(service.prixMin)}</strong></div> 
                         <Link to={`/services/${service._id}`} className="bouton bouton-plein carte-bouton">Voir plus</Link> </div> </div> ))} 
                         {services.length === 0 && <p className="etat-vide">Aucun service proposé pour le moment.</p>} </div> </div> 
                         <div className="bloc-info"> <div className="bloc-info-entete"><span>Réalisations ({realisations.length})</span></div> <div className="grille-cartes"> {realisations.map((r) => ( <div className="carte" key={r._id}> <div className="carte-image" style={{ backgroundImage: r.photos?.[0] ? `url(${r.photos[0]})` : undefined }} /> <div className="carte-corps"> <h3>{r.titre}</h3> <Link to={`/realisations/${r._id}`} className="bouton bouton-plein carte-bouton">Voir plus</Link> </div> </div> ))} {realisations.length === 0 && <p className="etat-vide">Aucune réalisation publiée.</p>} </div> </div> </div> ); } 
                export default PrestataireDetail;