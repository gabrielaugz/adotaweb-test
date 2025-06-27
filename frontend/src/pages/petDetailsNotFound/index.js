// frontend\src\pages\petDetailsNotFound\index.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PetDetailsNotFound = () => {

  const navigate = useNavigate();

  // navegar para a página inicial
  const goHome = () => {
    navigate('/');
  }
  
  return (
    <main className="page">
      <h3>404: Onde estão os animais?</h3>
      <p>Desculpe, mas os detalhes deste pet ainda não foram cadastrados pelo abrigo. Tente novamente mais tarde!</p>
      <img
        src="./media/weve-lost-our-corgination.gif"
        alt="Corgi perdido - ilustração animada"
      />
      <div className="actions-container">
        <button className="button" onClick={goHome}>
          Voltar ao Início
        </button>
      </div>
    </main>
  );
};

export default PetDetailsNotFound;