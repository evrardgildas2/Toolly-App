export const ICONES_PAR_DEFAUT = ['🏠', '🚗', '💻', '💇', '🛠️', '🎓', '⋯'];

// Une catégorie peut avoir soit un emoji simple (texte), soit une vraie image
// uploadée (URL Cloudinary) — on distingue les deux pour l'afficher correctement.
export function IconeCategorie({ icone, index }) {
  const estUneUrl = icone && /^https?:\/\//.test(icone);

  if (estUneUrl) {
    return <img src={icone} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />;
  }

  return <>{icone || ICONES_PAR_DEFAUT[index % ICONES_PAR_DEFAUT.length]}</>;
}

export function EtoileNote({ note, nombreAvis }) {
  if (!nombreAvis) return null;
  return (
    <span className="carte-note">
      <span>★</span> {note?.toFixed(1)} ({nombreAvis} avis)
    </span>
  );
}

// Formate un prix en FCFA avec séparateur de milliers, ex: 15000 -> "15 000 FCFA"
export function formaterPrix(montant) {
  if (montant === null || montant === undefined) return '';
  return `${montant.toLocaleString('fr-FR')} FCFA`;
}
