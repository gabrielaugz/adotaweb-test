// src/backend/src/lib/animals.js
const pool = require('./db');

/**
 * Lista todos os animais com informações da ONG a que pertencem
 */
async function getAll() {
  const { rows } = await pool.query(`
    SELECT
      a.id,
      a.url,
      a.type,
      a.name,
      a.description,
      a.age,
      a.gender,
      a.size,
      a.primary_color,
      a.secondary_color,
      a.tertiary_color,
      a.breed,
      a.spayed_neutered,
      a.shots_current,
      a.children,
      a.dogs,
      a.cats,
      a.status,
      a.status_changed_at,
      a.published_at,
      a.organization_fk AS organization_id,
      org.name AS organization_name,
      org.email AS organization_email
    FROM animals a
    LEFT JOIN organizations org
      ON org.id = a.organization_fk
    ORDER BY a.id
  `);
  return rows;
}

/**
 * Cria um novo animal, vinculando-o a uma ONG
 * @param {object} data
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
    children = false,
    dogs = false,
    cats = false,
    status = 'adoptable'
  } = data;

  const sql = `
    INSERT INTO animals (
      organization_fk, url, type, name, description,
      age, gender, size,
      primary_color, secondary_color, tertiary_color,
      breed, spayed_neutered, shots_current,
      children, dogs, cats,
      status,
      status_changed_at, published_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11,
      $12, $13, $14,
      $15, $16, $17,
      $18, NOW(), NOW()
    )
    RETURNING *;
  `;

  const values = [
    organization_fk,
    url, type, name, description,
    age, gender, size,
    primary_color, secondary_color, tertiary_color,
    breed, spayed_neutered, shots_current,
    children, dogs, cats,
    status
  ];

  const { rows } = await pool.query(sql, values);
  return rows[0];
}

/**
 * Atualiza dados de um animal existente
 * @param {number} id
 * @param {object} data
 */
async function update(id, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const assignments = fields.map((f, i) => `"${f}"=$${i+2}`);
  const values = fields.map(f => data[f]);
  values.unshift(id);

  const sql = `
    UPDATE animals
       SET ${assignments.join(',')}, status_changed_at = NOW()
     WHERE id = $1
     RETURNING *;
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

/**
 * Remove um animal pelo ID
 * @param {number} id
 */
async function remove(id) {
  const { rowCount } = await pool.query(
    `DELETE FROM animals WHERE id = $1`,
    [id]
  );
  return rowCount > 0;
}

module.exports = { getAll, create, update, remove };
