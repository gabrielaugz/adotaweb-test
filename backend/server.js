// server.js
require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')

/**
 * Conexão com o PostgreSQL. Em produção (NODE_ENV=production)
 * habilita SSL sem validar certificado (Render/Heroku).
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
})

const app = express()

// Middleware CORS básico
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Pega a porta de ambiente ou 3001 por padrão
const port = process.env.PORT || process.env.API_PORT || 3001
app.listen(port, () => {
  console.log(`🐶 API rodando na porta ${port}`)
})

/**
 * GET /api/animals
 * Lista animais com filtros (type, city, vaccinated, neutered, mixed, puppy).
 */
app.get('/api/animals', async (req, res) => {
  const {
    type    = '',
    city    = '',
    vaccinated = '',
    neutered   = '',
    mixed      = '',
    puppy      = ''
  } = req.query

  const sql = `
    SELECT
      a.id,
      t.name       AS type,
      a.name,
      a.age,
      a.gender,
      a.size,
      a.primary_color,
      -- se não tiver foto primária, volta a.url original
      COALESCE(p.url_medium, a.url) AS "photoUrl",
      addr.city,
      addr.state,
      a.shots_current,
      a.spayed_neutered,
      a.mixed
    FROM animals a
    JOIN types t   ON a.type_id = t.id
    LEFT JOIN LATERAL (
      SELECT url_medium
      FROM photos p2
      WHERE p2.animal_id = a.id
        AND p2.is_primary
      LIMIT 1
    ) p ON true
    LEFT JOIN contacts c     ON c.animal_id  = a.id
    LEFT JOIN addresses addr ON c.address_id = addr.id
    WHERE 
      ($1 = '' OR LOWER(t.name) = LOWER($1))
      AND ($2 = '' OR addr.city ILIKE '%'||$2||'%')
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
        OR ($5 = 'true'  AND a.mixed           = TRUE)
        OR ($5 = 'false' AND a.mixed           = FALSE)
      )
      AND (
        $6 = '' 
        OR ($6 = 'true'  AND a.age = 'Baby')
        OR ($6 = 'false' AND a.age <> 'Baby')
      )
    LIMIT 100
  `
  try {
    const vals = [type, city, vaccinated, neutered, mixed, puppy]
    const { rows } = await pool.query(sql, vals)

    // Ajusta formato esperado pelo front
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
      mixed:           r.mixed,
      contact: {
        address: {
          city:  r.city  || 'Não informado',
          state: r.state || ''
        }
      }
    }))

    return res.json({ animals })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/types
 * Retorna todos os tipos de animal (gato, cachorro, etc).
 */
app.get('/api/types', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name
         FROM types
        ORDER BY name`
    )
    return res.json({ types: rows })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/animals/:id
 * Retorna detalhes completos de UM animal.
 */
app.get('/api/animals/:id', async (req, res) => {
  const { id } = req.params

  try {
    // 1) dados básicos + raças + flags que o front consome
    const detailSql = `
      SELECT
        a.id,
        t.name           AS type,
        a.name,
        a.description,
        a.age,
        a.gender,
        a.size,
        a.coat,
        a.primary_color,
        a.secondary_color,
        a.tertiary_color,

        /* campos de raças para montar breeds */
        a.primary_breed,
        a.secondary_breed,
        a.mixed      AS mixed_flag,
        a.unknown    AS unknown_flag,

        /* atributos extras */
        a.spayed_neutered,
        a.house_trained,
        a.declawed,
        a.special_needs,
        a.shots_current,

        /* ambiente */
        a.children,
        a.dogs,
        a.cats,

        /* metadados */
        a.organization_animal_id,
        a.status,
        a.status_changed_at,
        a.published_at
      FROM animals a
      JOIN types t ON a.type_id = t.id
      WHERE a.id = $1
      LIMIT 1
    `
    const { rows } = await pool.query(detailSql, [id])
    const row = rows[0]
    if (!row) {
      return res.status(404).json({ error: 'Pet não encontrado' })
    }

    // 2) fotos
    const photosRes = await pool.query(
      `SELECT
         url_small  AS small,
         url_medium AS medium,
         url_large  AS large,
         url_full   AS full
       FROM photos
       WHERE animal_id = $1
       ORDER BY slot`,
      [id]
    )

    // 3) contato + endereço
    const contactRes = await pool.query(
      `SELECT
         c.email,
         c.phone,
         json_build_object(
           'address1', addr.address1,
           'address2', addr.address2,
           'city',     addr.city,
           'state',    addr.state,
           'postcode', addr.postcode,
           'country',  addr.country
         ) AS address
       FROM contacts c
       LEFT JOIN addresses addr ON c.address_id = addr.id
       WHERE c.animal_id = $1
       LIMIT 1`,
      [id]
    )

    // 4) monta JSON final
    const animalDetail = {
      id:        row.id,
      type:      row.type,
      name:      row.name,
      description: row.description,
      age:       row.age,
      gender:    row.gender,
      size:      row.size,
      coat:      row.coat,

      breeds: {
        primary:   row.primary_breed,
        secondary: row.secondary_breed,
        mixed:     row.mixed_flag,
        unknown:   row.unknown_flag
      },

      colors: {
        primary:   row.primary_color,
        secondary: row.secondary_color,
        tertiary:  row.tertiary_color
      },

      attributes: {
        spayed_neutered: row.spayed_neutered,
        house_trained:   row.house_trained,
        declawed:        row.declawed,
        special_needs:   row.special_needs,
        shots_current:   row.shots_current
      },

      environment: {
        children: row.children,
        dogs:     row.dogs,
        cats:     row.cats
      },

      organization_animal_id: row.organization_animal_id,
      status:                row.status,
      status_changed_at:     row.status_changed_at,
      published_at:          row.published_at,

      photos:  photosRes.rows,
      contact: contactRes.rows[0] || {}
    }

    return res.json(animalDetail)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})
