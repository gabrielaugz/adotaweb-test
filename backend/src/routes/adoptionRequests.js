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

// cria nova solicitação de adoção
router.post('/', async (req, res) => {
  try {
    const novo = await createRequest(req.body)
    return res.status(201).json(novo)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao criar solicitação' })
  }
})

// lista todas as solicitações de um pet
router.get('/:petId', async (req, res) => {
  try {
    const lista = await getRequestsByPet(req.params.petId)
    return res.json({ requests: lista })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao listar solicitações' })
  }
})

// exclui solicitação pelo id
router.delete('/:requestId', async (req, res) => {
  try {
    const ok = await removeRequest(req.params.requestId)
    if (!ok) {
      return res.status(404).json({ error: 'solicitação não encontrada' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao excluir solicitação' })
  }
})

// atualiza status da solicitação
// se aprovada, nega as demais pendentes do mesmo pet
router.put('/:requestId', async (req, res) => {
  try {
    const updated = await updateRequest(req.params.requestId, req.body)
    if (!updated) {
      return res.status(404).json({ error: 'solicitação não encontrada' })
    }

    if (req.body.status === 'approved') {
      await denyOtherRequests(updated.pet_id, updated.id)
    }

    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao atualizar solicitação' })
  }
})

module.exports = router