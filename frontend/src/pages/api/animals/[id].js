// src/pages/api/animals/[id].js
import { pool } from '@/lib/db'

export default async function handler(req, res) {
  const { id } = req.query
  try {
    const { rows } = await pool.query(
      `SELECT *
         FROM animals
        WHERE id = $1`,
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Pet não encontrado' })
    return res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar detalhes do pet' })
  }
}
