import { useEffect, useState } from 'react'; 
import { useParams, Link } from 'react-router-dom'; 
import api from '../services/api'; 
import '../styles/accueil.css'; 
function RealisationDetail() { 
    const { id } = useParams(); 
    const [realisation, setRealisation] = useState(null); 
    const [chargement, setChargement] = useState(true); 
    useEffect(() => { api.get(`/realisations/${id}`).then((res) => setRealisation(res.data)).catch(() => {}).finally(() => setChargement(false)); }, [id]); 
    if (chargement) return <p className="conteneur">Chargement...</p>; 
    if (!realisation) return <p className="conteneur">Réalisation introuvable.</p>; 
    return ( <div className="conteneur" style={{ marginTop: 32, marginBottom: 48, maxWidth: 760 }}> 
    <h1 className="section-titre">{realisation.titre}</h1> <div className="carte-meta" style={{ margin: '8px 0 20px' }}> 
        {realisation.ville && <span>📍 {realisation.ville} · </span>} {new Date(realisation.date).toLocaleDateString('fr-FR')} </div> 
        {realisation.prestataire && ( <Link to={`/prestataires/${realisation.prestataire._id}`} className="carte-prestataire-mini" style={{ marginBottom: 20 }}> 
        <div className="mini-avatar" style={realisation.prestataire.photo ? { backgroundImage: `url(${realisation.prestataire.photo})` } : undefined}> {!realisation.prestataire.photo && realisation.prestataire.nom?.charAt(0).toUpperCase()} </div> 
        <span>{realisation.prestataire.nom}</span> </Link> )} {realisation.photos?.length > 0 && ( <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}> {realisation.photos.map((url, i) => ( <img key={i} src={url} alt={`Photo ${i + 1}`} style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 10 }} /> ))} </div> )} {realisation.etapes?.length > 0 && ( <div className="bloc-info"> <div className="bloc-info-entete"><span>Étapes</span></div> {realisation.etapes.map((etape) => ( <div className="ligne-diplome" key={etape.numero}> <h4>{etape.numero}. {etape.titre}</h4> <p>{etape.description}</p> </div> ))} </div> )} </div> ); } export default RealisationDetail;