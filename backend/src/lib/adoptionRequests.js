// src/backend/src/lib/adoptionRequests.js
const pool = require('./db')

/**
 * Grava uma solicitação no banco
 */
async function createRequest(data) {
  const sql = `
    INSERT INTO adoption_requests
      (pet_id, name, email, phone, address, experience, message, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
    RETURNING *`
  const vals = [
    data.petId,
    data.name,
    data.email,
    data.phone,
    data.address,
    data.experience,
    data.message
  ]
  const { rows } = await pool.query(sql, vals)
  return rows[0]
}

/**
 * Lê todas as solicitações de um pet
 */
async function getRequestsByPet(petId) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, address, experience, message, created_at
       FROM adoption_requests
      WHERE pet_id = $1
      ORDER BY created_at DESC`,
    [petId]
  )
  return rows
}

/**
 * Remove uma solicitação de adoção pelo seu ID
 * @param {number} requestId
 * @returns {boolean} true se excluiu, false se não encontrou
 */
async function removeRequest(requestId) {
  const { rowCount } = await pool.query(
    `DELETE FROM adoption_requests
       WHERE id = $1`,
    [requestId]
  )
  return rowCount > 0
}

async function updateRequest(requestId, fields) {
  // fields poderá ser { status: 'approved' } ou { status:'denied' }
  const keys = Object.keys(fields)
  if (keys.length === 0) return null

  const assignments = keys.map((k,i) => `"${k}"=$${i+2}`)
  const values = keys.map(k => fields[k])
  values.unshift(requestId)

  const sql = `
    UPDATE adoption_requests
       SET ${assignments.join(',')}
     WHERE id = $1
     RETURNING *
  `
  const { rows } = await pool.query(sql, values)
  return rows[0] || null
}

module.exports = { createRequest, getRequestsByPet, removeRequest, updateRequest }
