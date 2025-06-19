// src/backend/src/lib/animals.js
const pool = require('./db');

async function getAll(orgId) {
  const { rows } = await pool.query(
    `SELECT * 
       FROM animals 
      WHERE organization_fk = $1 
        AND (visible IS NULL OR visible = TRUE)
      ORDER BY id`,
    [orgId]
  );
  return rows;
}

async function create(orgId, data) {
  const cols = [
    'url','type','name','description','age','gender','size',
    'primary_color','secondary_color','tertiary_color',
    'breed','spayed_neutered','shots_current',
    'children','dogs','cats','organization_animal_id','status'
  ];
  const placeholders = cols.map((_,i)=>`$${i+2}`);
  const values = cols.map(c=>data[c]);
  values.unshift(orgId);               // vira o $1
  // adiciona status_changed_at e published_at no NOW()
  const sql = `INSERT INTO animals(
    organization_fk,${cols.join(',')},status_changed_at,published_at
  ) VALUES ($1,${placeholders.join(',')},NOW(),NOW()) RETURNING *`;

  const { rows } = await pool.query(sql, values);
  return rows[0];
}

async function update(id, orgId, data) {
  const fields = Object.keys(data);
  if (!fields.length) return null;
  const setClause = fields
    .map((f,i)=>`"${f}"=$${i+3}`)
    .join(',');
  const values = fields.map(f=>data[f]);
  values.unshift(orgId); // $2
  values.unshift(id);    // $1
  // sempre atualiza status_changed_at
  const sql = `UPDATE animals
                SET ${setClause}, status_changed_at=NOW()
              WHERE id=$1 AND organization_fk=$2
              RETURNING *`;
  const { rows } = await pool.query(sql, values);
  return rows[0]||null;
}

async function remove(id, orgId, soft=true) {
  if (soft) {
    const { rowCount } = await pool.query(
      `UPDATE animals SET visible=FALSE
       WHERE id=$1 AND organization_fk=$2`,
      [id, orgId]
    );
    return rowCount>0;
  } else {
    const { rowCount } = await pool.query(
      `DELETE FROM animals
       WHERE id=$1 AND organization_fk=$2`,
      [id, orgId]
    );
    return rowCount>0;
  }
}

module.exports = { getAll, create, update, remove };
