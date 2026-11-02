import { useEffect, useMemo,useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { EtoileNote, IconeCategorie, formaterPrix } from '../components/UtilsAffichage.jsx';
import '../styles/accueil.css';
import '../styles/services.css';
import '../styles/cartes-services.css';
import searchIcon from '../Assets/search.svg';
import filtericon from '../Assets/filter.svg';
import locateicon from '../Assets/location.svg';
import arrowicon from '../Assets/arrow2.svg';

 

const TRANCHES_PRIX = [
  { id: 'moins-5000', label: 'Moins de 5 000 FCFA', test: (p) => p < 5000 },
  { id: '5000-15000', label: '5 000 – 15 000 FCFA', test: (p) => p >= 5000 && p <= 15000 },
  { id: '15000-30000', label: '15 000 – 30 000 FCFA', test: (p) => p > 15000 && p <= 30000 },
  { id: 'plus-30000', label: 'Plus de 30 000 FCFA', test: (p) => p > 30000 },
];

const TAILLE_PAGE = 9;

function CarteServiceComplete({ service }) {
  const [favori, setFavori] = useState(false);

  return (
    <article className="toolly-service-card">
      <div
        className="toolly-service-card__image"
        style={service.photo ? { backgroundImage: `url(${service.photo})` } : undefined}
      >
        {service.categorie?.nom && (
          <span className="toolly-service-card__category">{service.categorie.nom}</span>
        )}

        <button
          type="button"
          className={`toolly-service-card__favorite ${favori ? 'is-active' : ''}`}
          onClick={() => setFavori((value) => !value)}
          aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={favori}
        >
          {favori ? '✓' : '+'}
        </button>
      </div>

      <div className="toolly-service-card__content">
        <div className="toolly-service-card__heading">
          <h3>{service.titre}</h3>
        </div>

        {service.prestataire?.nom && (
          <div className="toolly-service-card__provider">
            <span
              className="toolly-service-card__avatar"
              style={service.prestataire.photo
                ? { backgroundImage: `url(${service.prestataire.photo})` }
                : undefined}
            >
              {!service.prestataire.photo && service.prestataire.nom.charAt(0).toUpperCase()}
            </span>
            <span>{service.prestataire.nom}</span>
          </div>
        )}

        {service.prestataire?.ville && (
          <div className="toolly-service-card__location">
            <img src={locateicon} alt="" />
            <span>{service.prestataire.ville}, Cameroun</span>
          </div>
        )}

        <div className="toolly-service-card__rating">
          <EtoileNote
            note={service.prestataire?.noteMoyenne}
            nombreAvis={service.prestataire?.nombreAvis}
          />
        </div>

        {service.description && (
          <p className="toolly-service-card__description">{service.description}</p>
        )}

        <div className="toolly-service-card__footer">
          <div className="toolly-service-card__price">
            <span>À partir de</span>
            <strong>{formaterPrix(service.prixMin)}</strong>
          </div>

          <Link to={`/services/${service._id}`} className="toolly-service-card__button">
            Voir le service
            <img src={arrowicon} alt="" />
          </Link>
        </div>
      </div>
      </article>
  );
}

export default CarteServiceComplete;