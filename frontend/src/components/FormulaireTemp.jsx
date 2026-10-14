 import { useState } from 'react'; 
 import api from '../services/api'; 
 import '../styles/auth.css'; 
 function FormulaireMotDePasse({ onFermer }) { 
    const [ancien, setAncien] = useState(''); const [nouveau, setNouveau] = useState(''); 
    const [confirmation, setConfirmation] = useState(''); 
    const [erreur, setErreur] = useState(''); 
    const [succes, setSucces] = useState(false); 
    const [envoiEnCours, setEnvoiEnCours] = useState(false); 
    const gererEnvoi = async (e) => { e.preventDefault(); setErreur(''); 
        if (nouveau.length < 8) { 
            setErreur('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return; } 
            if (nouveau !== confirmation) { 
                setErreur('La confirmation ne correspond pas au nouveau mot de passe.'); return; } 
                setEnvoiEnCours(true); 
                try { await api.patch('/auth/mot-de-passe', { ancienMotDePasse: ancien, nouveauMotDePasse: nouveau }); 
                setSucces(true); setTimeout(onFermer, 1500); } 
                catch (error) { setErreur(error.response?.data?.message || 'Erreur lors du changement de mot de passe'); } 
                finally { setEnvoiEnCours(false); } }; 
                return ( 
                  <div className="modal-fond" onClick={onFermer}> 
                  <div className="modal-carte" onClick={(e) => e.stopPropagation()}> 
                    <div className="bloc-info-entete"> <span> Changer le mot de passe</span> 
                    <button type="button" onClick={onFermer} aria-label="Fermer">✕</button> </div> 
                    {succes ? ( <p> Mot de passe modifié avec succès.</p> ) : ( 
                        <form className="formulaire-auth" onSubmit={gererEnvoi}> 
                        <label> Ancien mot de passe <input type="password" value={ancien} onChange={(e) => setAncien(e.target.value)} autoComplete="current-password" required /> </label> 
                        <label> Nouveau mot de passe <input type="password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} autoComplete="new-password" required /> </label> 
                        <label> Confirmer le nouveau mot de passe <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" required /> </label> 
                        {erreur && <p className="message-erreur">{erreur}</p>} 
                        <button type="submit" className="bouton bouton-plein" disabled={envoiEnCours}> 
                            {envoiEnCours ? 'Enregistrement...' : 'Enregistrer'} </button> </form> )} </div> </div> ); } 
                            export default FormulaireMotDePasse; 