// src/backend/src/lib/animals.js
const pool = require('./db');

/**
 * Lista todos os animais de uma ONG específica
 * @param {number|string} orgId
 * @returns {Promise<Array>} lista de animais
 */
async function getAll(orgId) {
  const { rows } = await pool.query(
    `SELECT *
       FROM animals
      WHERE organization_fk = $1
      ORDER BY id`,
    [orgId]
  );
  return rows;
}

/**
 * Cria um novo animal para a ONG
 * @param {number|string} orgId
 * @param {object} data
 * @returns {Promise<object>} animal criado
 */
async function create(orgId, data) {
  // Desestrutura campos, incluindo aninhados
  const {
    url,
    type,
    name,
    description,
    age,
    gender,
    size,
    breeds: { mixed: breed = false } = {},
    colors: { primary: primary_color = null, secondary: secondary_color = null, tertiary: tertiary_color = null } = {},
    attributes: { spayed_neutered = false, shots_current = false } = {},
    environment: { children = false, dogs = false, cats = false } = {},
    organization_animal_id = null,
    status
  } = data;

  const cols = [
    'organization_fk',
    'url','type','name','description','age','gender','size',
    'primary_color','secondary_color','tertiary_color',
    'breed','spayed_neutered','shots_current',
    'children','dogs','cats','organization_animal_id','status',
    'status_changed_at','published_at'
  ];

  // Somente 19 placeholders para os dados, depois usamos NOW() para timestamps
  const placeholders = Array.from({ length: 19 }, (_, i) => `$${i+1}`);
  const values = [
    orgId,
    url, type, name, description,
    age, gender, size,
    primary_color, secondary_color, tertiary_color,
    breed, spayed_neutered, shots_current,
    children, dogs, cats, organization_animal_id, status
  ];

  const sql = `
    INSERT INTO animals(${cols.join(',')})
    VALUES(${placeholders.join(',')}, NOW(), NOW())
    RETURNING *
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0];
}

/**
 * Atualiza campos de um animal (só se pertencer à ONG)
 * @param {number|string} id
 * @param {number|string} orgId
 * @param {object} data
 * @returns {Promise<object|null>} animal atualizado ou null
 */
async function update(id, orgId, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const assignments = fields.map((f, i) => `"${f}"=$${i+3}`);
  const values = fields.map(f => data[f]);
  // id = $1, orgId = $2
  values.unshift(orgId);
  values.unshift(id);

  const sql = `
    UPDATE animals
       SET ${assignments.join(',')}, status_changed_at = NOW()
     WHERE id = $1 AND organization_fk = $2
     RETURNING *
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

/**
 * Exclui um animal da ONG (hard delete)
 * @param {number|string} id
 * @param {number|string} orgId
 * @returns {Promise<boolean>} true se excluído
 */
async function remove(id, orgId) {
  const { rowCount } = await pool.query(
    `DELETE FROM animals WHERE id = $1 AND organization_fk = $2`,
    [id, orgId]
  );
  return rowCount > 0;
}

module.exports = { getAll, create, update, remove };