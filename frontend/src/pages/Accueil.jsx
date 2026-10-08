import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { EtoileNote, IconeCategorie, formaterPrix } from '../components/UtilsAffichage.jsx';
import '../styles/accueil.css';
import locateicon from '../Assets/location.svg'
import arrowicon from '../Assets/arrow2.svg'
import arrowicon2 from '../Assets/arrow3.svg'
import hero1 from '../Assets/hero/hero7.jpg'; 
import hero2 from '../Assets/hero/hero2.jpg'; 
import hero3 from '../Assets/hero/hero3.jpg'; 
import hero4 from '../Assets/hero/hero6.jpg'; 
import hero5 from '../Assets/hero/hero5.jpg'; 
 
 const IMAGES_HERO = [hero1, hero2, hero3, hero4, hero5];

function CarteCategorie({ categorie, index, nombreServices }) {
  return (
    <div className="carte-categorie">
      <div className="carte-categorie-icone">
        <IconeCategorie icone={categorie.icone} index={index} />
      </div>
      <h3>{categorie.nom}</h3>
      <p>{nombreServices} service{nombreServices > 1 ? 's' : ''}</p>
    </div>
  );
}

function CarteService({ service }) {
  return (
    <div className="carte">
      <div className="carte-image" style={{ backgroundImage: service.photo ? `url(${service.photo})` : undefined }}>
        {service.categorie?.nom && <span className="carte-badge">{service.categorie.nom}</span>}
      </div>
      <div className="carte-corps">
        <h3>{service.titre}</h3>
        <div className="carte-prestataire-mini"> 
          <div className="mini-avatar" style={service.prestataire?.photo ? { backgroundImage: `url(${service.prestataire.photo})` } : undefined} > 
            {!service.prestataire?.photo && service.prestataire?.nom?.charAt(0).toUpperCase()} </div> <span>{service.prestataire?.nom}</span> </div>
        {service.prestataire?.ville && <div className="carte-meta"><img src={locateicon} alt="" /> {service.prestataire.ville}</div>}
        <EtoileNote note={service.prestataire?.noteMoyenne} nombreAvis={service.prestataire?.nombreAvis} />
        {service.prestataire?.nombreMissionsTerminees > 0 && (
          <div className="carte-meta">✔️ {service.prestataire.nombreMissionsTerminees} mission
            {service.prestataire.nombreMissionsTerminees > 1 ? 's' : ''} terminée
            {service.prestataire.nombreMissionsTerminees > 1 ? 's' : ''}</div>
        )}
        <div className="carte-prix"> À partir de <strong>{formaterPrix(service.prixMin)}</strong> </div> 
        <Link to={`/services/${service._id}`} className="bouton bouton-plein carte-bouton">
          Voir plus <img src={arrowicon} alt="" />
        </Link>
      </div>
    </div>
  );
}

function CartePrestataire({ prestataire }) {
  const metier = prestataire.categories?.[0]?.nom || 'Prestataire';
  return (
    <div className="carte-prestataire">
      <div
        className="carte-prestataire-avatar"
        style={{ backgroundImage: prestataire.photo ? `url(${prestataire.photo})` : undefined }}
      />
      <h3>{prestataire.nom}</h3>
      <EtoileNote note={prestataire.noteMoyenne} nombreAvis={prestataire.nombreAvis} />
      {prestataire.ville && <div className="carte-meta"><img src={locateicon} alt="" /> {prestataire.ville}</div>}
      <p className="metier">{metier}</p>
      <Link to={`/prestataires/${prestataire._id}`} className="bouton bouton-plein">
        Voir profil
      </Link>
    </div>
  );
}

function CarteRealisation({ realisation }) {
  return (
    <div className="carte">
      <div
        className="carte-image"
        style={{ backgroundImage: realisation.photos?.[0] ? `url(${realisation.photos[0]})` : undefined }}
      >
        {realisation.categorie?.nom && <span className="carte-badge">{realisation.categorie.nom}</span>}
      </div>
      <div className="carte-corps">
        <h3>{realisation.titre}</h3>
        {realisation.ville && <div className="carte-meta"><img src={locateicon} alt="" /> {realisation.ville}</div>}
        <EtoileNote note={realisation.prestataire?.noteMoyenne} nombreAvis={realisation.prestataire?.nombreAvis} />
      </div>
    </div>
  );
}

