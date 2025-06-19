// seed.js
require('dotenv').config();
const fs   = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedAnimals() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'));

  // só vamos semear Cat e Dog
  const allowed = ['Cat','Dog'];

  for (const a of animals) {
    if (!allowed.includes(a.type)) {
      console.warn(`⏭️ Skip tipo inválido: ${a.type} (id=${a.id})`);
      continue;
    }
    // agora usamos diretmente a.string enum em animals.type
    await pool.query(
      `INSERT INTO animals(
         id,
         organization_id,
         url,
         type,
         name,
         description,
         age,
         gender,
         size,
         primary_color,
         secondary_color,
         tertiary_color,
         breed,
         spayed_neutered,
         shots_current,
         children,
         dogs,
         cats,
         organization_animal_id,
         status,
         status_changed_at,
         published_at
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,$9,
         $10,$11,$12,
         $13,$14,$15,$16,
         $17,$18,$19,
         $20,$21,$22
       )
       ON CONFLICT(id) DO NOTHING`,
      [
        a.id,
        a.organization_id,
        a.url,
        a.type,                     // antes usávamos type_id/tables types
        a.name,
        a.description,
        a.age,
        a.gender,
        a.size,
        a.colors.primary,
        a.colors.secondary,
        a.colors.tertiary,
        a.breeds.breed,             // booleano breed
        a.attributes.spayed_neutered,
        a.attributes.shots_current,
        a.environment.children,
        a.environment.dogs,
        a.environment.cats,
        a.organization_animal_id,
        a.status,
        a.status_changed_at,
        a.published_at
      ]
    );
  }

  console.log('✅ animals seeded');
}

async function seedContacts() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'));

  for (const a of animals) {
    // só insere contato se o animal existir
    const { rows: exists } = await pool.query(
      `SELECT 1 FROM animals WHERE id = $1`,
      [a.id]
    );
    if (!exists.length) continue;

    const addr = a.contact?.address;
    if (!addr?.city) continue;

    // busca ou cria endereço
    const { rows: found } = await pool.query(
      `SELECT id FROM addresses WHERE city = $1 AND state = $2`,
      [addr.city, addr.state]
    );
    let addressId;
    if (found.length) {
      addressId = found[0].id;
    } else {
      const { rows: ins } = await pool.query(
        `INSERT INTO addresses(city, state)
           VALUES ($1,$2)
         RETURNING id`,
        [addr.city, addr.state]
      );
      addressId = ins[0].id;
    }

    // insere o contato
    await pool.query(
      `INSERT INTO contacts(animal_id, email, phone, address_id)
         VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING`,
      [a.id, a.contact.email, a.contact.phone, addressId]
    );
  }

  console.log('✅ contacts seeded');
}

async function main() {
  try {
    await seedAnimals();
    await seedContacts();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
