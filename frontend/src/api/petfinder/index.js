// src/api/petfinder/index.js

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return res.json();
}

export const tipos = ['Cat','Dog'];

// === Substitua aqui pelo novo getPets: ===
export const getPets = async ({
  type = '',
  city = '',
  vaccinated = '',
  neutered = '',
  breed = '',
  puppy = ''
} = {}) => {
  const params = new URLSearchParams();

  // normaliza "dog" → "Dog", "cat" → "Cat"
  const typeParam = type
    ? type[0].toUpperCase() + type.slice(1).toLowerCase()
    : '';

  // **só** um append de type
  if (typeParam)    params.append('type',       typeParam);
  if (city)         params.append('city',       city);
  if (vaccinated)   params.append('vaccinated', vaccinated);
  if (neutered)     params.append('neutered',   neutered);
  if (breed)        params.append('breed',      breed);
  if (puppy)        params.append('puppy',      puppy);

  const { animals } = await fetchJSON(
    `${API}/animals?${params.toString()}`
  );
  return animals;
};
// === Fim do getPets novo ===

// Fetch detailed info for one pet
export const getPetDetails = id =>
  fetchJSON(`${API}/animals/${id}`);
