import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import LayoutCompte from './components/LayoutCompte.jsx';
import LayoutAdmin from './components/LayoutAdmin.jsx';
import Accueil from './pages/Accueil.jsx';
import Services from './pages/Services.jsx';
import Connexion from './pages/Connexion.jsx';
import Inscription from './pages/Inscription.jsx';
import MonProfil from './pages/MonProfil.jsx';
import VerificationPrestataire from './pages/VerificationPrestataire.jsx';
import AdminTableauDeBord from './pages/admin/AdminTableauDeBord.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminVerifications from './pages/admin/AdminVerifications.jsx';
import './styles/global.css';
import ProposerService from './pages/ProproserService.jsx';
import Categories from './pages/Catégories.jsx';
import Prestataires from './pages/Prestataires.jsx';
import PrestataireDetail from './pages/PrestataireDetail.jsx'; 
import RealisationDetail from './pages/RealisationDetail.jsx';
import Realisations from './pages/Realisations.jsx';
import Messages from './pages/Messages.jsx'; 
import Conversation from './pages/Conversation.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';

function App() {
  const location = useLocation();
  const dansEspaceCompte = location.pathname.startsWith('/mon-compte');
  const dansEspaceAdmin = location.pathname.startsWith('/admin');
  const afficherHeaderPublic = !dansEspaceCompte && !dansEspaceAdmin;
  const afficherFooter = !dansEspaceAdmin;

  return (
    <>
      {afficherHeaderPublic && <Header />}

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/services" element={<Services />} />
         <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mon-compte/proposer-service" element={<LayoutCompte enfants={<ProposerService />} />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/prestataires" element={<Prestataires />} />
        <Route path="/prestataires/:id" element={<PrestataireDetail />} />
        <Route path="/realisations/:id" element={<RealisationDetail />} />
        
        {/* Discovery : prochaines pages à construire */}
        <Route path="/realisations" element={<Realisations />} />
        <Route path="/realisations/:id" element={<RealisationDetail />} />
        {/* Discovery : prochaines pages à construire */}

        <Route path="/mon-compte" element={<LayoutCompte enfants={<MonProfil />} />} />
        <Route path="/mon-compte/verification" element={<LayoutCompte enfants={<VerificationPrestataire />} />} />
        <Route path="/mon-compte/messages" element={<LayoutCompte enfants={<Messages />} />} /> 
        <Route path="/mon-compte/messages/:autreUtilisateurId" element={<LayoutCompte enfants={<Conversation />} />} />
        {/* Mes missions, Mes favoris, Messages, Paramètres, Devenir prestataire : à construire */}

        <Route path="/admin" element={<LayoutAdmin enfants={<AdminTableauDeBord />} />} />
        <Route path="/admin/categories" element={<LayoutAdmin enfants={<AdminCategories />} />} />
        <Route path="/admin/verifications" element={<LayoutAdmin enfants={<AdminVerifications />} />} />
      </Routes>

      {afficherFooter && <Footer />}
    </>
  );
}

export default App;
