import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api'; 
import { obtenirSocket } from '../services/socket';
import workicon from '../Assets/work.svg';
import accepticon from '../Assets/accept.svg';
import refuseicon from '../Assets/refuse.svg';
import actionicon from '../Assets/action.svg';
import houricon from '../Assets/hour.svg';
import finishicon from '../Assets/finished.svg';
import mailicon from '../Assets/mail.svg';
import cancelicon from '../Assets/cancel.svg';
import staricon from '../Assets/staryellow.svg';

const ICONES = { nouvelle_demande_mission: <img src={workicon} alt="" />, mission_acceptee: <img src={accepticon} alt="" />, mission_refusee: <img src={refuseicon} alt="" />, mission_demarree: <img src={actionicon} alt="" />, confirmation_attendue: <img src={houricon} alt="" />, mission_terminee: <img src={finishicon} alt="" />, mission_annulee: <img src={cancelicon} alt="" />, nouveau_message: <img src={mailicon} alt="" />, nouvelle_notation: <img src={staricon} alt="" />, }; 
// Page ouverte au clic. null = pas de page cible pour l'instant // (les pages « Mes missions » ne sont pas encore construites). 
const cibleNotification = (notification) => { 
    switch (notification.type) { 
        case 'nouveau_message': return '/mon-compte/messages'; 
        case 'nouvelle_notation': return '/mon-compte'; default: return null; } }; 
        const tempsRelatif = (dateIso) => { 
            const secondes = Math.floor((Date.now() - new Date(dateIso).getTime()) / 1000); 
            if (secondes < 60) return "À l'instant"; 
            const minutes = Math.floor(secondes / 60); 
            if (minutes < 60) return `Il y a ${minutes} min`; 
            const heures = Math.floor(minutes / 60); 
            if (heures < 24) return `Il y a ${heures} h`; 
            const jours = Math.floor(heures / 24); 
            if (jours < 7) return `Il y a ${jours} j`;
             return new Date(dateIso).toLocaleDateString('fr-FR'); }; 
             // Prévient la cloche du layout qu'elle doit recompter les non lues 
             const signalerChangement = () => window.dispatchEvent(new Event('notifications-changees')); 
             function Notifications() { 
                const navigate = useNavigate(); 
                const [notifications, setNotifications] = useState([]); 
                const [chargement, setChargement] = useState(true); 
                useEffect(() => { api .get('/notifications') 
                    .then((res) => setNotifications(res.data)) 
                    .catch((error) => console.error('Erreur lors du chargement des notifications', error)) 
                    .finally(() => setChargement(false)); 
                    const socket = obtenirSocket(); 
                    const gererNouvelle = (notification) => setNotifications((prev) => [notification, ...prev]); 
                    socket.on('notification', gererNouvelle); 
                    return () => socket.off('notification', gererNouvelle); }, []); 
                    const ouvrir = async (notification) => { 
                        if (!notification.lu) { 
                            try { 
                                await api.patch(`/notifications/${notification._id}/lue`); 
                                setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, lu: true } : n))); 
                                signalerChangement(); } 
                                catch (error) { 
                                    console.error('Erreur lors du marquage comme lue', error); } } 
                                    const cible = cibleNotification(notification); 
                                    if (cible) navigate(cible); }; 
                                    const toutMarquerLu = async () => { 
                                        try { await api.patch('/notifications/lire-tout'); 
                                            setNotifications((prev) => prev.map((n) => ({ ...n, lu: true }))); signalerChangement(); } 
                                            catch (error) { 
                                                console.error('Erreur lors du marquage des notifications', error); } }; 
                                                const nombreNonLues = notifications.filter((n) => !n.lu).length; 
                                                if (chargement) return <p>Chargement...</p>; 
                                                return ( 
                                                <div> 
                                                    <div className="notifications-entete"> 
                                                        <h1 className="section-titre">Notifications</h1> 
                                                        {nombreNonLues > 0 && ( 
                                                            <button className="bouton bouton-contour" onClick={toutMarquerLu}> Tout marquer comme lu </button> )} </div> 
                                                            {notifications.length === 0 ? ( 
                                                                <p className="etat-vide">Aucune notification pour le moment.</p> ) : ( 
                                                                <div className="liste-notifications"> 
                                                                {notifications.map((notification) => ( <button key={notification._id} className={`notification-ligne ${notification.lu ? '' : 'non-lue'}`} onClick={() => ouvrir(notification)} > 
                                                                    <span className="notification-icone">{ICONES[notification.type] || '🔔'}</span> 
                                                                    <div className="notification-texte"> <p>{notification.message}</p> 
                                                                    <span>{tempsRelatif(notification.createdAt)}</span> </div> 
                                                                    {!notification.lu && <span className="notification-point" />} </button> ))} </div> )} </div> ); } 
                                                                    export default Notifications;