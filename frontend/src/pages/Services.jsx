import { useEffect, useMemo,useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { EtoileNote, IconeCategorie, formaterPrix } from '../components/UtilsAffichage.jsx';
import '../styles/accueil.css';
import '../styles/services.css';
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
    <div className="carte">
      <div className="carte-image" style={{ backgroundImage: service.photo ? `url(${service.photo})` : undefined }}>
        {service.categorie?.nom && <span className="carte-badge">{service.categorie.nom}</span>}
        <button
          className="carte-favori"
          onClick={() => setFavori(!favori)}
          aria-label="Ajouter aux favoris"
        >
          {/* TODO : remplacer par l'icône que l'utilisateur va fournir (pas de cœur) */}
          {favori ? '✓' : '+'}
        </button>
      </div>
      <div className="carte-corps">
        <h3>{service.titre}</h3>
         <div className="carte-prestataire-mini"> 
          <div className="mini-avatar" style={service.prestataire?.photo ? { backgroundImage: `url(${service.prestataire.photo})` } : undefined} > 
            {!service.prestataire?.photo && service.prestataire?.nom?.charAt(0).toUpperCase()} </div> 
            <span>{service.prestataire?.nom}</span> </div>
        {service.prestataire?.ville && <div className="carte-meta"> <img src={locateicon} alt="" />{service.prestataire.ville}, Cameroun</div>}
        <EtoileNote note={service.prestataire?.noteMoyenne} nombreAvis={service.prestataire?.nombreAvis} />
        <div className="carte-prix">
          À partir de <strong>{formaterPrix(service.prixMin)}</strong>
        </div>
        <Link to={`/services/${service._id}`} className="bouton bouton-plein carte-bouton">
          Voir plus <img src={arrowicon} alt="" />
        </Link>
      </div>
    </div>
  );
}

