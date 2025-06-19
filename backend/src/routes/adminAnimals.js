// src/routes/adminAnimals.js
const express = require('express');
const pool    = require('../lib/db');
const router  = express.Router();

// GET  /api/admin/animals
// Lista todos os animais desta ONG
router.get('/', async (req, res) => {
  const orgId = req.organization.id;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM animals
         WHERE organization_fk = $1
       ORDER BY id`,
      [orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar animais' });
  }
});

// POST /api/admin/animals
// Cria um novo animal para esta ONG
router.post('/', async (req, res) => {
  const orgId = req.organization.id;
  const {
    url, type, name, description, age, gender, size,
    primary_color, secondary_color, tertiary_color,
    breed, spayed_neutered, shots_current,
    children, dogs, cats, organization_animal_id,
    status
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO animals (
         organization_fk, url, type, name, description,
         age, gender, size, primary_color, secondary_color,
         tertiary_color, breed, spayed_neutered, shots_current,
         children, dogs, cats, organization_animal_id, status,
         status_changed_at, published_at
       ) VALUES (
         $1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10,
         $11, $12, $13, $14,
         $15, $16, $17, $18, $19,
         NOW(), NOW()
       )
       RETURNING *`,
      [
        orgId, url, type, name, description,
        age, gender, size, primary_color, secondary_color,
        tertiary_color, breed, spayed_neutered, shots_current,
        children, dogs, cats, organization_animal_id, status
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar animal' });
  }
});

// PUT  /api/admin/animals/:id
// Atualiza um animal existente (se pertencer a esta ONG)
router.put('/:id', async (req, res) => {
  const orgId = req.organization.id;
  const id    = req.params.id;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Nenhum dado para atualizar' });
  }

  // Monta dinamicamente o SET: "campo1"=$2, "campo2"=$3, ...
  const setClause = fields
    .map((f, i) => `"${f}"=$${i+2}`)
    .join(', ');

  try {
    const { rows } = await pool.query(
      `UPDATE animals
         SET ${setClause}, status_changed_at = NOW()
       WHERE id = $1
         AND organization_fk = $2
       RETURNING *`,
      [id, orgId, ...values]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Animal não encontrado ou sem permissão' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar animal' });
  }
});

// DELETE /api/admin/animals/:id
// Remove (ou marca inativo) um animal desta ONG
router.delete('/:id', async (req, res) => {
  const orgId = req.organization.id;
  const id    = req.params.id;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM animals
       WHERE id = $1
         AND organization_fk = $2`,
      [id, orgId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Animal não encontrado ou sem permissão' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir animal' });
  }
});

module.exports = router;
