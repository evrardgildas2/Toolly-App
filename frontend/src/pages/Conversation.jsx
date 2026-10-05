 import { useEffect, useRef, useState } from 'react'; 
 import { useParams } from 'react-router-dom'; 
 import api from '../services/api'; 
 import { obtenirSocket } from '../services/socket'; 
 function Conversation() { 
    const { autreUtilisateurId } = useParams(); 
    const [messages, setMessages] = useState([]); 
    const [contenu, setContenu] = useState(''); 
    const [chargement, setChargement] = useState(true); 
    const finRef = useRef(null); 
    const moi = JSON.parse(localStorage.getItem('utilisateur') || 'null'); 
    useEffect(() => { api.get(`/messages/${autreUtilisateurId}`).then((res) => setMessages(res.data)).finally(() => setChargement(false)); 
    const socket = obtenirSocket(); 
    const gererNouveauMessage = (message) => { 
        if (message.expediteur === autreUtilisateurId || message.destinataire === autreUtilisateurId) { 
            setMessages((prev) => [...prev, message]); } }; 
            socket.on('nouveau_message', gererNouveauMessage); 
            return () => socket.off('nouveau_message', gererNouveauMessage); 
        }, [autreUtilisateurId]); 
        useEffect(() => { 
            finRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]); 
            const envoyer = async (e) => { 
                e.preventDefault(); 
                if (!contenu.trim()) return; 
                const reponse = await api.post('/messages', { destinataireId: autreUtilisateurId, contenu }); 
                setMessages((prev) => [...prev, reponse.data]); 
                setContenu(''); }; 
                if (chargement) return <p>Chargement...</p>; 
                return ( <div className="bloc-info" style={{ display: 'flex', flexDirection: 'column', height: '70vh', maxWidth: 600 }}> 
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}> 
                    {messages.map((m) => ( 
                        <div key={m._id} style={{ alignSelf: m.expediteur === moi?.id ? 'flex-end' : 'flex-start', background: m.expediteur === moi?.id ? 'var(--vert-vif)' : 'var(--fond-alterne)', color: m.expediteur === moi?.id ? '#fff' : 'var(--texte)', padding: '8px 14px', borderRadius: 14, maxWidth: '70%', }} > {m.contenu} </div> ))} 
                        <div ref={finRef} /> </div> 
                        <form onSubmit={envoyer} style={{ display: 'flex', gap: 8 }}> 
                            <input value={contenu} onChange={(e) => setContenu(e.target.value)} placeholder="Écrire un message..." style={{ flex: 1, padding: '10px 14px', borderRadius: 999, border: '1px solid var(--bordure)' }} /> <button type="submit" className="bouton bouton-plein">Envoyer</button> </form> </div> ); } 
                            export default Conversation; 