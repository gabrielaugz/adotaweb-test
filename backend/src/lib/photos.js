// backend/src/lib/photos.js

const pool = require('./db')

// cria uma nova foto, marcando-a como principal por padrão
async function createPhoto({ url, animal_id, is_primary = true }) {
  const sql = `
    INSERT INTO photos(url, animal_id, is_primary)
    VALUES ($1, $2, $3)
    RETURNING *
  `
  const values = [url, animal_id, is_primary]
  const { rows } = await pool.query(sql, values)
  return rows[0]
}

// atualiza campos de uma foto existente e retorna o registro atualizado
async function updatePhoto(id, data) {
  const fields = Object.keys(data)
  if (fields.length === 0) return null

  const assignments = fields.map((f, i) => `${f} = $${i + 1}`)
  const values = fields.map(f => data[f])
  values.push(id) // id no final

  const sql = `
    UPDATE photos
       SET ${assignments.join(', ')}
     WHERE id = $${values.length}
     RETURNING *
  `
  const { rows } = await pool.query(sql, values)
  return rows[0] || null
}

// busca todas as fotos associadas a um animal
async function getPhotosByAnimalId(animal_id) {
  const { rows } = await pool.query(
    'SELECT * FROM photos WHERE animal_id = $1',
    [animal_id]
  )
  return rows
}

module.exports = { createPhoto, updatePhoto, getPhotosByAnimalId }