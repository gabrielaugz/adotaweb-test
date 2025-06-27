// frontend\src\components\navigation\index.js

import React from 'react';
import Logo from '../../assets/AdotaWeb2.png';
import Search from '../search';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const tipos = ['Dog','Cat'];

const Navigation = ({ logoHeight = 40 }) => {
  return (
    <nav>
      <div className="nav-logo">
        <NavLink to="/">
          <img 
            src={Logo} 
            alt="Petlover" 
            style={{ height: `${logoHeight}px` }}
          />
        </NavLink>
        <Search />
      </div>
      <ul className="nav-links">
        <li key="all">
          <NavLink 
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Todos os Pets
          </NavLink>
        </li>

        {tipos.map(type => {
          const slug = type.toLowerCase(); // 'dog' ou 'cat' em minúsculas
          const label = type === 'Dog'
            ? 'Cachorros'
            : 'Gatos';

          return (
            <li key={type}>
              <NavLink 
                to={`/${slug}`}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

Navigation.propTypes = {
  logoHeight: PropTypes.number,
};

Navigation.defaultProps = {
  logoHeight: 100,
};

export default Navigation;
