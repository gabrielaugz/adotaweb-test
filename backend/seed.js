// seed.js
require('dotenv').config();
const fs   = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// === 1) Pool de conexão usando DATABASE_URL do Render/Heroku/etc.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// === 2) Cria esquema completo se não existir
async function createSchema() {
  await pool.query(`
    -- tipos de animal
    CREATE TABLE IF NOT EXISTS types (
      id   SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );

    -- animais
    CREATE TABLE IF NOT EXISTS animals (
      id                      BIGINT PRIMARY KEY,
      organization_id         TEXT,
      url                     TEXT,
      type_id                 INTEGER      REFERENCES types(id),
      name                    TEXT,
      description             TEXT,
      age                     TEXT,
      gender                  TEXT,
      size                    TEXT,
      coat                    TEXT,
      primary_color           TEXT,
      secondary_color         TEXT,
      tertiary_color          TEXT,
      primary_breed           TEXT,
      secondary_breed         TEXT,
      mixed                   BOOLEAN,
      unknown                 BOOLEAN,
      spayed_neutered         BOOLEAN,
      house_trained           BOOLEAN,
      declawed                BOOLEAN,
      special_needs           BOOLEAN,
      shots_current           BOOLEAN,
      children                BOOLEAN,
      dogs                    BOOLEAN,
      cats                    BOOLEAN,
      organization_animal_id  TEXT,
      status                  TEXT,
      status_changed_at       TIMESTAMP WITH TIME ZONE,
      published_at            TIMESTAMP WITH TIME ZONE,
      tags                    JSONB,
      videos                  JSONB
    );

    -- fotos
    CREATE TABLE IF NOT EXISTS photos (
      id         BIGSERIAL PRIMARY KEY,
      url_small  TEXT,
      url_medium TEXT,
      url_large  TEXT,
      url_full   TEXT,
      slot       INTEGER,
      is_primary BOOLEAN,
      animal_id  BIGINT     REFERENCES animals(id)
    );

    -- endereços
    CREATE TABLE IF NOT EXISTS addresses (
      id        BIGSERIAL PRIMARY KEY,
      address1  TEXT,
      address2  TEXT,
      city      TEXT,
      state     TEXT,
      postcode  TEXT,
      country   TEXT
    );

    -- contatos
    CREATE TABLE IF NOT EXISTS contacts (
      id         BIGSERIAL PRIMARY KEY,
      animal_id  BIGINT REFERENCES animals(id),
      email      TEXT,
      phone      TEXT,
      address_id BIGINT REFERENCES addresses(id)
    );
  `);

  console.log('🔧 Schema criado/atualizado com sucesso');
}

// === 3) Sementes

async function seedTypes() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'types.json');
  const { types } = JSON.parse(await fs.readFile(file, 'utf8'));
  for (const t of types) {
    await pool.query(
      `INSERT INTO types(name) VALUES($1) ON CONFLICT(name) DO NOTHING;`,
      [t.name]
    );
  }
  console.log('✅ types seeded');
}

async function seedAnimals() {
  const file    = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'));

  for (const a of animals) {
    // encontra o type_id
    const { rows } = await pool.query(
      `SELECT id FROM types WHERE name = $1;`,
      [a.type]
    );
    if (rows.length === 0) {
      console.warn(`⚠️  Skip animal id=${a.id}: tipo "${a.type}" não encontrado`);
      continue;
    }
    const type_id = rows[0].id;

    await pool.query(
      `INSERT INTO animals(
         id, organization_id, url, type_id,
         name, description, age, gender, size, coat,
         primary_color, secondary_color, tertiary_color,
         primary_breed, secondary_breed, mixed, unknown,
         spayed_neutered, house_trained, declawed, special_needs, shots_current,
         children, dogs, cats,
         organization_animal_id, status, status_changed_at, published_at,
         tags, videos
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,$9,$10,
         $11,$12,$13,
         $14,$15,$16,$17,
         $18,$19,$20,$21,$22,
         $23,$24,$25,
         $26,$27,$28,
         $29,$30,$31,$32
       ) ON CONFLICT(id) DO NOTHING;`,
      [
        a.id, a.organization_id, a.url, type_id,
        a.name, a.description, a.age, a.gender, a.size, a.coat,
        a.colors.primary, a.colors.secondary, a.colors.tertiary,
        a.breeds.primary, a.breeds.secondary, a.breeds.mixed, a.breeds.unknown,
        a.attributes.spayed_neutered, a.attributes.house_trained,
        a.attributes.declawed, a.attributes.special_needs, a.attributes.shots_current,
        a.environment.children, a.environment.dogs, a.environment.cats,
        a.organization_animal_id, a.status, a.status_changed_at, a.published_at,
        JSON.stringify(a.tags), JSON.stringify(a.videos)
      ]
    );
  }

  console.log('✅ animals seeded');
}

async function seedContacts() {
  const file    = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'));

  for (const a of animals) {
    const addr = a.contact?.address;
    if (!addr?.city) continue;

    // 1) procura endereço
    const { rows: found } = await pool.query(
      `SELECT id FROM addresses
         WHERE address1 = $1
           AND address2 = $2
           AND city     = $3
           AND state    = $4
           AND postcode= $5
           AND country = $6;`,
      [
        addr.address1, addr.address2,
        addr.city, addr.state,
        addr.postcode, addr.country
      ]
    );

    let addressId;
    if (found.length) {
      addressId = found[0].id;
    } else {
      // 2) insere novo
      const { rows: ins } = await pool.query(
        `INSERT INTO addresses(
           address1, address2, city, state, postcode, country
         ) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id;`,
        [
          addr.address1, addr.address2,
          addr.city, addr.state,
          addr.postcode, addr.country
        ]
      );
      addressId = ins[0].id;
    }

    // 3) insere contato se não existir
    await pool.query(
      `INSERT INTO contacts(animal_id, email, phone, address_id)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (animal_id) DO NOTHING;`,
      [a.id, a.contact.email, a.contact.phone, addressId]
    );
  }

  console.log('✅ contacts seeded');
}

// === 4) Main
async function main() {
  try {
    await createSchema();
    await seedTypes();
    await seedAnimals();
    await seedContacts();
    console.log('\n🎉 Seed finalizado com sucesso!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
