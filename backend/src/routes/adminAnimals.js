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
// Lista todos os animais da ONG autenticada
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
// Cria um novo animal para esta ONG
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
// Atualiza um animal existente (se pertencer a esta ONG)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const atualizado = await updateAnimal(id, req.organization.id, req.body);
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
// Marca como invisível (soft delete) ou remove completamente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ok = await removeAnimal(id, req.organization.id);
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
