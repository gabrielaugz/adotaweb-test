// backend/src/routes/organizations.js
const express = require('express');
const router  = express.Router();
const pool    = require('../lib/db');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name
        FROM organizations
       ORDER BY name
    `);
    return res.json({ organizations: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar organizações' });
  }
});

module.exports = router;