function Accueil() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [realisations, setRealisations] = useState([]);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [indexHero, setIndexHero] = useState(0);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [resCategories, resServices, resPrestataires, resRealisations, resStats] = await Promise.all([
          api.get('/categories'),
          api.get('/services'),
          api.get('/prestataires?limite=6'),
          api.get('/realisations'),
          api.get('/stats/publiques'),
        ]);
        setCategories(resCategories.data);
        setServices(resServices.data.slice(0, 6));
        setPrestataires(resPrestataires.data);
        setRealisations(resRealisations.data.slice(0, 4));
        setStats(resStats.data);
      } catch (error) {
        console.error('Erreur lors du chargement de la page Accueil', error);
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  useEffect(() => { 
    const intervalle = setInterval(() => { 
         setIndexHero((prev) => (prev + 1) % IMAGES_HERO.length); }, 5000); 
         return () => clearInterval(intervalle); }, []); 
         const heroSuivant = () => setIndexHero((prev) => (prev + 1) % IMAGES_HERO.length); 
         const heroPrecedent = () => setIndexHero((prev) => (prev - 1 + IMAGES_HERO.length) % IMAGES_HERO.length); 

  // Nombre de services par catégorie, calculé côté client à partir des services actifs
  const compterServicesParCategorie = (categorieId) =>
    services.filter((s) => s.categorie?._id === categorieId).length;

  return (
    <>
      <section className="hero conteneur"> 
        <div className="hero-images"> 
          {IMAGES_HERO.map((image, i) => ( <div key={i} 
          className={`hero-image-slide ${i === indexHero ? 'actif' : ''}`} 
          style={{ backgroundImage: `linear-gradient(120deg, rgba(20,83,45,0.85), rgba(20,83,45,0.35)), url(${image})`, }} /> ))} 
          </div> 
          <button className="hero-fleche hero-fleche-gauche" onClick={heroPrecedent} aria-label="Image précédente"> ‹ </button> 
          <button className="hero-fleche hero-fleche-droite" onClick={heroSuivant} aria-label="Image suivante"> › </button> 
          <div className="hero-contenu"> 
            <span className="hero-badge">Plateforme de services au Cameroun</span> 
            <h1 className="hero-titre"> Trouvez le bon prestataire pour tous vos services <span className="hero-souligne">au Cameroun</span> </h1> 
            <p className="hero-texte"> Des professionnels qualifiés, vérifiés et bien notés pour vous accompagner dans tous vos projets. </p> 
            <Link to="/services" className="bouton bouton-plein"> Découvrir maintenant <img src={arrowicon} alt="" /> </Link> </div> 
            <div className="hero-points"> {IMAGES_HERO.map((_, i) => ( <span key={i} className={`hero-point ${i === indexHero ? 'actif' : ''}`} onClick={() => setIndexHero(i)} /> ))} </div> 
            </section> 

      <div className="conteneur">
        {/* Catégories */}
        <section className="section">
          <div className="section-entete">
            <div>
              <div className="section-etiquette">NOS CATÉGORIES</div>
              <h2 className="section-titre">Explorez nos catégories</h2>
            </div>
            <Link to="/categories" className="section-lien">
              Voir toutes les catégories <img src={arrowicon2} alt="" />
            </Link>
          </div>
          <div className="grille-categories">
            {categories.map((categorie, index) => (
              <CarteCategorie
                key={categorie._id}
                categorie={categorie}
                index={index}
                nombreServices={compterServicesParCategorie(categorie._id)}
              />
            ))}
            {!chargement && categories.length === 0 && <p>Aucune catégorie disponible pour le moment.</p>}
          </div>
        </section>

        {/* Services */}
        <section className="section">
          <div className="section-entete">
            <div>
              <div className="section-etiquette">NOS SERVICES DISPONIBLES</div>
              <h2 className="section-titre">Les services disponibles sur Toolly</h2>
              <p className="section-soustitre">Des solutions pour tous vos besoins, à portée de main.</p>
            </div>
            <Link to="/services" className="section-lien">
              Voir tous les services <img src={arrowicon2} alt="" />
            </Link>
          </div>
          <div className="grille-cartes">
            {services.map((service) => (
              <CarteService key={service._id} service={service} />
            ))}
            {!chargement && services.length === 0 && <p>Aucun service disponible pour le moment.</p>}
          </div>
        </section>

        {/* Prestataires */}
        <section className="section">
          <div className="section-entete">
            <div>
              <div className="section-etiquette">NOS PRESTATAIRES</div>
              <h2 className="section-titre">Des professionnels de confiance</h2>
              <p className="section-soustitre">Des experts dans leur domaine, notés et vérifiés par notre équipe.</p>
            </div>
            <Link to="/prestataires" className="section-lien">
              Voir tous les prestataires <img src={arrowicon2} alt="" />
            </Link>
          </div>
          <div className="grille-cartes">
            {prestataires.map((prestataire) => (
              <CartePrestataire key={prestataire._id} prestataire={prestataire} />
            ))}
            {!chargement && prestataires.length === 0 && <p>Aucun prestataire vérifié pour le moment.</p>}
          </div>
        </section>

        {/* Réalisations */}
        <section className="section">
          <div className="section-entete">
            <div>
              <div className="section-etiquette">QUELQUES RÉALISATIONS</div>
              <h2 className="section-titre">Découvrez les travaux de nos prestataires</h2>
            </div>
            <Link to="/realisations" className="section-lien">
              Voir toutes les réalisations <img src={arrowicon2} alt="" />
            </Link>
          </div>
          <div className="grille-cartes">
            {realisations.map((realisation) => (
              <CarteRealisation key={realisation._id} realisation={realisation} />
            ))}
            {!chargement && realisations.length === 0 && <p>Aucune réalisation publiée pour le moment.</p>}
          </div>
        </section>

        {/* Statistiques */}
        {stats && (
          <div className="bandeau-stats">
            <div className="stat">
              <strong>{stats.nombrePrestataires}+</strong>
              <span>Prestataires inscrits</span>
            </div>
            <div className="stat">
              <strong>{stats.tauxSatisfaction}%</strong>
              <span>Taux de satisfaction</span>
            </div>
            <div className="stat">
              <strong>{stats.nombreServicesRealises}+</strong>
              <span>Services réalisés</span>
            </div>
            <div className="bandeau-stats-slogan">Ensemble, construisons un meilleur quotidien !</div>
          </div>
        )}
      </div>
    </>
  );
}

export default Accueil;
