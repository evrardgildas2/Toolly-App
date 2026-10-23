import logo from "./logo/logo-Toolly2.png";
import './ToollyLoader.css';


export default function ToollyLoader(){
    return (
        <div className="toolly-loader">
            <div className="toolly-loader-content">
                <img
                src={logo}
                alt="Toolly"
                className="toolly-loader-logo"
                />

                <div className="toolly-loader-bar"
                role="status"
                aria-label="chargement en cours"
                >
                    <span/>
                </div>
                <p>Préparation de votre expérience...</p>


            </div>
            </div>
    );
}