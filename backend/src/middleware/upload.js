const multer = require('multer');
const path = require('path');

// Configuração do Multer para permitir uploads de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta temporária (opcional)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png') { // <--- Aceita apenas PNG
      return cb(new Error('Apenas arquivos PNG são permitidos.'));
    }
    cb(null, true);
  },
});

module.exports = upload;