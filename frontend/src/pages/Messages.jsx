 import { useEffect, useState } from 'react'; 
 import { Link } from 'react-router-dom'; 
 import api from '../services/api'; 
 function Messages() { 
    const [conversations, setConversations] = useState([]); 
    const [chargement, setChargement] = useState(true); 
    useEffect(() => { api.get('/messages').then((res) => setConversations(res.data)).finally(() => setChargement(false)); }, []); 
    if (chargement) return <p>Chargement...</p>; 
    return ( 
    <div> 
        <h1 className="section-titre" style={{ marginBottom: 20 }}>Messages</h1> 
        {conversations.length === 0 && <p className="etat-vide">Aucune conversation pour le moment.</p>} 
        {conversations.map((conv) => ( 
            <Link key={conv.utilisateur._id} to={`/mon-compte/messages/${conv.utilisateur._id}`} 
            className="bloc-info" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }} > 
            <div className="entete-avatar" style={conv.utilisateur.photo ? { backgroundImage: `url(${conv.utilisateur.photo})` } : undefined} > 
                {!conv.utilisateur.photo && conv.utilisateur.nom?.charAt(0).toUpperCase()} </div> 
                <div style={{ flex: 1 }}> <strong>{conv.utilisateur.nom}</strong> <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.85rem', margin: '2px 0 0' }}> {conv.dernierMessage.contenu} </p> </div> 
                {conv.nonLus > 0 && ( <span style={{ background: 'var(--vert-vif)', color: '#fff', borderRadius: 999, padding: '2px 9px', fontSize: '0.75rem', fontWeight: 700 }}> 
                    {conv.nonLus} </span> )} </Link> ))} </div> ); 
                    } 
                    export default Messages;