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
 * Cria um novo animal para a ONG (campos dinâmicos)
 */
async function create(orgId, data) {
  // Colunas permitidas além de organization_fk
  const allowed = [
    'url','type','name','description','age','gender','size',
    'primary_color','secondary_color','tertiary_color',
    'breed','spayed_neutered','shots_current',
    'children','dogs','cats','organization_animal_id','status'
  ];

  // Monta dinamicamente as colunas e valores enviados
  const cols = ['organization_fk'];
  const values = [orgId];
  allowed.forEach(key => {
    if (data[key] !== undefined) {
      cols.push(key);
      values.push(data[key]);
    }
  });

  // Adiciona timestamps
  cols.push('status_changed_at', 'published_at');
  values.push(new Date(), new Date());

  const placeholders = cols.map((_, i) => `$${i+1}`);
  const sql = `
    INSERT INTO animals(${cols.join(',')})
    VALUES(${placeholders.join(',')})
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

  const assignments = fields.map((f, i) => `"${f}"=$${i+3}`);
  const values = fields.map(f => data[f]);
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
 */
async function remove(id, orgId) {
  const { rowCount } = await pool.query(
    `DELETE FROM animals WHERE id = $1 AND organization_fk = $2`,
    [id, orgId]
  );
  return rowCount > 0;
}

module.exports = { getAll, create, update, remove };
