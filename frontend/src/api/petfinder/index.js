// frontend\src\api\petfinder\index.js

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// função auxiliar para buscar JSON de uma URL
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
  return res.json();
}

export const tipos = ['Cat','Dog'];

// busca coleção de animais via query params
export const getPets = async ({
  type = '',
  city = '',
  vaccinated = '',
  neutered = '',
  breed = '',
  puppy = ''
} = {}) => {
  const params = new URLSearchParams();

  const typeParam = type
    ? type[0].toUpperCase() + type.slice(1).toLowerCase()
    : '';

  if (typeParam) params.append('type', typeParam);
  if (city)       params.append('city', city);
  if (vaccinated) params.append('vaccinated', vaccinated);
  if (neutered)   params.append('neutered',   neutered);
  if (breed)      params.append('breed',      breed);
  if (puppy)      params.append('puppy',      puppy);

  // inclui o "/api" aqui
  const { animals } = await fetchJSON(`${API}/api/animals?${params}`);
  return animals;
};

// detalhe de um pet pelo ID
export const getPetDetails = async id =>
  fetchJSON(`${API}/api/animals/${id}`);