// src/backend/src/lib/animals.js
const pool = require('./db');

/**
 * Lista todos os animais de uma ONG específica
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
 */
async function create(orgId, data) {
  // 1) Desestruturação do JSON, com defaults
  const {
    url,
    type,
    name,
    description,
    age,
    gender,
    size,
    breeds: { mixed: breed = false } = {},
    colors: {
      primary: primary_color = null,
      secondary: secondary_color = null,
      tertiary: tertiary_color = null
    } = {},
    attributes: {
      spayed_neutered = false,
      shots_current   = false
    } = {},
    environment: {
      children = false,
      dogs     = false,
      cats     = false
    } = {},
    organization_animal_id = null,
    status
  } = data;

  // 2) Montagem de colunas e valores
  const cols = [
    'organization_fk',
    'url','type','name','description','age','gender','size',
    'primary_color','secondary_color','tertiary_color',
    'breed','spayed_neutered','shots_current',
    'children','dogs','cats','organization_animal_id','status',
    'status_changed_at','published_at'
  ];
  // Para status_changed_at e published_at usamos NOW() diretamente
  const values = [
    orgId,
    url, type, name, description,
    age, gender, size,
    primary_color, secondary_color, tertiary_color,
    breed, spayed_neutered, shots_current,
    children, dogs, cats, organization_animal_id, status
  ];

  // Geramos placeholders $1..$19 para os 19 primeiros campos
  const placeholders = values.map((_, i) => `$${i+1}`);

  const sql = `
    INSERT INTO animals(
      ${cols.join(',')}
    ) VALUES (
      ${placeholders.join(',')}, NOW(), NOW()
    )
    RETURNING *
  `;
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

/**
 * Atualiza campos de um animal (só se pertencer à ONG)
 */
async function update(id, orgId, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  // Monta SET "campo"=$3, "outro"=$4, ...
  const assignments = fields.map((f, i) => `"${f}"=$${i+3}`);
  const values = fields.map(f => data[f]);
  // Preenche $1=id e $2=orgId
  values.unshift(orgId);
  values.unshift(id);

  const sql = `
    UPDATE animals
       SET ${assignments.join(',')}, status_changed_at = NOW()
     WHERE id = $1
       AND organization_fk = $2
     RETURNING *
  `;
  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

/**
 * Exclui um animal da ONG (hard delete)
 */
async function remove(id, orgId) {
  const { rowCount } = await pool.query(
    `DELETE FROM animals
     WHERE id = $1
       AND organization_fk = $2`,
    [id, orgId]
  );
  return rowCount > 0;
}

module.exports = { getAll, create, update, remove };
