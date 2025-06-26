// backend/src/routes/adoptionRequests.js
const express = require('express')
const router  = express.Router()
const {
  createRequest,
  getRequestsByPet,
  removeRequest,
  updateRequest
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
    // Converte os status do frontend para o formato do banco
    const statusMap = {
      'deferido': 'approved',
      'indeferido': 'denied',
      'em_analise': 'pending'
    };

    // Se o campo status foi enviado, converte
    if (req.body.status) {
      req.body.status = statusMap[req.body.status] || req.body.status;
    }

    const updated = await updateRequest(req.params.requestId, req.body)
    if (!updated) {
      return res.status(404).json({ error: 'Solicitação não encontrada' })
    }
    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Erro ao atualizar solicitação' })
  }
})

module.exports = router
