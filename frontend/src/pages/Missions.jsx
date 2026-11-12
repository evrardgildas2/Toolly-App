import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { obtenirSocket } from '../services/socket';
import { formaterPrix } from '../components/UtilsAffichage.jsx';
import '../styles/auth.css';

const LIBELLES_STATUT = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  refusee: 'Refusée',
  annulee: 'Annulée',
};

const ETAPES = ['Demande', 'Acceptée', 'En cours', 'Terminée'];
const INDEX_ETAPE = { en_attente: 0, acceptee: 1, en_cours: 2, terminee: 3 };

const FILTRES = [
  { id: 'toutes', libelle: 'Toutes', statuts: null },
  { id: 'attente', libelle: 'En attente', statuts: ['en_attente'] },
  { id: 'cours', libelle: 'En cours', statuts: ['acceptee', 'en_cours'] },
  { id: 'terminees', libelle: 'Terminées', statuts: ['terminee'] },
  { id: 'annulees', libelle: 'Annulées', statuts: ['annulee', 'refusee'] },
];

const formaterDateHeure = (date) =>
  date ? new Date(date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function CarteMission({ mission, role, onChangement }) {
  const estPrestataire = role === 'prestataire';
  const autre = estPrestataire ? mission.client : mission.prestataire;
  const statut = mission.statut;

  const [formulaire, setFormulaire] = useState(null); // 'accepter', 'noter' ou null
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [prix, setPrix] = useState(mission.service?.prixMin ?? '');

  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');

  const monConfirmation = estPrestataire ? mission.confirmationPrestataire : mission.confirmationClient;
  const autreConfirmation = estPrestataire ? mission.confirmationClient : mission.confirmationPrestataire;
  const etapeActuelle = INDEX_ETAPE[statut];
  const prixAffiche = mission.prixConvenu ?? mission.service?.prixMin;

  const executer = async (requete) => {
    setErreur('');
    setEnCours(true);
    try {
      await requete();
      setFormulaire(null);
      await onChangement();
    } catch (error) {
      setErreur(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setEnCours(false);
    }
  };

  const action = (chemin, confirmation) => {
    if (confirmation && !window.confirm(confirmation)) return;
    executer(() => api.patch(`/missions/${mission._id}/${chemin}`));
  };

  const accepter = (e) => {
    e.preventDefault();
    if (new Date(fin) <= new Date(debut)) {
      setErreur('La date de fin doit être après la date de début.');
      return;
    }
    executer(() =>
      api.patch(`/missions/${mission._id}/accepter`, {
        dateDebutPrevue: new Date(debut).toISOString(),
        dateFinPrevue: new Date(fin).toISOString(),
        prixConvenu: Number(prix),
      })
    );
  };

  const noter = (e) => {
    e.preventDefault();
    if (note < 1) {
      setErreur('Choisis une note de 1 à 5 étoiles.');
      return;
    }
    executer(() => api.post('/notations', { missionId: mission._id, note, commentaire }));
  };

  return (
    <div className="mission-carte">
      <div className="mission-entete">
        <div
          className="mission-miniature"
          style={mission.service?.photo ? { backgroundImage: `url(${mission.service.photo})` } : undefined}
        />
        <div className="mission-infos">
          <h3>{mission.service?.titre || 'Service supprimé'}</h3>
          {autre && (
            <div className="mission-meta">
              {estPrestataire ? 'Client' : 'Prestataire'} : <strong>{autre.nom}</strong>
            </div>
          )}
          <div className="mission-meta">
            {mission.prixConvenu ? 'Prix convenu' : 'À partir de'} : <strong>{formaterPrix(prixAffiche)}</strong>
          </div>
          {mission.dateDebutPrevue && (
            <div className="mission-meta">
              Du {formaterDateHeure(mission.dateDebutPrevue)} au {formaterDateHeure(mission.dateFinPrevue)}
            </div>
          )}
        </div>
        <span className={`badge-statut ${statut}`}>{LIBELLES_STATUT[statut]}</span>
      </div>

      {etapeActuelle !== undefined && (
        <div className="mission-progression">
          {ETAPES.map((etape, i) => (
            <div key={etape} className={`etape-mission ${i <= etapeActuelle ? 'faite' : ''}`}>
              {etape}
            </div>
          ))}
        </div>
      )}

      {statut === 'en_cours' && monConfirmation && !autreConfirmation && (
        <p className="mission-meta">
          Tu as confirmé la fin de la mission. En attente de la confirmation de {autre?.nom}.
        </p>
      )}
      {statut === 'en_cours' && !monConfirmation && autreConfirmation && (
        <p className="mission-meta">{autre?.nom} a confirmé la fin de la mission. À ton tour de confirmer.</p>
      )}
      {statut === 'terminee' && estPrestataire && mission.montantCommission != null && (
        <p className="mission-meta">
          Commission de la plateforme : <strong>{formaterPrix(mission.montantCommission)}</strong>
        </p>
      )}

      <div className="mission-actions">
        {estPrestataire && statut === 'en_attente' && (
          <>
            <button className="bouton bouton-plein" onClick={() => setFormulaire('accepter')} disabled={enCours}>
              Accepter
            </button>
            <button
              className="bouton bouton-danger"
              onClick={() => action('refuser', 'Refuser cette demande ?')}
              disabled={enCours}
            >
              Refuser
            </button>
          </>
        )}

        {estPrestataire && statut === 'acceptee' && (
          <button className="bouton bouton-plein" onClick={() => action('demarrer')} disabled={enCours}>
            Démarrer la mission
          </button>
        )}

        {statut === 'en_cours' && !monConfirmation && (
          <button
            className="bouton bouton-plein"
            onClick={() => action('confirmer-fin', 'Confirmer que la mission est terminée ?')}
            disabled={enCours}
          >
            Confirmer la fin
          </button>
        )}

        {!estPrestataire && statut === 'terminee' && !mission.dejaNotee && (
          <button className="bouton bouton-plein" onClick={() => setFormulaire('noter')} disabled={enCours}>
            Noter le prestataire
          </button>
        )}
        {!estPrestataire && statut === 'terminee' && mission.dejaNotee && (
          <span className="mission-meta">✓ Tu as déjà noté cette mission</span>
        )}

        {['en_attente', 'acceptee', 'en_cours'].includes(statut) && !(estPrestataire && statut === 'en_attente') && (
          <button
            className="bouton bouton-danger"
            onClick={() => action('annuler', 'Annuler cette mission ?')}
            disabled={enCours}
          >
            {statut === 'en_attente' ? 'Annuler la demande' : 'Annuler la mission'}
          </button>
        )}

        {autre && (
          <Link to={`/mon-compte/messages/${autre._id}`} className="bouton bouton-contour">
             Message
          </Link>
        )}
      </div>

      {formulaire === 'accepter' && (
        <form className="mission-formulaire" onSubmit={accepter}>
          <label>
            Début prévu
            <input type="datetime-local" value={debut} onChange={(e) => setDebut(e.target.value)} required />
          </label>
          <label>
            Fin prévue
            <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required />
          </label>
          <label>
            Prix convenu (FCFA)
            <input type="number" min="0" value={prix} onChange={(e) => setPrix(e.target.value)} required />
          </label>
          <div className="mission-actions">
            <button type="submit" className="bouton bouton-plein" disabled={enCours}>
              Confirmer l'acceptation
            </button>
            <button type="button" className="bouton bouton-contour" onClick={() => setFormulaire(null)}>
              Fermer
            </button>
          </div>
        </form>
      )}

      {formulaire === 'noter' && (
        <form className="mission-formulaire" onSubmit={noter}>
          <div className="etoiles" role="radiogroup" aria-label="Note">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={n <= note ? 'active' : ''}
                onClick={() => setNote(n)}
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <label>
            Commentaire (facultatif, jamais affiché publiquement)
            <textarea rows="3" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
          </label>
          <div className="mission-actions">
            <button type="submit" className="bouton bouton-plein" disabled={enCours}>
              Envoyer ma note
            </button>
            <button type="button" className="bouton bouton-contour" onClick={() => setFormulaire(null)}>
              Fermer
            </button>
          </div>
        </form>
      )}

      {erreur && <p className="message-erreur">{erreur}</p>}
    </div>
  );
}

function Missions() {
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || 'null');
  const role = utilisateur?.role;

  const [missions, setMissions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [filtre, setFiltre] = useState('toutes');

  const charger = async () => {
    try {
      const reponse = await api.get('/missions/mes-missions');
      setMissions(reponse.data);
      setErreur('');
    } catch (error) {
      setErreur(error.response?.data?.message || 'Impossible de charger les missions');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (role === 'administrateur') {
      setChargement(false);
      return undefined;
    }
    charger();

    // Rafraîchit la liste dès qu'une notification arrive (acceptation, confirmation...)
    const socket = obtenirSocket();
    socket.on('notification', charger);
    return () => socket.off('notification', charger);
  }, []);

  if (role === 'administrateur') {
    return <p className="etat-vide">Les administrateurs n'ont pas de missions.</p>;
  }
  if (chargement) return <p>Chargement...</p>;

  const filtreActif = FILTRES.find((f) => f.id === filtre);
  const compter = (f) => (f.statuts ? missions.filter((m) => f.statuts.includes(m.statut)).length : missions.length);
  const missionsFiltrees = filtreActif.statuts
    ? missions.filter((m) => filtreActif.statuts.includes(m.statut))
    : missions;

  return (
    <div className="missions-page">
      <h1 className="section-titre" style={{ marginBottom: 20 }}>
        Mes missions
      </h1>

      {erreur && <p className="message-erreur">{erreur}</p>}

      <div className="filtres-missions">
        {FILTRES.map((f) => (
          <button
            key={f.id}
            className={`filtre-puce ${filtre === f.id ? 'actif' : ''}`}
            onClick={() => setFiltre(f.id)}
          >
            {f.libelle} ({compter(f)})
          </button>
        ))}
      </div>

      {missionsFiltrees.length === 0 ? (
        <p className="etat-vide">
          {role === 'client' && missions.length === 0 ? (
            <>
              Tu n'as encore demandé aucun service. <Link to="/services">Parcourir les services</Link>
            </>
          ) : (
            'Aucune mission dans cette catégorie.'
          )}
        </p>
      ) : (
        missionsFiltrees.map((mission) => (
          <CarteMission key={mission._id} mission={mission} role={role} onChangement={charger} />
        ))
      )}
    </div>
  );
}

export default Missions;