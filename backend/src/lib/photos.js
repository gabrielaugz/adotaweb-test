const pool = require('./db');

// Cria uma nova foto e define como principal
async function createPhoto({ url, animal_id, is_primary = true }) {
  const sql = `
    INSERT INTO photos(url, animal_id, is_primary)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [url, animal_id, is_primary];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

// Atualiza uma foto existente
async function updatePhoto(id, { url, is_primary }) {
  const fields = Object.keys({ url, is_primary });
  const assignments = fields.map((f, i) => `"${f}"=$${i+2}`);
  const values = [...Object.values({ url, is_primary }), id];

  const sql = `
    UPDATE photos
       SET ${assignments.join(',')}, is_primary = $2
     WHERE id = $1
     RETURNING *
  `;

  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

// Busca fotos de um animal
async function getPhotosByAnimalId(animal_id) {
  const { rows } = await pool.query(
    'SELECT * FROM photos WHERE animal_id = $1',
    [animal_id]
  );
  return rows;
}

module.exports = { createPhoto, updatePhoto, getPhotosByAnimalId };