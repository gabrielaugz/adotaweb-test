// server.js
require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

const app = express()

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const port = process.env.PORT || process.env.API_PORT || 3001;
app.listen(port, () => {
  console.log(`🐶 API rodando na porta ${port}`);
});

/**
 * GET /api/animals
 * Lista animais (com filtros de type, city, vaccinated, neutered, mixed, puppy)
 */
app.get('/api/animals/:id', async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT
       a.id,
       t.name      AS type,
       a.name,
       a.description,
       a.age,
       a.gender,
       a.size,
       a.coat,
       a.primary_color,
       a.secondary_color,
       a.tertiary_color,
       /* faltava isso: */
       a.primary_breed,
       a.secondary_breed,
       a.mixed       AS mixed_flag,
       a.unknown     AS unknown_flag,
       a.spayed_neutered,
       a.house_trained,
       a.declawed,
       a.special_needs,
       a.shots_current,
       a.children,
       a.dogs,
       a.cats,
       a.organization_animal_id,
       a.status,
       a.status_changed_at,
       a.published_at
     FROM animals a
     JOIN types t ON a.type_id = t.id
     WHERE a.id = $1
     LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return res.status(404).json({ error: 'Pet não encontrado' });

  const photosRes  = await pool.query(/* ... */);
  const contactRes = await pool.query(/* ... */);

  const animalDetail = {
    id:   row.id,
    type: row.type,
    name: row.name,
    description: row.description,
    age:    row.age,
    gender: row.gender,
    size:   row.size,
    coat:   row.coat,

    /* aqui montamos o objeto breeds que o front espera: */
    breeds: {
      primary:   row.primary_breed,
      secondary: row.secondary_breed,
      mixed:     row.mixed_flag,
      unknown:   row.unknown_flag
    },

    /* e o objeto colors continua igual: */
    colors: {
      primary:   row.primary_color,
      secondary: row.secondary_color,
      tertiary:  row.tertiary_color
    },

    /* os atributos extras: */
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
  };

  return res.json(animalDetail);
});

/**
 * GET /api/types
 * Lista os tipos (Cat, Dog, etc.)
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
 * Detalhes de um animal
 */
app.get('/api/animals/:id', async (req, res) => {
  const { id } = req.params

  try {
    // 1) dados básicos + tipo
    const { rows } = await pool.query(
      `SELECT
         a.id,
         t.name   AS type,
         a.name,
         a.description,
         a.age,
         a.gender,
         a.size,
         a.coat,
         a.primary_color,
         a.secondary_color,
         a.tertiary_color,
         a.mixed,
         a.spayed_neutered,
         a.shots_current,
         a.children,
         a.dogs,
         a.cats,
         a.status,
         a.published_at
       FROM animals a
       JOIN types t ON a.type_id = t.id
       WHERE a.id = $1
       LIMIT 1`,
      [id]
    )

    const row = rows[0]
    if (!row) {
      return res.status(404).json({ error: 'Pet não encontrado' })
    }

    // 2) fotos
    const photosRes = await pool.query(
      `SELECT url_small AS small,
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

    // 4) monta o objeto final
    const animalDetail = {
      id:            row.id,
      type:          row.type,
      name:          row.name,
      description:   row.description,
      age:           row.age,
      gender:        row.gender,
      size:          row.size,
      coat:          row.coat,
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
      status:        row.status,
      published_at:  row.published_at,
      photos:        photosRes.rows,
      contact:       contactRes.rows[0] || {}
    }

    return res.json(animalDetail)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
})
