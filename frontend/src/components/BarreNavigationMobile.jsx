import { Link, useLocation } from 'react-router-dom';

function Icone({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function BarreNavigationMobile() {
  const location = useLocation();
  const connecte = !!localStorage.getItem('token');
  const p = location.pathname;

  const elements = [
    {
      libelle: 'Accueil',
      chemin: '/',
      actif: p === '/',
      icone: (
        <Icone>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </Icone>
      ),
    },
    {
      libelle: 'Services',
      chemin: '/services',
      actif: p.startsWith('/services'),
      icone: (
        <Icone>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Icone>
      ),
    },
    {
      libelle: 'Réalisations',
      chemin: '/realisations',
      actif: p.startsWith('/realisations'),
      icone: (
        <Icone>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Icone>
      ),
    },
    {
      libelle: 'Messages',
      chemin: connecte ? '/mon-compte/messages' : '/connexion',
      actif: p.startsWith('/mon-compte/messages'),
      icone: (
        <Icone>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </Icone>
      ),
    },
    {
      libelle: 'Profil',
      chemin: connecte ? '/mon-compte' : '/connexion',
      actif: p.startsWith('/mon-compte') && !p.startsWith('/mon-compte/messages'),
      icone: (
        <Icone>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </Icone>
      ),
    },
  ];

  return (
    <nav className="barre-mobile" aria-label="Navigation principale">
      {elements.map((element) => (
        <Link
          key={element.libelle}
          to={element.chemin}
          className={`barre-mobile-lien ${element.actif ? 'actif' : ''}`}
        >
          {element.icone}
          <span>{element.libelle}</span>
        </Link>
      ))}
    </nav>
  );
}

export default BarreNavigationMobile;