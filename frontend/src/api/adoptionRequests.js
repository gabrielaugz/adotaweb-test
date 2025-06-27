// frontend\src\api\adoptionRequests.js

import { API_BASE } from '../utils/api'

// função auxiliar para buscar JSON de uma URL
async function fetchJSON(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => null)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

// envia uma solicitação de adoção
export function sendAdoptionRequest(data) {
  return fetchJSON(
    `${API_BASE}/api/adoptions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  )
}

// busca solicitações de adoção para um pet específico
export function getAdoptionRequests(petId) {
  return fetchJSON(`${API_BASE}/api/adoptions/${petId}`)
}