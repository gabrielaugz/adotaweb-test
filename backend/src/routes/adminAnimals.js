// src/routes/adminAnimals.js
const express = require('express');
const router  = express.Router();
const {
  getAll,
  create: createAnimal,
  update: updateAnimal,
  remove: removeAnimal
} = require('../lib/animals');

// GET  /api/admin/animals
router.get('/', async (req, res) => {
  try {
    const rows = await getAll(req.organization.id);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar animais' });
  }
});

// POST /api/admin/animals
router.post('/', async (req, res) => {
  try {
    const novo = await createAnimal(req.organization.id, req.body);
    return res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar animal' });
  }
});

// PUT  /api/admin/animals/:id
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await updateAnimal(req.params.id, req.organization.id, req.body);
    if (!atualizado) {
      return res.status(404).json({ error: 'Animal não encontrado ou sem permissão' });
    }
    return res.json(atualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar animal' });
  }
});

// DELETE /api/admin/animals/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await removeAnimal(req.params.id, req.organization.id);
    if (!ok) {
      return res.status(404).json({ error: 'Animal não encontrado ou sem permissão' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao excluir animal' });
  }
});

module.exports = router;
