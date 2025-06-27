// frontend\src\components\hero\index.js

import React, { useState, useEffect } from 'react';

const Hero = ({ displayText }) => {
  const type = '';
  const images = [
    'dogs.jpg',
    'gatos.avif',
    'dogcat.jpeg', 
    'cats.jpg'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // função para atualizar o índice da imagem atual a cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      className="hero-container"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${images[currentImageIndex]}")`,
        backgroundBlendMode: 'saturation',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <h2 style={{ color: 'white', textAlign: 'center' }}>
        {displayText || getHeroTitle(type)}
      </h2>
    </div>
  );
};

export default Hero;

const getHeroTitle = (type) => {
  switch (type) {
    case 'dog':
      return 'Dogs';
    case 'cat':
      return 'Cats';
    default:
      return 'Olá';
  }
};