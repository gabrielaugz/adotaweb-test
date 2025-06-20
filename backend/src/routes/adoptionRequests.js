// backend/src/routes/adoptionRequests.js
const express = require('express')
const router  = express.Router()
const {
  createRequest,
  getRequestsByPet
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

module.exports = router
