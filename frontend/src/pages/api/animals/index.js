// src/pages/api/animals/index.js
import { pool } from '@/lib/db'

export default async function handler(req, res) {
  const { type = '', query = '' } = req.query
  try {
    // Exemplo: filtra por type.name e faz busca por nome/descrição
    const sql = `
      SELECT a.id, a.name, a.age, a.gender, a.size, a.primary_color, a.primary_breed
      FROM animals a
      JOIN types t ON a.type_id = t.id
      WHERE ($1 = '' OR t.name = $1)
        AND (a.name ILIKE '%'||$2||'%' OR a.description ILIKE '%'||$2||'%')
      LIMIT 100
    `
    const { rows } = await pool.query(sql, [type, query])
    return res.status(200).json({ animals: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar animais' })
  }
}
