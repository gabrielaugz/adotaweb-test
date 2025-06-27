// frontend\src\pages\search\index.js

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPets } from '../../api/petfinder';
import Hero from '../../components/hero';
import Pet from '../../components/pet';
import '../home/home.css';

export default function SearchPage() {
  useEffect(() => window.scrollTo(0, 0), []);
  const gridRef = useRef(null)


  const [searchParams, setSearchParams] = useSearchParams();
  const cityQuery  = searchParams.get('city')      || '';
  const vaccinated = searchParams.get('vaccinated') || '';
  const neutered   = searchParams.get('neutered')   || '';
  const breed      = searchParams.get('breed')      || '';
  const puppy      = searchParams.get('puppy')      || '';

  const [data, setData] = useState(null);

  // sempre que qualquer filtro (ou a cidade) mudar, refaz a query
  useEffect(() => {
    setData(null);
    getPets({
      city: cityQuery,
      vaccinated,
      neutered,
      breed,
      puppy
    })
      .then(setData)
      .catch(err => {
        console.error(err);
        setData([]);
      });
  }, [cityQuery, vaccinated, neutered, breed, puppy]);

  // função para atualizar um filtro específico
  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (data === null) return <h2>Carregando...</h2>;

  return (
    <div className="page">
      {/* Hero reutilizado */}
      <Hero displayText={`Resultados para "${cityQuery}"`} />

      <h3 className="page-title">Pets disponíveis em <strong>{cityQuery}</strong></h3>

      {/* filtros idênticos aos da HomePage */}
      <div className="filters-container">
        {[
          { label: 'Vacinado',     key: 'vaccinated', value: vaccinated },
          { label: 'Castrado',     key: 'neutered',   value: neutered   },
          { label: 'Raça definida',key: 'breed',      value: breed      },
          { label: 'Filhote',      key: 'puppy',      value: puppy      }
        ].map(({ label, key, value }) => (
          <div className="filter-group" key={key}>
            <label htmlFor={key}>{label}:</label>
            <select
              id={key}
              value={value}
              onChange={e => updateFilter(key, e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        ))}
      </div>

      {/* grid de resultados */}
      {data.length > 0 ? (
        <div className="grid">
          {data.map(animal => (
            <Pet animal={animal} key={animal.id} />
          ))}
        </div>
      ) : (
        <p className="prompt">
          Nenhum pet encontrado em <strong>"{cityQuery}"</strong>.
        </p>
      )}
    </div>
  );
}