function Services() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [chargement, setChargement] = useState(true);

  const [recherche, setRecherche] = useState('');
  const [parametresUrl] = useSearchParams();
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState([]);
  const [tranchesSelectionnees, setTranchesSelectionnees] = useState([]);
  const [noteMinPendante, setNoteMinPendante] = useState(0);
  const [villePendante, setVillePendante] = useState('');
  const [filtresVisibles, setFiltresVisibles] = useState(false); 
  const heroRef = useRef(null); 
  const [heroVisible, setHeroVisible] = useState(true); 
  const [rechercheCompacteOuverte, setRechercheCompacteOuverte] = useState(false);

  // Filtres réellement appliqués (validés via "Appliquer les filtres")
  const [filtresAppliques, setFiltresAppliques] = useState({ noteMin: 0, ville: '' });
  const [tri, setTri] = useState('recents');
  const [page, setPage] = useState(1);
  
  useEffect(() => { 
    const gererScroll = () => { 
      if (heroRef.current) { 
        setHeroVisible(window.scrollY < heroRef.current.offsetHeight - 40); } }; 
        window.addEventListener('scroll', gererScroll); 
        return () => window.removeEventListener('scroll', gererScroll); }, []);

  useEffect(() => {
    const charger = async () => {
      try {
        const [resCategories, resServices] = await Promise.all([api.get('/categories'), api.get('/services')]);
        setCategories(resCategories.data);
        setServices(resServices.data);
        const categorieDepuisUrl = parametresUrl.get('categorie'); 
        if (categorieDepuisUrl) { setCategoriesSelectionnees([categorieDepuisUrl]); } 
        const rechercheDepuisUrl = parametresUrl.get('recherche'); 
        if (rechercheDepuisUrl) { setRecherche(rechercheDepuisUrl); }
      } catch (error) {
        console.error('Erreur lors du chargement des services', error);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, []);

  const villesDisponibles = useMemo(() => {
    const villes = services.map((s) => s.prestataire?.ville).filter(Boolean);
    return [...new Set(villes)];
  }, [services]);

  const compterServicesParCategorie = (categorieId) =>
    services.filter((s) => s.categorie?._id === categorieId).length;

  const basculerCategorie = (categorieId) => {
    setCategoriesSelectionnees((prev) =>
      prev.includes(categorieId) ? prev.filter((id) => id !== categorieId) : [...prev, categorieId]
    );
    setPage(1);
  };

  const basculerTranche = (trancheId) => {
    setTranchesSelectionnees((prev) =>
      prev.includes(trancheId) ? prev.filter((id) => id !== trancheId) : [...prev, trancheId]
    );
  };

  const appliquerFiltres = () => {
    setFiltresAppliques({ noteMin: noteMinPendante, ville: villePendante });
    setPage(1);
  };

  const reinitialiserFiltres = () => {
    setCategoriesSelectionnees([]);
    setTranchesSelectionnees([]);
    setNoteMinPendante(0);
    setVillePendante('');
    setFiltresAppliques({ noteMin: 0, ville: '' });
    setRecherche('');
    setPage(1);
  };

  const servicesFiltres = useMemo(() => {
    let resultat = services;

    if (recherche.trim()) {
      const terme = recherche.trim().toLowerCase();
      resultat = resultat.filter(
        (s) => s.titre.toLowerCase().includes(terme) || s.description?.toLowerCase().includes(terme)
      );
    }

    if (categoriesSelectionnees.length > 0) {
      resultat = resultat.filter((s) => categoriesSelectionnees.includes(s.categorie?._id));
    }

    if (tranchesSelectionnees.length > 0) {
      const tranches = TRANCHES_PRIX.filter((t) => tranchesSelectionnees.includes(t.id));
      resultat = resultat.filter((s) => tranches.some((t) => t.test(s.prixMin)));
    }

    if (filtresAppliques.ville) {
      resultat = resultat.filter((s) => s.prestataire?.ville === filtresAppliques.ville);
    }

    if (filtresAppliques.noteMin > 0) {
      resultat = resultat.filter((s) => (s.prestataire?.noteMoyenne || 0) >= filtresAppliques.noteMin);
    }

    const trie = [...resultat];
    if (tri === 'prix-asc') trie.sort((a, b) => a.prixMin - b.prixMin);
    else if (tri === 'prix-desc') trie.sort((a, b) => b.prixMin - a.prixMin);
    else if (tri === 'mieux-notes') trie.sort((a, b) => (b.prestataire?.noteMoyenne || 0) - (a.prestataire?.noteMoyenne || 0));
    else trie.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return trie;
  }, [services, recherche, categoriesSelectionnees, tranchesSelectionnees, filtresAppliques, tri]);

  const nombrePages = Math.max(1, Math.ceil(servicesFiltres.length / TAILLE_PAGE));
  const servicesPage = servicesFiltres.slice((page - 1) * TAILLE_PAGE, page * TAILLE_PAGE);

  return (
    <div className="conteneur">
      <section className={`hero-services ${!heroVisible ? 'cachee' : ''}`} ref={heroRef}>
        <div className="hero-services-contenu">
          <div className="section-etiquette">NOS SERVICES</div>
          <h1 className="hero-services-titre">Trouvez le service qu'il vous faut parmi des milliers de professionnels</h1>
          <p className="hero-services-texte">
            Que ce soit pour un dépannage, une prestation ou un projet, nos prestataires sont là pour vous
            accompagner.
          </p>
          <div className="barre-recherche">
                      <img className='button' src={searchIcon} alt="icone de recherche" />
            
            <input
              placeholder="Entrer un service..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
            />
            <button className="bouton bouton-plein">Rechercher <img src={arrowicon} alt="" /></button>
          </div>
          <Link to="/mon-compte" className="bouton bouton-contour" style={{ marginTop: 16 }}>
            + Proposer un service
          </Link>
        </div>
      </section>
      {!heroVisible && ( 
        <div className="recherche-compacte-conteneur"> 
        <div className={`recherche-groupe-compacte ${rechercheCompacteOuverte ? 'ouverte' : ''}`}> 
          <input type="text" className="recherche-input-compacte" placeholder="Rechercher un service..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} autoFocus={rechercheCompacteOuverte} /> 
          <button type="button" className="entete-recherche" onClick={() => setRechercheCompacteOuverte(!rechercheCompacteOuverte)} > <img src={searchIcon} alt="icone de recherche" /> </button> </div> </div> )}

      <section className="section">
        <div className="section-entete">
          <div>
            <div className="section-etiquette">NOS CATÉGORIES</div>
            <h2 className="section-titre">Parcourez nos catégories</h2>
            <p className="section-soustitre">Choisissez une catégorie pour découvrir les services associés.</p>
          </div>
        </div>
        <div className="grille-categories cliquable">
          {categories.map((categorie, index) => (
            <div
              key={categorie._id}
              className={`carte-categorie ${categoriesSelectionnees.includes(categorie._id) ? 'selectionnee' : ''}`}
              onClick={() => basculerCategorie(categorie._id)}
            >
              <div className="carte-categorie-icone">
                <IconeCategorie icone={categorie.icone} index={index} />
              </div>
              <h3>{categorie.nom}</h3>
              <p>{compterServicesParCategorie(categorie._id)} services</p>
            </div>
          ))}
        </div>
      </section>

     <div className={`mise-en-page-services ${filtresVisibles ? '' : 'filtres-fermes'}`}>
          {filtresVisibles && ( <aside className="panneau-filtres">
          <div className="panneau-filtres-entete">
            <span><img src={filtericon} alt="icone de filtre" /> Filtres</span>
            <button onClick={reinitialiserFiltres}>Réinitialiser</button>
          </div>

          <div className="groupe-filtre">
            <h4>Catégorie</h4>
            {categories.map((categorie) => (
              <label className="ligne-case" key={categorie._id}>
                <span>
                  <input
                    type="checkbox"
                    checked={categoriesSelectionnees.includes(categorie._id)}
                    onChange={() => basculerCategorie(categorie._id)}
                  />
                  {categorie.nom}
                </span>
                <span>{compterServicesParCategorie(categorie._id)}</span>
              </label>
            ))}
          </div>

          <div className="groupe-filtre">
            <h4>Localisation</h4>
            <select value={villePendante} onChange={(e) => setVillePendante(e.target.value)}>
              <option value="">Toutes les villes</option>
              {villesDisponibles.map((ville) => (
                <option key={ville} value={ville}>
                  {ville}
                </option>
              ))}
            </select>
          </div>

          <div className="groupe-filtre">
            <h4>Prix</h4>
            {TRANCHES_PRIX.map((tranche) => (
              <label className="ligne-case" key={tranche.id}>
                <span>
                  <input
                    type="checkbox"
                    checked={tranchesSelectionnees.includes(tranche.id)}
                    onChange={() => basculerTranche(tranche.id)}
                  />
                  {tranche.label}
                </span>
              </label>
            ))}
          </div>

          <div className="groupe-filtre">
            <h4>Note</h4>
            {[4, 3, 2].map((seuil) => (
              <label className="ligne-case" key={seuil}>
                <span>
                  <input
                    type="checkbox"
                    checked={noteMinPendante === seuil}
                    onChange={() => setNoteMinPendante(noteMinPendante === seuil ? 0 : seuil)}
                  />
                  {'★'.repeat(seuil)} et plus
                </span>
              </label>
            ))}
          </div>

          <button className="bouton bouton-plein bouton-appliquer" onClick={appliquerFiltres}>
            Appliquer les filtres
          </button>
          </aside>)}

        <div>
          <div className="resultats-entete">
            <button className="bouton bouton-contour" onClick={() => setFiltresVisibles(!filtresVisibles)} > <img src={filtericon} alt="" /> Filtres </button>
            <strong>{chargement ? '…' : servicesFiltres.length} services trouvés</strong>
            <select value={tri} onChange={(e) => setTri(e.target.value)}>
              <option value="recents">Trier par : Plus récentes</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="mieux-notes">Mieux notés</option>
            </select>
          </div>

          <div className="grille-cartes">
            {servicesPage.map((service) => (
              <CarteServiceComplete key={service._id} service={service} />
            ))}
            {!chargement && servicesFiltres.length === 0 && <p>Aucun service ne correspond à ces critères.</p>}
          </div>

          {nombrePages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
              {Array.from({ length: nombrePages }, (_, i) => i + 1).map((numero) => (
                <button
                  key={numero}
                  className={numero === page ? 'actif' : ''}
                  onClick={() => setPage(numero)}
                >
                  {numero}
                </button>
              ))}
              <button onClick={() => setPage(Math.min(nombrePages, page + 1))}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Services;
