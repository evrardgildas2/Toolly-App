function Footer() {
  return (
    <footer className="pied-page">
      <div className="conteneur">
        <div className="pied-page-grille">
          <div className="pied-page-colonne">
            <div className="entete-logo" style={{ marginBottom: 10 }}>
              Toolly
            </div>
            <p>Des services. Des gens. Une même communauté.</p>
            <div className="pied-page-reseaux">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="X">x</a>
              <a href="#" aria-label="Instagram">ig</a>
              <a href="#" aria-label="YouTube">yt</a>
            </div>
          </div>

          <div className="pied-page-colonne">
            <h4>LIENS UTILES</h4>
            <a href="/">Accueil</a>
            <a href="/services">Services</a>
            <a href="/realisations">Réalisations</a>
            <a href="/discover">Discovery</a>
          </div>

          <div className="pied-page-colonne">
            <h4>INFORMATIONS</h4>
            <a href="#">Conditions d'utilisation</a>
            <a href="#">Politique de confidentialité</a>
            <a href="#">FAQ</a>
            <a href="#">Contact</a>
          </div>

          <div className="pied-page-colonne">
            <h4>NOUS SUIVRE</h4>
            <p>Yaoundé, Cameroun</p>
            <p>contact@toolly.cm</p>
            <p>+237 6 79 12 34 56</p>
          </div>
        </div>

        <div className="pied-page-bas">
          <span>© {new Date().getFullYear()} Toolly. Tous droits réservés.</span>
          <span>Toolly, le service à portée de main !</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
