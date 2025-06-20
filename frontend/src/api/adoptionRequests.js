// frontend/src/api/adoptionRequests.js
import { API_BASE } from '../utils/api'

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => null)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * Envia uma nova solicitação de adoção
 * @param {{ petId: number, name, email, phone, address, experience, message }} data
 */
export function sendAdoptionRequest(data) {
  return fetchJSON(`${API_BASE}/api/adoptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
}

/**
 * Busca todas as solicitações de adoção de um pet
 * @param {number} petId
 */
export function getAdoptionRequests(petId) {
  return fetchJSON(`${API_BASE}/api/adoptions/${petId}`)
}
