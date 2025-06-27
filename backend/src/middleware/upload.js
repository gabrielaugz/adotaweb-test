// backend\src\middleware\upload.js

const multer = require('multer')
const path = require('path')

// middleware para upload de arquivos png
const storage = multer.diskStorage({
  // pasta temporária para salvar arquivos
  destination: (req, file, cb) => cb(null, 'uploads/'),
  // nomeia o arquivo com timestamp e extensão original
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})

// configura limites e filtro para aceitar apenas png até 10mb
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ext !== '.png') return cb(new Error('apenas arquivos png são permitidos.'))
    cb(null, true)
  }
})

module.exports = upload