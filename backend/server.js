// server.js
require('dotenv').config();
const path    = require('path');
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'frontend', 'build');
  app.use(express.static(buildPath));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

/**
 * GET /api/animals
 * List with filters: type, city, vaccinated, neutered, breed, puppy
 */
app.get('/api/animals', async (req, res) => {
  const {
    type    = '',
    city    = '',
    vaccinated = '',
    neutered   = '',
    breed      = '',
    puppy      = ''
  } = req.query;

  const sql = `
    SELECT
      a.id,
      a.type,
      a.name,
      a.age,
      a.gender,
      a.size,
      a.primary_color,
      COALESCE(p.url_medium, a.url) AS "photoUrl",
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
      SELECT url_medium
      FROM photos p2
      WHERE p2.animal_id = a.id AND p2.is_primary
      LIMIT 1
    ) p ON true
    LEFT JOIN organizations org
      ON org.id = a.organization_fk
    WHERE
      ($1 = '' OR a.type::text = $1)
      AND ($2 = '' OR org.city ILIKE '%'||$2||'%')
      AND ( $3 = '' OR ( $3 = 'true' AND a.shots_current = TRUE ) OR ( $3 = 'false' AND a.shots_current = FALSE ) )
      AND ( $4 = '' OR ( $4 = 'true' AND a.spayed_neutered = TRUE ) OR ( $4 = 'false' AND a.spayed_neutered = FALSE ) )
      AND ( $5 = '' OR ( $5 = 'true' AND a.breed = TRUE ) OR ( $5 = 'false' AND a.breed = FALSE ) )
      AND ( $6 = '' OR ( $6 = 'true' AND a.age = 'Baby' ) OR ( $6 = 'false' AND a.age <> 'Baby' ) )
    LIMIT 100
  `;

  try {
    const vals = [type, city, vaccinated, neutered, breed, puppy];
    const { rows } = await pool.query(sql, vals);

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
          city:      r.org_city || 'Não informado',
          state:     r.org_state || '',
          postcode:  r.org_postcode,
          country:   r.org_country
        }
      }
    }));

    return res.json({ animals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/animals/:id
 * Detailed info for one animal
 */
app.get('/api/animals/:id', async (req, res) => {
  const { id } = req.params;

  try {
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
        a.breed      AS breed_flag,
        a.spayed_neutered,
        a.shots_current,
        a.children,
        a.dogs,
        a.cats,
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
    `;
    const { rows } = await pool.query(detailSql, [id]);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Pet não encontrado' });

    const photosRes = await pool.query(
      `SELECT url_small AS small, url_medium AS medium, url_large AS large, url_full AS full
         FROM photos
        WHERE animal_id = $1
        ORDER BY slot`,
      [id]
    );

    const animalDetail = {
      id:        row.id,
      type:      row.type,
      name:      row.name,
      description: row.description,
      age:       row.age,
      gender:    row.gender,
      size:      row.size,
      breeds: {
        breed: row.breed_flag
      },
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
      organization_animal_id: row.organization_animal_id,
      status:                row.status,
      status_changed_at:     row.status_changed_at,
      published_at:          row.published_at,
      photos:                photosRes.rows,
      contact: {
        email:   row.org_email,
        phone:   row.org_phone,
        address: {
          address1: row.org_address1,
          address2: row.org_address2,
          city:      row.org_city  || 'Não informado',
          state:     row.org_state || '',
          postcode:  row.org_postcode,
          country:   row.org_country
        }
      }
    };

    return res.json(animalDetail);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
const port = process.env.PORT || process.env.API_PORT || 3001;
app.listen(port, () => {
  console.log(`🐶 API rodando na porta ${port}`);
});
