// frontend\src\components\pet\index.js

import React from 'react';

const Pet = ({ animal }) => {
  const city  = animal.contact?.address?.city;
  const state = animal.contact?.address?.state;

  return (
    <a
      key={animal.id}
      href={`/${animal.type.toLowerCase()}/${animal.id}`}
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
        <p><b>Raça:</b> {animal.breed ? 'Raça definida' : 'Vira-Lata'}</p>
        <p>Cor:   {animal.primary_color || 'Desconhecida'}</p>
        <p>
          Sexo:{' '}
          {animal.gender === 'Male'   ? 'Macho' :
           animal.gender === 'Female' ? 'Fêmea' :
           animal.gender}
        </p>
        <p>
          Localidade:{' '}
          {city && state
            ? `${city} - ${state}`
            : city || state || 'Não informado'}
        </p>
      </article>
    </a>
  );
};

export default Pet;
