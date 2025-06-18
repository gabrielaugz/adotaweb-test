// seed.js (CommonJS)
require('dotenv').config();
const fs   = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: String(process.env.DB_PASS),
});

async function seedTypes() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'types.json');
  const typesJson = JSON.parse(await fs.readFile(file, 'utf8')).types;
  for (const t of typesJson) {
    await pool.query(
      `INSERT INTO types(name) VALUES($1) ON CONFLICT(name) DO NOTHING`,
      [t.name]
    );
  }
  console.log('✅ types seeded');
}

async function seedAnimals() {
  const file     = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const animals  = JSON.parse(await fs.readFile(file, 'utf8')).animals;

  for (const a of animals) {
    const { rows: typeRows } = await pool.query(
      `SELECT id FROM types WHERE name = $1`,
      [a.type]
    );

    if (typeRows.length === 0) {
      console.warn(`⏭️  Skip animal id=${a.id}: tipo "${a.type}" não cadastrado`);
      continue;
    }

    const type_id = typeRows[0].id;
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
         $29,$30,$31
       ) ON CONFLICT(id) DO NOTHING`,
      [
        a.id, a.organization_id, a.url, type_id,
        a.name, a.description, a.age, a.gender, a.size, a.coat,
        a.colors.primary, a.colors.secondary, a.colors.tertiary,
        a.breeds.primary, a.breeds.secondary, a.breeds.mixed, a.breeds.unknown,
        a.attributes.spayed_neutered, a.attributes.house_trained, a.attributes.declawed,
        a.attributes.special_needs, a.attributes.shots_current,
        a.environment.children, a.environment.dogs, a.environment.cats,
        a.organization_animal_id, a.status, a.status_changed_at, a.published_at,
        JSON.stringify(a.tags), JSON.stringify(a.videos)
      ]
    );
  }
  console.log('✅ animals seeded');
}

async function seedContacts() {
  const file     = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const animals  = JSON.parse(await fs.readFile(file, 'utf8')).animals;

  for (const a of animals) {
    const addr = a.contact?.address;
    if (!addr?.city) continue;

    // 1) tenta achar o endereço existente
    const { rows: foundAddrs } = await pool.query(
      `SELECT id FROM addresses
         WHERE address1 = $1
           AND address2 = $2
           AND city     = $3
           AND state    = $4
           AND postcode = $5
           AND country  = $6`,
      [
        addr.address1,
        addr.address2,
        addr.city,
        addr.state,
        addr.postcode,
        addr.country
      ]
    );

    let addressId;
    if (foundAddrs.length) {
      addressId = foundAddrs[0].id;
    } else {
      // 2) insere novo endereço
      const { rows: ins } = await pool.query(
        `INSERT INTO addresses(
           address1, address2, city, state, postcode, country
         ) VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
          addr.address1,
          addr.address2,
          addr.city,
          addr.state,
          addr.postcode,
          addr.country
        ]
      );
      addressId = ins[0].id;
    }

    // 3) verifica se já existe contato para esse animal
    const { rows: foundContacts } = await pool.query(
      `SELECT id FROM contacts WHERE animal_id = $1`,
      [a.id]
    );
    if (foundContacts.length) continue;

    // 4) insere o contato
    await pool.query(
      `INSERT INTO contacts(
         animal_id, email, phone, address_id
       ) VALUES ($1,$2,$3,$4)`,
      [a.id, a.contact.email, a.contact.phone, addressId]
    );
  }

  console.log('✅ contacts seeded');
}

async function main() {
  try {
    await seedTypes();
    await seedAnimals();
    await seedContacts();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
