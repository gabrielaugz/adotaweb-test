// backend/src/lib/adoptionRequests.js

const pool = require('./db')

async function createRequest(data) {

// grava uma nova solicitação de adoção\async function createRequest(data) {
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

// busca todas as solicitações de um pet ordenadas da mais recente
async function getRequestsByPet(petId) {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, address, experience, message, created_at, status
       FROM adoption_requests
      WHERE pet_id = $1
      ORDER BY created_at DESC`,
    [petId]
  )  
  return rows
}

// exclui uma solicitação pelo id e retorna true se removida
async function removeRequest(requestId) {
  const { rowCount } = await pool.query(
    `DELETE FROM adoption_requests
       WHERE id = $1`,
    [requestId]
  )
  return rowCount > 0
}

// atualiza campos de uma solicitação e retorna o registro atualizado
async function updateRequest(requestId, fields) {
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

// nega todas as solicitações pendentes de um pet, exceto a aprovada
async function denyOtherRequests(petId, approvedRequestId) {
  await pool.query(
    `UPDATE adoption_requests
        SET status = 'denied'
      WHERE pet_id = $1
        AND id != $2
        AND status = 'pending'`,
    [petId, approvedRequestId]
  )
}

module.exports = { createRequest, getRequestsByPet, removeRequest, updateRequest, denyOtherRequests }