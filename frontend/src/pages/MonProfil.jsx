import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { televerserImage } from '../services/upload';
import locationicon from '../assets/location2.svg';
import verifiedicon from '../assets/verified.svg';
import hourglassicon from '../assets/hourglass.svg';
import warningicon from '../assets/warning.svg';
import editicon from '../assets/edit.svg';
import shareicon from '../assets/share.svg';

const LIBELLES_GENRE = { masculin: 'Masculin', feminin: 'Féminin', autre: 'Autre' };

const BADGES_VERIFICATION = {
  verifie: { icone: <img src={verifiedicon} alt="icone de vérification" />, texte: 'Vérifié', couleur: '#1f9d55' },
  en_attente: { icone: <img src={hourglassicon} alt="icone d'attente" />, texte: 'Vérification en cours', couleur: '#f5a623' },
  non_verifie: { icone: <img src={warningicon} alt="icone d'alerte" />, texte: 'Non vérifié', couleur: '#e0453c' },
};

function formaterDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calculerCompletion(profil) {
  if (!profil || profil.role !== 'prestataire') return null;
  const champs = [
    profil.photo,
    profil.metier,
    profil.description,
    profil.ville,
    profil.competences?.length > 0,
    profil.diplomes?.length > 0,
    profil.experiences?.length > 0,
    profil.categories?.length > 0,
  ];
  const remplis = champs.filter(Boolean).length;
  return Math.round((remplis / champs.length) * 100);
}

