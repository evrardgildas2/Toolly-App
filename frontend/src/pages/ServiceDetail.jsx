 import { useEffect, useState } from 'react'; 
 import { useParams, useNavigate, Link } from 'react-router-dom'; 
 import api from '../services/api.js'; 
 import { EtoileNote, formaterPrix } 
 from '../components/UtilsAffichage.jsx'; 
 import '../styles/accueil.css'; 
 function ServiceDetail() { 
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const [service, setService] = useState(null); 
    const [chargement, setChargement] = useState(true); 
    const [envoiEnCours, setEnvoiEnCours] = useState(false); 
    const [message, setMessage] = useState(''); 
    const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null'); 
    useEffect(() => { api.get(`/services/${id}`).then((res) => setService(res.data)).catch(() => {}).finally(() => setChargement(false)); }, [id]); 
    const demanderService = async () => { 
        if (!utilisateur) { navigate('/connexion'); return; 

        } 
        setEnvoiEnCours(true); 
        setMessage(''); 
        try { await api.post('/missions', { serviceId: id }); 
        setMessage('Demande envoyée avec succès ! Le prestataire va être notifié.'); } catch (error) { setMessage(error.response?.data?.message || 'Erreur lors de la demande'); } finally { setEnvoiEnCours(false); } }; 
        if (chargement) return <p className="conteneur">Chargement...</p>; 
        if (!service) return <p className="conteneur">Service introuvable.</p>; return ( <div className="conteneur" style={{ marginTop: 32, marginBottom: 48, maxWidth: 760 }}> <div className="carte-image" style={{ height: 300, borderRadius: 16, backgroundImage: service.photo ? `url(${service.photo})` : undefined, marginBottom: 20 }}> {service.categorie?.nom && <span className="carte-badge">{service.categorie.nom}</span>} </div> <h1 className="section-titre">{service.titre}</h1> <div className="carte-prix" style={{ fontSize: '1.1rem', margin: '10px 0' }}> À partir de <strong>{formaterPrix(service.prixMin)}</strong> </div> <p style={{ color: 'var(--texte-secondaire)', marginBottom: 24 }}>{service.description}</p> {service.prestataire && ( <div className="bloc-info"> <div className="bloc-info-entete"><span>Proposé par</span></div> <Link to={`/prestataires/${service.prestataire._id}`} className="carte-prestataire-mini" style={{ marginBottom: 10 }}> <div className="mini-avatar" style={service.prestataire.photo ? { backgroundImage: `url(${service.prestataire.photo})` } : undefined}> 
        {!service.prestataire.photo && service.prestataire.nom?.charAt(0).toUpperCase()} </div> 
        <span>{service.prestataire.nom}</span> </Link> 
        <EtoileNote note={service.prestataire.noteMoyenne} nombreAvis={service.prestataire.nombreAvis} /> 
        {service.prestataire.ville && <div className="carte-meta">📍 {service.prestataire.ville}</div>} </div> )} 
        {(!utilisateur || utilisateur.role === 'client') && ( <button className="bouton bouton-plein" onClick={demanderService} disabled={envoiEnCours} style={{ marginTop: 10 }}> {envoiEnCours ? 'Envoi...' : 'Demander ce service'} </button> )} {message && <p style={{ marginTop: 12 }}>{message}</p>} </div> ); } 
        export default ServiceDetail;