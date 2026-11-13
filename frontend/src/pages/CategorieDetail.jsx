import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { EtoileNote, IconeCategorie, formaterPrix } from '../components/UtilsAffichage.jsx';
import '../styles/accueil.css';

function CategorieDetail() {
  const { id } = useParams();
  const [categorie, setCategorie] = useState(null);
  const [services, setServices] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Se relance à chaque changement d'identifiant : la page s'adapte à la catégorie
  useEffect(() => {
    setChargement(true);
    Promise.all([api.get(`/categories/${id}`), api.get(`/services?categorie=${id}`)])
      .then(([resCategorie, resServices]) => {
        setCategorie(resCategorie.data);
        setServices(resServices.data);
      })
      .catch(() => {
        setCategorie(null);
        setServices([]);
      })
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) {
    return <p className="conteneur" style={{ marginTop: 32 }}>Chargement...</p>;
  }

  if (!categorie) {
    return (
      <div className="conteneur" style={{ marginTop: 32 }}>
        <p>Catégorie introuvable.</p>
        <Link to="/categories" className="bouton bouton-contour">← Toutes les catégories</Link>
      </div>
    );
  }

  return (
    <div className="conteneur" style={{ marginTop: 32, marginBottom: 48 }}>
      <Link to="/categories" className="lien-retour">← Toutes les catégories</Link>

      <div className="categorie-entete">
        <div className="categorie-entete-icone">
          <IconeCategorie icone={categorie.icone} index={0} taille={44} />
        </div>
        <div>
          <h1 className="section-titre">{categorie.nom}</h1>
          {categorie.description && <p className="categorie-description">{categorie.description}</p>}
          <span className="categorie-compteur">
            {services.length} service{services.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <h2 className="section-titre" style={{ fontSize: '1.2rem', margin: '28px 0 16px' }}>
        Services dans cette catégorie
      </h2>

      {services.length === 0 ? (
        <p className="etat-vide">Aucun service dans cette catégorie pour le moment.</p>
      ) : (
        <div className="grille-liste">
          {services.map((service) => (
            <div className="carte" key={service._id}>
              <div
                className="carte-image"
                style={{ backgroundImage: service.photo ? `url(${service.photo})` : undefined }}
              />
              <div className="carte-corps">
                <h3>{service.titre}</h3>
                {service.prestataire && (
                  <div className="carte-prestataire-mini">
                    <div
                      className="mini-avatar"
                      style={service.prestataire.photo ? { backgroundImage: `url(${service.prestataire.photo})` } : undefined}
                    >
                      {!service.prestataire.photo && service.prestataire.nom?.charAt(0).toUpperCase()}
                    </div>
                    <span>{service.prestataire.nom}</span>
                  </div>
                )}
                {service.prestataire?.ville && <div className="carte-meta">{service.prestataire.ville}</div>}
                <EtoileNote note={service.prestataire?.noteMoyenne} nombreAvis={service.prestataire?.nombreAvis} />
                <div className="carte-prix">
                  À partir de <strong>{formaterPrix(service.prixMin)}</strong>
                </div>
                <Link to={`/services/${service._id}`} className="bouton bouton-plein carte-bouton">
                  Voir plus
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategorieDetail;