// src/backend/src/routes/adminAnimals.js
const express = require('express');
const router  = express.Router();
const {
  getAll,
  create: createAnimal,
  update: updateAnimal,
  remove: removeAnimal
} = require('../lib/animals');

// GET  /api/admin/animals
router.get('/', async (_req, res) => {
  try {
    const rows = await getAll();             // sem organização
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar animais' });
  }
});

// POST /api/admin/animals
router.post('/', async (req, res) => {
  try {
    const novo = await createAnimal(req.body);  // sem organização
    return res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar animal' });
  }
});

// PUT  /api/admin/animals/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const atualizado = await updateAnimal(id, req.body);  // sem organização
    if (!atualizado) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    return res.json(atualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar animal' });
  }
});

// DELETE /api/admin/animals/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ok = await removeAnimal(id);      // sem organização
    if (!ok) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao excluir animal' });
  }
});

module.exports = router;
