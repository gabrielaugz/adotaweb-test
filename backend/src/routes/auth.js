// src/backend/routes/auth.js
const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const pool     = require('../lib/db');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // 1) busca ONG pelo email
    const { rows } = await pool.query(
      'SELECT id, email, password_hash FROM organizations WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const org = rows[0];
    // 2) compara senha
    const match = await bcrypt.compare(password, org.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 3) gera o token JWT
    const payload = { id: org.id, email: org.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h'
    });

    // 4) retorna o token
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
