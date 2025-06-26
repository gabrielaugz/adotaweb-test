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
const cloudinary = require('../lib/cloudinary');
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

      // 4. Retorna o animal atualizado (com URL do Cloudinary)
      return res.status(201).json({
        ...novoAnimal,
        url: result.secure_url // Usa a URL do Cloudinary diretamente
      });
      
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
      // 1. Verifica se o animal existe
      const animal = await getOneAnimal(id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      // 2. Atualiza dados básicos do animal
      const animalUpdateData = { ...req.body };
      const atualizado = await updateAnimal(id, animalUpdateData);
      
      // 3. Atualiza a imagem se foi enviada
      let newPhotoUrl = null;
      if (req.file) {
        // Faz upload da nova imagem
        const result = await cloudinary.uploader.upload(req.file.path);
        newPhotoUrl = result.secure_url;

        // Busca fotos existentes
        const existingPhotos = await getPhotosByAnimalId(id);
        
        if (existingPhotos.length > 0) {
          // Atualiza a foto principal existente
          await updatePhoto(existingPhotos[0].id, {
            url: newPhotoUrl,
            is_primary: true
          });
        } else {
          // Cria nova foto principal
          await createPhoto({
            url: newPhotoUrl,
            animal_id: id,
            is_primary: true
          });
        }
      }

      // 4. Retorna resposta com dados atualizados
      const updatedData = { ...animalUpdateData };
      
      // Se temos nova URL de foto, adiciona na resposta
      if (newPhotoUrl) {
        updatedData.url = newPhotoUrl;
      } else {
        // Mantém a URL existente se não houve alteração
        updatedData.url = animal.url;
      }
      
      return res.json({
        ...updatedData,
        id: animal.id
      });
      
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