
import '../styles/loader.css';

export default function SkeletonService({ type = 'service' }) {
  if (type === 'prestataire') {
    return (
      <div className="skeleton-carte skeleton-prestataire" aria-hidden="true">
        <div className="skeleton skeleton-avatar" />
        <div className="skeleton skeleton-nom" />
        <div className="skeleton skeleton-note" />
        <div className="skeleton skeleton-ligne" />
        <div className="skeleton skeleton-metier" />
        <div className="skeleton skeleton-bouton" />
      </div>
    );
  }

  return (
    <div className="skeleton-carte" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-corps">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-titre" />
        <div className="skeleton skeleton-ligne" />
        <div className="skeleton skeleton-note" />
        <div className="skeleton skeleton-prix" />
        <div className="skeleton skeleton-bouton" />
      </div>
    </div>
  );
}
