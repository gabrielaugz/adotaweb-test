import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getPets } from '../../api/petfinder';
import Hero from '../../components/hero';
import './home.css';  // CSS específico para esta página

export default function HomePage() {
  useEffect(() => window.scrollTo(0, 0), []);
  const gridRef = useRef(null)

  const [data, setData] = useState(null);
  const { type = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const cityQuery  = searchParams.get('city')      || '';
  const vaccinated = searchParams.get('vaccinated') || '';
  const neutered   = searchParams.get('neutered')   || '';
  const mixed      = searchParams.get('mixed')      || '';
  const puppy      = searchParams.get('puppy')      || '';

  // Carrega pets sempre que qualquer filtro mudar
  useEffect(() => {
    setData(null);
    getPets({ type, city: cityQuery, vaccinated, neutered, mixed, puppy })
      .then(setData)
      .catch(err => {
        console.error(err);
        setData([]);
      });
  }, [type, cityQuery, vaccinated, neutered, mixed, puppy]);

  // atualiza só um filtro na URL
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
      <Hero />

      <h3 className="page-title">Disponíveis para adoção</h3>

      {/* ← Aqui ficam os filtros, logo abaixo do título */}
      <div className="filters-container">
        {[
          { label: 'Vacinado',   key: 'vaccinated', value: vaccinated },
          { label: 'Castrado',   key: 'neutered',   value: neutered   },
          { label: 'Raça definida', key: 'mixed', value: mixed },
          { label: 'Filhote',    key: 'puppy',      value: puppy     }
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

      {data.length > 0 ? (
        <div className="grid">
          {data.map(animal => (
            <Link
              key={animal.id}
              to={`/${animal.type.toLowerCase()}/${animal.id}`}
              className="pet"
            >
              <article>
                <div className="pet-image-container">
                  <img
                    className="pet-image"
                    src={animal.photoUrl || '/missing-animal.png'}
                    alt={`Foto de ${animal.name}`}
                  />
                </div>
                <h3>{animal.name}</h3>
                <p><b>Raça:</b> {animal.primary_breed || 'Desconhecida'}</p>
                <p><b>Cor:</b>   {animal.primary_color || 'Desconhecida'}</p>
                <p><b>Sexo:</b>{' '}
                  {animal.gender === 'Male'   ? 'Macho' :
                   animal.gender === 'Female' ? 'Fêmea' :
                   animal.gender}
                </p>
                {animal.contact?.address?.city && (
                  <p><b>Cidade:</b> {animal.contact.address.city} – {animal.contact.address.state}</p>
                )}
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <p className="prompt">Nenhum pet disponível para adoção no momento.</p>
      )}
    </div>
  );
}