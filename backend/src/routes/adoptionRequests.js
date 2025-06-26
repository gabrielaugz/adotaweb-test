// backend/src/routes/adoptionRequests.js
const express = require('express')
const router  = express.Router()
const {
  createRequest,
  getRequestsByPet,
  removeRequest,
  updateRequest,
  denyOtherRequests
} = require('../lib/adoptionRequests')

// POST /api/adoptions
router.post('/', async (req, res) => {
  try {
    const novo = await createRequest(req.body)
    return res.status(201).json(novo)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao criar solicitação' })
  }
})

// GET /api/adoptions/:petId
router.get('/:petId', async (req, res) => {
  try {
    const lista = await getRequestsByPet(req.params.petId)
    return res.json({ requests: lista })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao listar solicitações' })
  }
})

// DELETE /api/adoptions/:requestId
router.delete('/:requestId', async (req, res) => {
  try {
    const ok = await removeRequest(req.params.requestId)
    if (!ok) {
      return res.status(404).json({ error: 'Solicitação não encontrada' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao excluir solicitação' })
  }
})

router.put('/:requestId', async (req, res) => {
  try {
    const updated = await updateRequest(req.params.requestId, req.body)
    if (!updated) {
      return res.status(404).json({ error: 'Solicitação não encontrada' })
    }

    // Se status foi aprovado, negar as demais
    if (req.body.status === 'approved') {
      await denyOtherRequests(updated.pet_id, updated.id)
    }

    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao atualizar solicitação' })
  }
})

module.exports = router
