const express = require('express');
const router = express.Router();

// Funções do banco de dados
const {
  getAll,
  create: createAnimal,
  update: updateAnimal,
  remove: removeAnimal,
  getOne: getOneAnimal
} = require('../lib/animals');

const {
  createPhoto,
  updatePhoto,
  getPhotosByAnimalId
} = require('../lib/photos');

// Configurações e middlewares
const cloudinary = require('../config/cloudinary');
const upload = require('../middleware/upload');

// GET /api/admin/animals
router.get('/', async (_req, res) => {
  try {
    const rows = await getAll();
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao listar animais' });
  }
});

// POST /api/admin/animals
router.post(
  '/',
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
      }

      // 1. Cria o animal sem imagem
      const animalData = { ...req.body };
      const novoAnimal = await createAnimal(animalData);

      // 2. Faz upload da imagem para o Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      // 3. Cria a foto vinculada ao animal
      await createPhoto({
        url: result.secure_url,
        animal_id: novoAnimal.id,
        is_primary: true
      });

      // 4. Retorna o animal atualizado (com url vindo do trigger)
      const updatedAnimal = await getOneAnimal(novoAnimal.id);
      return res.status(201).json(updatedAnimal);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao criar animal' });
    }
  }
);

// PUT /api/admin/animals/:id
router.put(
  '/:id',
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params;
    try {
      // 1. Atualiza dados do animal (sem imagem)
      const animalUpdateData = { ...req.body };
      delete animalUpdateData.image; // Remove campo inválido

      const atualizado = await updateAnimal(id, animalUpdateData);
      if (!atualizado) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      // 2. Se houver imagem, atualiza a foto principal
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        const photoData = {
          url: result.secure_url,
          is_primary: true
        };

        // Verifica se já existe uma foto para o animal
        const existingPhotos = await getPhotosByAnimalId(id);
        if (existingPhotos.length > 0) {
          // Atualiza foto existente
          await updatePhoto(existingPhotos[0].id, photoData);
        } else {
          // Cria nova foto
          await createPhoto({ ...photoData, animal_id: id });
        }
      }

      // 3. Retorna animal atualizado (com url vindo do trigger)
      const updatedAnimal = await getOneAnimal(id);
      return res.json(updatedAnimal);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao atualizar animal' });
    }
  }
);

// DELETE /api/admin/animals/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ok = await removeAnimal(id);
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