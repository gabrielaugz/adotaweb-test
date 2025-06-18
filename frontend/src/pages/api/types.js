// src/pages/api/types.js
import { pool } from '@/lib/db'

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM types ORDER BY name')
    return res.status(200).json({ types: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar tipos' })
  }
}
