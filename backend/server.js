// backend\server.js

require('dotenv').config()
const express = require('express')
const path    = require('path')
const fs      = require('fs')
const pool               = require('./src/lib/db')
const adminAnimalsRoutes = require('./src/routes/adminAnimals')
const orgRoutes          = require('./src/routes/organizations')
const adoptionRoutes     = require('./src/routes/adoptionRequests')

const app = express()

// garante que a pasta uploads exista
const uploadDir = './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log(`✅ Pasta "${uploadDir}" criada.`)
} else {
  console.log(`📁 Pasta "${uploadDir}" já existe.`)
}

app.use(express.json())

// CORS básico
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// listagem pública de animais
app.get('/api/animals', async (req, res) => {
  const {
    type        = '',
    city        = '',
    vaccinated  = '',
    neutered    = '',
    breed       = '',
    puppy       = ''
  } = req.query

  const sql = `
    SELECT
      a.id,
      a.type,
      a.name,
      a.age,
      a.gender,
      a.size,
      a.primary_color,
      COALESCE(p.url, a.url) AS "photoUrl",
      org.email       AS org_email,
      org.phone       AS org_phone,
      org.address1    AS org_address1,
      org.address2    AS org_address2,
      org.city        AS org_city,
      org.state       AS org_state,
      org.postcode    AS org_postcode,
      org.country     AS org_country,
      a.shots_current,
      a.spayed_neutered,
      a.breed
    FROM animals a
    LEFT JOIN LATERAL (
      SELECT url
      FROM photos p2
      WHERE p2.animal_id = a.id
        AND p2.is_primary
      LIMIT 1
    ) p ON true
    LEFT JOIN organizations org
      ON org.id = a.organization_fk
    WHERE
      ($1 = ''    OR a.type::text        = $1)
      AND ($2 = '' OR org.city    ILIKE '%'||$2||'%')
      AND (
        $3 = ''
        OR ($3 = 'true'  AND a.shots_current    = TRUE)
        OR ($3 = 'false' AND a.shots_current    = FALSE)
      )
      AND (
        $4 = ''
        OR ($4 = 'true'  AND a.spayed_neutered = TRUE)
        OR ($4 = 'false' AND a.spayed_neutered = FALSE)
      )
      AND (
        $5 = ''
        OR ($5 = 'true'  AND a.breed           = TRUE)
        OR ($5 = 'false' AND a.breed           = FALSE)
      )
      AND (
        $6 = ''
        OR ($6 = 'true'  AND a.age = 'Baby')
        OR ($6 = 'false' AND a.age <> 'Baby')
      )
      AND a.status = 'adoptable'
    LIMIT 100
  `

  try {
    const vals = [type, city, vaccinated, neutered, breed, puppy]
    const { rows } = await pool.query(sql, vals)
    const animals = rows.map(r => ({
      id:              r.id,
      type:            r.type,
      name:            r.name,
      age:             r.age,
      gender:          r.gender,
      size:            r.size,
      primary_color:   r.primary_color,
      photoUrl:        r.photoUrl,
      shots_current:   r.shots_current,
      spayed_neutered: r.spayed_neutered,
      breed:           r.breed,
      contact: {
        email:   r.org_email,
        phone:   r.org_phone,
        address: {
          address1: r.org_address1,
          address2: r.org_address2,
          city:      r.org_city   || 'Não informado',
          state:     r.org_state  || '',
          postcode:  r.org_postcode,
          country:   r.org_country
        }
      }
    }))
    return res.json({ animals })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

// detalhes de um animal específico
app.get('/api/animals/:id', async (req, res) => {
  const { id } = req.params
  const detailSql = `
    SELECT
      a.id,
      a.type,
      a.name,
      a.description,
      a.age,
      a.gender,
      a.size,
      a.primary_color,
      a.secondary_color,
      a.tertiary_color,
      a.breed           AS breed_flag,
      a.spayed_neutered,
      a.shots_current,
      a.status,
      a.status_changed_at,
      a.published_at,
      org.email       AS org_email,
      org.phone       AS org_phone,
      org.address1    AS org_address1,
      org.address2    AS org_address2,
      org.city        AS org_city,
      org.state       AS org_state,
      org.postcode    AS org_postcode,
      org.country     AS org_country
    FROM animals a
    LEFT JOIN organizations org
      ON org.id = a.organization_fk
    WHERE a.id = $1
    LIMIT 1
  `

  try {
    const { rows } = await pool.query(detailSql, [id])
    const row = rows[0]
    if (!row) return res.status(404).json({ error: 'Pet não encontrado' })

    const photosRes = await pool.query(`
      SELECT url AS small, url AS medium, url AS large, url AS full
      FROM photos
      WHERE animal_id = $1
      ORDER BY slot
    `, [id])

    const animalDetail = {
      id:          row.id,
      type:        row.type,
      name:        row.name,
      description: row.description,
      age:         row.age,
      gender:      row.gender,
      size:        row.size,
      breeds: { breed: row.breed_flag },
      colors: {
        primary:   row.primary_color,
        secondary: row.secondary_color,
        tertiary:  row.tertiary_color
      },
      attributes: {
        spayed_neutered: row.spayed_neutered,
        shots_current:   row.shots_current
      },
      environment: {
        children: row.children,
        dogs:     row.dogs,
        cats:     row.cats
      },
      status:             row.status,
      status_changed_at:  row.status_changed_at,
      published_at:       row.published_at,
      photos:             photosRes.rows,
      contact: {
        email: row.org_email,
        phone: row.org_phone,
        address: {
          address1: row.org_address1,
          address2: row.org_address2,
          city:      row.org_city   || 'Não informado',
          state:     row.org_state  || '',
          postcode:  row.org_postcode,
          country:   row.org_country
        }
      }
    }

    return res.json(animalDetail)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

// rotas crud do administrador
app.use('/api/organizations', orgRoutes)
console.log('>>> Montando rota ADMIN CRUD em: /api/admin/animals')
app.use('/api/admin/animals', adminAnimalsRoutes)
app.use('/api/adoptions', adoptionRoutes)

// serve o frontend estático
const buildPath = path.join(__dirname, '..', 'frontend', 'build')
app.use(express.static(buildPath))
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})

// inicia o servidor na porta definida ou 3001 por padrão
const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`🐶 API rodando na porta ${port}`)
})