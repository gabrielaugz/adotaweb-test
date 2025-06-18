// src/api/petfinder/index.js

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return res.json();
}

// Fetch pet types (Cat, Dog, etc.)
export const getPetTypes = () =>
  fetchJSON(`${API}/types`);

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

  if (type)              params.append('type',       type);
  if (city)              params.append('city',       city);
  if (vaccinated !== '') params.append('vaccinated', vaccinated);
  if (neutered !== '')   params.append('neutered',   neutered);
  if (breed !== '')      params.append('breed',      breed);
  if (puppy !== '')      params.append('puppy',      puppy);

  // Faz a chamada já devolvendo apenas o array de animals
  const { animals } = await fetchJSON(
    `${API}/animals?${params.toString()}`
  );
  return animals;
};
// === Fim do getPets novo ===

// Fetch detailed info for one pet
export const getPetDetails = id =>
  fetchJSON(`${API}/animals/${id}`);
