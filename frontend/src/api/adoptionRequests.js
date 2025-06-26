// src/frontend/src/api/adoptionRequests.js
import { API_BASE } from '../utils/api'

async function fetchJSON(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => null)
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

/**
 * Envia uma nova solicitação
 * @param {{ petId: number, name, email, phone, address, experience, message }} data
 */
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

/**
 * Busca todas as solicitações de um pet
 * @param {number} petId
 */
export function getAdoptionRequests(petId) {
  // Endpoint corrigido para área administrativa
  return fetchJSON(`${API_BASE}/api/admin/adoptions/${petId}`)
}
