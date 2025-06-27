// backend\src\routes\adminAnimals.js

// backend/src/routes/adminAnimals.js

const express = require('express')
const router = express.Router()

// funções de acesso ao bd
const {
  getAll,
  create: createAnimal,
  update: updateAnimal,
  remove: removeAnimal,
  getOne: getOneAnimal
} = require('../lib/animals')
const {
  createPhoto,
  updatePhoto,
  getPhotosByAnimalId
} = require('../lib/photos')

// configurações de upload e cloudinary
const cloudinary = require('../lib/cloudinary')
const upload = require('../middleware/upload')

// lista todos os animais cadastrados
router.get('/', async (_req, res) => {
  try {
    const rows = await getAll()
    return res.json(rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao listar animais' })
  }
})

// cria um novo animal e faz upload da imagem
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'nenhuma imagem foi enviada' })
    }

    // cria registro básico do animal
    const animalData = { ...req.body }
    const novoAnimal = await createAnimal(animalData)

    // faz upload para cloudinary
    const result = await cloudinary.uploader.upload(req.file.path)

    // armazena url da foto no bd
    await createPhoto({
      url: result.secure_url,
      animal_id: novoAnimal.id,
      is_primary: true
    })

    // retorna animal com url da imagem
    return res.status(201).json({
      ...novoAnimal,
      url: result.secure_url
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao criar animal' })
  }
})

// atualiza dados do animal e sua foto, se fornecida
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params
  try {
    // verifica existência do animal
    const animal = await getOneAnimal(id)
    if (!animal) {
      return res.status(404).json({ error: 'animal não encontrado' })
    }

    // atualiza campos textuais
    const animalUpdateData = { ...req.body }
    await updateAnimal(id, animalUpdateData)

    let newPhotoUrl = null
    if (req.file) {
      // upload da nova imagem
      const result = await cloudinary.uploader.upload(req.file.path)
      newPhotoUrl = result.secure_url

      // obtém fotos atuais
      const existing = await getPhotosByAnimalId(id)
      if (existing.length > 0) {
        // atualiza foto principal
        await updatePhoto(existing[0].id, {
          url: newPhotoUrl,
          is_primary: true
        })
      } else {
        // cria nova foto principal
        await createPhoto({
          url: newPhotoUrl,
          animal_id: id,
          is_primary: true
        })
      }
    }

    // monta resposta com url atualizada ou existente
    const responseData = {
      ...animalUpdateData,
      id: animal.id,
      url: newPhotoUrl || animal.url
    }
    return res.json(responseData)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'erro ao atualizar animal' })
  }
})

// remove um animal pelo id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const ok = await removeAnimal(id)
    if (!ok) {
      return res.status(404).json({ error: 'animal não encontrado' })
    }
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      error: 'erro ao excluir animal',
      details: err.message
    })
  }
})

module.exports = router
