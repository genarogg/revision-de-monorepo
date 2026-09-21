import React from "react";
import "./css/footer.css"

interface FooterProps { children?: React.ReactNode; }

const Footer: React.FC<FooterProps> = () => {

    return (
        <footer className="footer-container">
            <div className="desktop-footer">
                <p><strong>UNERG | Desarrollado por Dirección de Informática.</strong></p>
            </div>
        </footer>
    );
};

export default Footer;
