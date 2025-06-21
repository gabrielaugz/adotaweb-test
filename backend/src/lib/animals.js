// src/backend/src/lib/animals.js
const pool = require('./db')

/**
 * Lista todos os animais de uma ONG específica
 * @param {string|number} orgId
 */
async function getAll(orgId) {
  const { rows } = await pool.query(
    `SELECT *
       FROM animals
      WHERE organization_fk = $1
      ORDER BY id`,
    [orgId]
  )
  return rows
}

/**
 * Cria um novo animal para a ONG
 */
async function create(orgId, data) {
  const {
    url = null,
    type,
    name = null,
    description = null,
    age = null,
    gender = null,
    size = null,
    primary_color = null,
    secondary_color = null,
    tertiary_color = null,
    breed = false,
    spayed_neutered = false,
    shots_current = false,
    status = 'adoptable'
  } = data

  const sql = `
    INSERT INTO animals(
      organization_fk,
      url,
      type,
      name,
      description,
      age,
      gender,
      size,
      primary_color,
      secondary_color,
      tertiary_color,
      breed,
      spayed_neutered,
      shots_current,
      status,
      status_changed_at,
      published_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11,
      $12, $13, $14,
      $15,
      NOW(), NOW()
    ) RETURNING *`

  const values = [
    orgId,
    url,
    type,
    name,
    description,
    age,
    gender,
    size,
    primary_color,
    secondary_color,
    tertiary_color,
    breed,
    spayed_neutered,
    shots_current,
    status
  ]

  const { rows } = await pool.query(sql, values)
  return rows[0]
}

/**
 * Atualiza campos de um animal que pertença à ONG
 */
async function update(id, orgId, data) {
  const fields = Object.keys(data)
  if (fields.length === 0) return null

  const assignments = fields.map((f, i) => `"${f}"=$${i+3}`)
  const values = fields.map(f => data[f])
  values.unshift(orgId)
  values.unshift(id)

  const sql = `
    UPDATE animals
       SET ${assignments.join(',')}, status_changed_at = NOW()
     WHERE id = $1 AND organization_fk = $2
     RETURNING *
  `

  const { rows } = await pool.query(sql, values)
  return rows[0] || null
}

/**
 * Exclui um animal da ONG (hard delete)
 */
async function remove(id, orgId) {
  const { rowCount } = await pool.query(
    `DELETE FROM animals
     WHERE id = $1 AND organization_fk = $2`,
    [id, orgId]
  )
  return rowCount > 0
}

module.exports = { getAll, create, update, remove }
