
import "../styles/loader.css";

function Chargement({ message = "Chargement..." }) {
  return (
    <div className="chargement-container">
      <div className="chargement-spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Chargement;
