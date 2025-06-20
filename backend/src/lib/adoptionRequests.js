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

module.exports = { createRequest, getRequestsByPet }
