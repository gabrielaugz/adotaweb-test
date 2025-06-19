// src/pages/api/animals/index.js
import { pool } from '@/lib/db';

export default async function handler(req, res) {
  const { type = '', query = '' } = req.query;

  try {
    const sql = `
      SELECT
        id,
        name,
        age,
        gender,
        size,
        primary_color,
        breed,
        type
      FROM animals
      WHERE ($1 = '' OR type = $1)
        AND (name ILIKE '%'||$2||'%' OR description ILIKE '%'||$2||'%')
      LIMIT 100
    `;
    const { rows } = await pool.query(sql, [type, query]);
    return res.status(200).json({ animals: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar animais' });
  }
}