function MonProfil() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const utilisateurStocke = JSON.parse(localStorage.getItem('utilisateur') || 'null');
  const [ongletActif, setOngletActif] = useState(utilisateurStocke?.role === 'prestataire' ? 'informations' : 'missions'); 
  const [compteursOnglets, setCompteursOnglets] = useState({ realisations: 0, avis: 0, missions: 0 });
  const [televersementEnCours, setTeleversementEnCours] = useState(false);
  const [nombreServices, setNombreServices] = useState(0);
  const [modeEdition, setModeEdition] = useState(false); 
  const [formulaireEdition, setFormulaireEdition] = useState({});
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);

  useEffect(() => {
    const charger = async () => {
      try {
        const resProfil = await api.get('/auth/moi');
        setProfil(resProfil.data);

        if (resProfil.data.role === 'prestataire') {
          const [resRealisations, resAvis, resMissions] = await Promise.all([
            api.get('/realisations/mes-realisations'),
            api.get('/notations/mes-notations-recues'),
            api.get('/missions/mes-missions'),
          ]);
          
          setCompteursOnglets({
            realisations: resRealisations.data.length,
            avis: resAvis.data.length,
            missions: resMissions.data.length,
          });
          setNombreServices(resServices.data.length);
        } else {
          const resMissions = await api.get('/missions/mes-missions');
          setCompteursOnglets((prev) => ({ ...prev, missions: resMissions.data.length }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil', error);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  if (chargement) return <p>Chargement du profil...</p>;
  if (!profil) return <p>Impossible de charger le profil.</p>;

  const seDeconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    navigate('/');
  };

  const gererChangementPhoto = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setTeleversementEnCours(true);
    try {
      const url = await televerserImage(fichier);
      const reponse = await api.patch('/auth/moi', { photo: url });
      setProfil(reponse.data);

      // Met aussi à jour la mini-photo utilisée dans le Header/LayoutCompte
      const utilisateurStocke = JSON.parse(localStorage.getItem('utilisateur') || 'null');
      if (utilisateurStocke) {
        localStorage.setItem('utilisateur', JSON.stringify({ ...utilisateurStocke, photo: url }));
      }
    } catch (error) {
      console.error('Erreur lors du changement de photo', error);
      alert("Erreur lors de l'envoi de la photo. Réessaie.");
    } finally {
      setTeleversementEnCours(false);
    }
  };

  const estPrestataire = profil.role === 'prestataire';
  const completion = calculerCompletion(profil);

  const ouvrirEdition = () => { setFormulaireEdition({ nom: profil.nom, telephone: profil.telephone, genre: profil.genre || '', dateNaissance: profil.dateNaissance ? profil.dateNaissance.slice(0, 10) : '', ville: profil.ville || '', }); setModeEdition(true); }; 
   const enregistrerEdition = async (e) => { e.preventDefault(); setEnregistrementEnCours(true); try { const reponse = await api.patch('/auth/moi', formulaireEdition); setProfil(reponse.data); setModeEdition(false); } catch (error) { alert("Erreur lors de l'enregistrement"); } finally { setEnregistrementEnCours(false); } };

  return (
    <div>
      {/* En-tête du profil */}
      <div className="profil-entete">
        <div
          className="profil-avatar-grand"
          style={profil.photo ? { backgroundImage: `url(${profil.photo})` } : undefined}
        />
        <div>
          <span className="profil-badge-role">
            {profil.role === 'prestataire' ? 'Prestataire' : profil.role === 'client' ? 'Client' : 'Administrateur'}
          </span>
          <div className="profil-nom">
            {profil.nom}
            {estPrestataire && (
              <span
                title={BADGES_VERIFICATION[profil.statutVerification].texte}
                style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 999 }}
              >
                {BADGES_VERIFICATION[profil.statutVerification].icone} {BADGES_VERIFICATION[profil.statutVerification].texte}
              </span>
            )}
          </div>
          {estPrestataire && profil.metier && <p className="profil-metier">{profil.metier}</p>}

          <div className="profil-meta-ligne">
            {profil.ville && <span><img src={locationicon} alt="icone de localisation" /> {profil.ville}{profil.region ? `, ${profil.region}` : ''}</span>}
            {estPrestataire && profil.nombreAvis > 0 && (
              <span>★ {profil.noteMoyenne?.toFixed(1)} ({profil.nombreAvis} avis)</span>
            )}
          </div>

          {estPrestataire && profil.description && <p className="profil-bio">{profil.description}</p>}

          {estPrestataire && profil.competences?.length > 0 && (
            <div className="profil-tags">
              {profil.competences.slice(0, 6).map((competence) => (
                <span key={competence} className="profil-tag">
                  {competence}
                </span>
              ))}
            </div>
          )}

          <div className="profil-actions">
            <button className="bouton bouton-plein" onClick={ouvrirEdition}>
              <img src={editicon} alt="icone de modification" /> Modifier le profil
            </button>
            <button className="bouton bouton-contour"><img src={shareicon} alt="icone de partage" /> Partager le profil</button>
            {!estPrestataire && (
              <Link to="/mon-compte/devenir-prestataire" className="bouton bouton-plein">
                Devenir prestataire
              </Link>
            )}
          </div>
        </div>
      </div>

      {estPrestataire && profil.statutVerification === 'non_verifie' && (
        <div className="carte-visibilite" style={{ marginTop: 16, borderLeft: '4px solid #e0453c' }}>
          <strong> Votre profil n'est pas encore vérifié</strong>
          <p>
            Vos services ne sont pas mis en avant tant que votre compte n'est pas vérifié. Envoyez au moins 5
            photos correspondant à votre catégorie pour lancer la vérification par un administrateur.
          </p>
          <Link to="/mon-compte/verification" className="bouton bouton-plein">
            Envoyer mes photos de vérification
          </Link>
        </div>
      )}

      {estPrestataire && profil.statutVerification === 'en_attente' && (
        <div className="carte-visibilite" style={{ marginTop: 16, borderLeft: '4px solid #f5a623' }}>
          <strong> Vérification en cours d'examen</strong>
          <p>
            Vos photos ont été envoyées le {formaterDate(profil.dateDemandeVerification)} et sont en attente de
            validation par un administrateur. Vous recevrez une notification dès qu'une décision sera prise.
          </p>
        </div>
      )}
        {modeEdition && ( <div className="bloc-info" style={{ marginTop: 16 }}> 
          <div className="bloc-info-entete"><span>✏️ Modifier mes informations</span>
          </div> <form onSubmit={enregistrerEdition} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}> 
            <label>Nom complet <input value={formulaireEdition.nom} onChange={(e) => setFormulaireEdition({ ...formulaireEdition, nom: e.target.value })} /> </label> 
            <label>Téléphone <input value={formulaireEdition.telephone} onChange={(e) => setFormulaireEdition({ ...formulaireEdition, telephone: e.target.value })} /> </label> 
            <label>Genre <select value={formulaireEdition.genre} onChange={(e) => setFormulaireEdition({ ...formulaireEdition, genre: e.target.value })}> 
              <option value="">Ne pas préciser</option> 
              <option value="masculin">Masculin</option> 
              <option value="feminin">Féminin</option> 
              <option value="autre">Autre</option> </select> </label> 
              <label>Date de naissance 
                <input type="date" value={formulaireEdition.dateNaissance} onChange={(e) => setFormulaireEdition({ ...formulaireEdition, dateNaissance: e.target.value })} /> </label> 
                <label>Ville <input value={formulaireEdition.ville} onChange={(e) => setFormulaireEdition({ ...formulaireEdition, ville: e.target.value })} /> </label> 
                <div style={{ display: 'flex', gap: 10 }}> <button type="submit" className="bouton bouton-plein" disabled={enregistrementEnCours}> {enregistrementEnCours ? 'Enregistrement...' : 'Enregistrer'} </button>
                 <button type="button" className="bouton bouton-contour" onClick={() => setModeEdition(false)}>Annuler</button> </div> </form> </div> )} 
      {/* Onglets */}
      {estPrestataire && ( <div className="profil-onglets"> 
        <button className={`profil-onglet ${ongletActif === 'informations' ? 'actif' : ''}`} onClick={() => setOngletActif('informations')}> Informations </button>
         <button className={`profil-onglet ${ongletActif === 'realisations' ? 'actif' : ''}`} onClick={() => setOngletActif('realisations')}> Réalisations {compteursOnglets.realisations} </button> 
         <button className={`profil-onglet ${ongletActif === 'avis' ? 'actif' : ''}`} onClick={() => setOngletActif('avis')}> Avis {compteursOnglets.avis} </button> 
         <button className={`profil-onglet ${ongletActif === 'missions' ? 'actif' : ''}`} onClick={() => setOngletActif('missions')}> Missions {compteursOnglets.missions} </button>
         {estPrestataire && profil.statutVerification === 'verifie' && ( <div style={{ textAlign: 'center', marginTop: 24 }}> 
          <Link to="/mon-compte/proposer-service" className="bouton bouton-plein"> {nombreServices > 0 ? '+ Ajouter un service' : 'Proposer un service'} </Link> </div> )} 
         </div> )}
      <div className="profil-grille">
        <div>
          {ongletActif === 'informations' && (
            <>
              
              {estPrestataire && (
                <>
                  <div className="bloc-info">
                    <div className="bloc-info-entete">
                      <span> À propos de moi</span>
                      <button><img src={editicon} alt="modifier" /></button>
                    </div>
                    {profil.description ? (
                      <p>{profil.description}</p>
                    ) : (
                      <p className="etat-vide">Aucune description ajoutée pour le moment.</p>
                    )}
                  </div>

                  <div className="bloc-info">
                    <div className="bloc-info-entete">
                      <span> Compétences</span>
                      <button><img src={editicon} alt="modifier" /></button>
                    </div>
                    {profil.competences?.length > 0 ? (
                      <div className="tag-liste">
                        {profil.competences.map((competence) => (
                          <span key={competence} className="tag">
                            {competence}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="etat-vide">Aucune compétence renseignée.</p>
                    )}
                  </div>

                  <div className="bloc-info">
                    <div className="bloc-info-entete">
                      <span> Diplômes & Formations</span>
                      <button>+ Ajouter</button>
                    </div>
                    {profil.diplomes?.length > 0 ? (
                      profil.diplomes.map((diplome, i) => (
                        <div className="ligne-diplome" key={i}>
                          <h4>{diplome.intitule}</h4>
                          <p>{diplome.etablissement}</p>
                          <p>{diplome.statut} · {diplome.periode}</p>
                        </div>
                      ))
                    ) : (
                      <p className="etat-vide">Aucun diplôme ajouté.</p>
                    )}
                  </div>

                  <div className="bloc-info">
                    <div className="bloc-info-entete">
                      <span> Expérience professionnelle</span>
                      <button>+ Ajouter</button>
                    </div>
                    {profil.experiences?.length > 0 ? (
                      profil.experiences.map((experience, i) => (
                        <div className="ligne-experience" key={i}>
                          <h4>{experience.poste}</h4>
                          <p>{experience.typeContrat}</p>
                          <p>{experience.periode}</p>
                          <p>{experience.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="etat-vide">Aucune expérience ajoutée.</p>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {ongletActif === 'realisations' && (
            <p className="etat-vide">
              {compteursOnglets.realisations} réalisation{compteursOnglets.realisations > 1 ? 's' : ''} publiée
              {compteursOnglets.realisations > 1 ? 's' : ''}. Gestion détaillée à venir dans "Mes réalisations".
            </p>
          )}

          {ongletActif === 'avis' && (
            <p className="etat-vide">
              {compteursOnglets.avis} avis reçu{compteursOnglets.avis > 1 ? 's' : ''}. Le détail (commentaires internes) reste privé, seule la moyenne est publique.
            </p>
          )}

          {ongletActif === 'missions' && (
            <p className="etat-vide">
              {compteursOnglets.missions} mission{compteursOnglets.missions > 1 ? 's' : ''}. Voir "Mes missions" dans le menu pour le détail.
            </p>
          )}
        </div>

        {/* Colonne latérale */}
        <div>
          {estPrestataire && (
            <div className="grille-stats">
              <div className="carte-stat">
                <strong>{profil.nombreMissionsTerminees}</strong>
                <span>Missions réalisées</span>
              </div>
              <div className="carte-stat">
                <strong>{profil.noteMoyenne?.toFixed(1) || '—'}</strong>
                <span>Note moyenne</span>
              </div>
            </div>
          )}

          <div className="bloc-info liste-actions-rapides">
            <div className="bloc-info-entete">
              <span> Actions rapides</span>
            </div>
            <button onClick={ouvrirEdition}>
               Modifier le profil
            </button>
            <Link to="/mon-compte/parametres">
               Paramètres
            </Link>
            <label style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
              border: '1px solid var(--bordure)', borderRadius: 10, marginBottom: 8,
              background: '#fff', fontSize: '0.88rem', color: 'var(--texte)', cursor: 'pointer',
            }}>
               {televersementEnCours ? 'Envoi en cours...' : 'Changer la photo'}
              <input
                type="file"
                accept="image/*"
                onChange={gererChangementPhoto}
                disabled={televersementEnCours}
                style={{ display: 'none' }}
              />
            </label>
            <button> Changer le mot de passe</button>
            <button onClick={seDeconnecter} style={{ color: '#e0453c' }}>
               Déconnexion
            </button>
          </div>

          {estPrestataire && completion !== null && completion < 100 && (
            <div className="carte-visibilite">
              <strong>Augmentez votre visibilité !</strong>
              <p>Complétez votre profil pour attirer plus de clients et recevoir plus de missions.</p>
              <div className="barre-progression">
                <div className="barre-progression-remplissage" style={{ width: `${completion}%` }} />
              </div>
              <span>{completion}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonProfil;
