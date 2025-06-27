// frontend\src\components\footer\index.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import Logo from '../../assets/AdotaWeb2.png';

const Footer = ({ logoHeight = 40, logoWidth, logoClassName = '' }) => {
  const logoStyle = {
    height: `${logoHeight}px`,
    width: logoWidth ? `${logoWidth}px` : 'auto',
    objectFit: 'contain'
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <img 
            src={Logo} 
            alt="Petlover" 
            className={`footer-logo ${logoClassName}`} 
            style={logoStyle}
          />
          <p className="footer-description">Conectando pets a lares amorosos desde 2025</p>
        </div>

        <div className="footer-links-container">
          <div className="footer-links-group">
            <h4 className="footer-links-title">Adoção</h4>
            <ul className="footer-links-list">
              <li>
                <NavLink 
                  to="/admin" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Área do Administrador
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Todos os Pets
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/dog" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Cachorros
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/cat" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Gatos
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-links-title">Ajuda</h4>
            <ul className="footer-links-list">
              <li>
                <NavLink 
                  to="/faq" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Perguntas Frequentes
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/adoption-guide" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Guia de Adoção
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-links-title">Sobre</h4>
            <ul className="footer-links-list">
              <li>
                <NavLink 
                  to="/about" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Nossa História
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/contact" 
                  className={({isActive}) => `footer-link ${isActive ? 'footer-link-active' : ''}`}
                >
                  Contato
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Adota Web. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  logoHeight: PropTypes.number,
  logoWidth: PropTypes.number,
  logoClassName: PropTypes.string
};

Footer.defaultProps = {
  logoHeight: 75,
  logoWidth: undefined,
  logoClassName: ''
};

export default Footer;