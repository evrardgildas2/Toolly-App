import { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom'; 
import api from '../services/api'; 
import { IconeCategorie } from '../components/UtilsAffichage.jsx'; 
import '../styles/accueil.css'; 
function Categories() { 
    const [categories, setCategories] = useState([]); const [services, setServices] = useState([]); 
    const [chargement, setChargement] = useState(true); 
    useEffect(() => { Promise.all([api.get('/categories'), api.get('/services')]) 
        .then(([resCategories, resServices]) => { setCategories(resCategories.data); 
            setServices(resServices.data); }) 
            .finally(() => setChargement(false)); }, []); 
            const compter = (id) => services.filter((s) => s.categorie?._id === id).length; 
            return ( 
               <div className="conteneur" style={{ marginTop: 32, marginBottom: 48 }}> 
               <h1 className="section-titre" style={{ marginBottom: 20 }}>Toutes les catégories</h1> 
               {chargement ? ( <p>Chargement...</p> ) : ( <div className="grille-categories"> 
                {categories.map((categorie, index) => ( <Link to={`/services?categorie=${categorie._id}`} className="carte-categorie" key={categorie._id}>
                 <div className="carte-categorie-icone"> 
                    <IconeCategorie icone={categorie.icone} index={index} /> 
                    </div> 
                    <h3>{categorie.nom}</h3> 
                    <p>{compter(categorie._id)} services</p> </Link> ))} {categories.length === 0 && <p>Aucune catégorie disponible.</p>} </div> )} </div> ); } 
                     export default Categories;