import React, { useEffect, useState } from 'react';
import { getPetTypes } from '../../api/petfinder';
import Logo from '../../assets/AdotaWeb2.png';
import Search from '../search';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const Navigation = ({ logoHeight = 40 }) => {
  const [petTypes, setPetTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getPetTypesData() {
      try {
        const { types } = await getPetTypes();
        setPetTypes(types);
      } catch (error) {
        console.error("Error fetching pet types:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getPetTypesData();
  }, []);

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
        <li key={'all'}>
          <NavLink 
            to="/"
            className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Todos os Pets
          </NavLink>
        </li>
        {isLoading ? (
          <li>Carregando...</li>
        ) : (
petTypes.map((type) => {
  const slug = type.name.toLowerCase(); // "dog" ou "cat"
  const label = type.name === 'Dog'
    ? 'Cachorros'
    : type.name === 'Cat'
      ? 'Gatos'
      : `${type.name}s`;

  return (
    <li key={type.name}>
      <NavLink 
        to={`/${slug}`}
        className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}               
      >
        {label}
      </NavLink>
    </li>
  );
}))}

      </ul>
    </nav>
  );
};

Navigation.propTypes = {
  logoHeight: PropTypes.number
};

Navigation.defaultProps = {
  logoHeight: 100
};

export default Navigation;