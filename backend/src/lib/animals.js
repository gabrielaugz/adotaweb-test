// src/backend/src/lib/animals.js
const pool = require('./db')

/**
 * Lista todos os animais, incluindo dados da ONG
 */
async function getAll() {
  const { rows } = await pool.query(
    `
      SELECT
        a.*,
        org.id   AS organization_id,
        org.name AS organization_name
      FROM animals a
      LEFT JOIN organizations org
        ON org.id = a.organization_fk
      ORDER BY a.id
    `
  )
  return rows
}

async function getOne(id) {
  try {
    // CORREÇÃO: use pool em vez de db
    const { rows } = await pool.query('SELECT * FROM animals WHERE id = $1', [id]);
    return rows[0] || null;
  } catch (err) {
    console.error('Erro ao buscar animal:', err);
    throw err;
  }
}

/**
 * Cria um novo animal
 */
async function create(data) {
  const {
    organization_fk,
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
      $1,$2,$3,$4,$5,
      $6,$7,$8,
      $9,$10,$11,
      $12,$13,$14,
      $15,
      NOW(), NOW()
    )
    RETURNING *
  `

  const values = [
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
    status
  ]

  const { rows } = await pool.query(sql, values)
  return rows[0]
}

/**
 * Atualiza um animal pelo ID
 */
async function update(id, data) {
  const fields = Object.keys(data)
  if (fields.length === 0) return null

  const assignments = fields.map((f, i) => `"${f}"=$${i+2}`)
  const values = fields.map(f => data[f])
  values.unshift(id)

  const sql = `
    UPDATE animals
       SET ${assignments.join(',')}, status_changed_at = NOW()
     WHERE id = $1
     RETURNING *
  `

  const { rows } = await pool.query(sql, values)
  return rows[0] || null
}

/**
 * Exclui um animal pelo ID
 */
async function remove(id) {
  try {
    // PRIMEIRO: excluir fotos associadas
    await pool.query('DELETE FROM photos WHERE animal_id = $1', [id]);
    
    // DEPOIS: excluir o animal
    const { rowCount } = await pool.query(
      `DELETE FROM animals WHERE id = $1`,
      [id]
    );
    return rowCount > 0;
  } catch (err) {
    console.error('Erro ao excluir animal:', err);
    throw err;
  }
}

module.exports = { getAll, create, update, remove, getOne }
