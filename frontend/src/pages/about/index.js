// frontend\src\pages\about\index.js

import React from 'react';
import { NavLink } from 'react-router-dom';

const AboutPage = () => {
    window.scrollTo(0, 0);
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>Nossa História</h1>
        <p>Conectando pets a lares amorosos desde 2025</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="about-text">
            <h2>Como tudo começou</h2>
            <p>
              A AdotaWeb nasceu em 2025 da paixão de um grupo de amigos por animais e tecnologia. 
              Percebemos que muitos pets esperavam por um lar em abrigos, enquanto muitas pessoas 
              queriam adotar mas não sabiam como encontrar seu companheiro ideal.
            </p>
            <p>
              Decidimos criar uma plataforma que tornasse o processo de adoção mais transparente, 
              fácil e seguro, conectando diretamente abrigos a potenciais adotantes em todo o país.
            </p>
          </div>
        </section>

        <section className="about-section">
          <div className="about-text">
            <h2>Nossa Missão</h2>
            <p>
              Queremos reduzir o número de animais abandonados no Brasil, promovendo a adoção 
              consciente e responsável. Acreditamos que cada pet merece um lar amoroso, e cada 
              família merece a alegria de ter um companheiro animal.
            </p>
            <ul className="mission-list">
              <li>Facilitar o processo de adoção</li>
              <li>Educar sobre posse responsável</li>
              <li>Apoiar abrigos e protetores independentes</li>
              <li>Combater o comércio ilegal de animais</li>
            </ul>
          </div>
        </section>

        <section className="stats-section">
          <h2>Nossos Números</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>2.500+</h3>
              <p>Pets adotados</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Abrigos parceiros</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Pets castrados</p>
            </div>
            <div className="stat-item">
              <h3>20+</h3>
              <p>Cidades atendidas</p>
            </div>
          </div>
        </section>

        <div className="about-cta">
          <h2>Faça parte dessa história</h2>
          <p>Adote, apoie ou divulgue nosso trabalho</p>
          <div className="cta-buttons">
            <NavLink to="/" className="cta-button primary">
              Ver Pets para Adoção
            </NavLink>
            <NavLink to="/contact" className="cta-button secondary">
              Seja um Parceiro
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;