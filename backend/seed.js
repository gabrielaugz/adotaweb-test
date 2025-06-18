// seed.js (CommonJS)
require('dotenv').config()
const fs   = require('fs').promises
const path = require('path')
const { Pool } = require('pg')

// Cria pool usando DATABASE_URL do Render/Heroku etc.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function seedTypes() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'types.json')
  const { types } = JSON.parse(await fs.readFile(file, 'utf8'))
  for (const t of types) {
    await pool.query(
      `INSERT INTO types(name)
         VALUES ($1)
       ON CONFLICT(name) DO NOTHING`,
      [t.name]
    )
  }
  console.log('✅ types seeded')
}

async function seedAnimals() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json')
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'))
  for (const a of animals) {
    // 1) pega o type_id
    const { rows: typeRows } = await pool.query(
      `SELECT id FROM types WHERE name = $1`,
      [a.type]
    )
    if (!typeRows.length) {
      console.warn(`⏭️ Skip animal id=${a.id}: tipo "${a.type}" não cadastrado`)
      continue
    }
    const type_id = typeRows[0].id

    // 2) insere o animal com TODOS os campos
    await pool.query(
      `INSERT INTO animals(
         id,
         organization_id,
         url,
         type_id,
         name,
         description,
         age,
         gender,
         size,
         coat,
         primary_color,
         secondary_color,
         tertiary_color,
         primary_breed,
         secondary_breed,
         mixed,
         unknown,
         spayed_neutered,
         house_trained,
         declawed,
         special_needs,
         shots_current,
         children,
         dogs,
         cats,
         organization_animal_id,
         status,
         status_changed_at,
         published_at,
         tags,
         videos
       ) VALUES (
         $1,$2,$3,$4,
         $5,$6,$7,$8,$9,$10,
         $11,$12,$13,
         $14,$15,$16,$17,
         $18,$19,$20,$21,$22,
         $23,$24,$25,
         $26,$27,$28,
         $29,$30
       )
       ON CONFLICT(id) DO NOTHING`,
      [
        a.id,
        a.organization_id,
        a.url,
        type_id,
        a.name,
        a.description,
        a.age,
        a.gender,
        a.size,
        a.coat,
        a.colors.primary,
        a.colors.secondary,
        a.colors.tertiary,
        a.breeds.primary,
        a.breeds.secondary,
        a.breeds.mixed,
        a.breeds.unknown,
        a.attributes.spayed_neutered,
        a.attributes.house_trained,
        a.attributes.declawed,
        a.attributes.special_needs,
        a.attributes.shots_current,
        a.environment.children,
        a.environment.dogs,
        a.environment.cats,
        a.organization_animal_id,
        a.status,
        a.status_changed_at,
        a.published_at,
        JSON.stringify(a.tags || []),
        JSON.stringify(a.videos || [])
      ]
    )
  }
  console.log('✅ animals seeded')
}

async function seedContacts() {
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json')
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'))
  for (const a of animals) {
    // só insere contato se o animal já existe
    const { rows: exists } = await pool.query(
      `SELECT 1 FROM animals WHERE id = $1`,
      [a.id]
    )
    if (!exists.length) continue

    const addr = a.contact?.address
    if (!addr?.city) continue

    // 1) acha ou insere endereço
    const { rows: foundAddrs } = await pool.query(
      `SELECT id FROM addresses
         WHERE city = $1 AND state = $2`,
      [addr.city, addr.state]
    )
    let addressId
    if (foundAddrs.length) {
      addressId = foundAddrs[0].id
    } else {
      const { rows: ins } = await pool.query(
        `INSERT INTO addresses(city, state)
           VALUES ($1,$2)
         RETURNING id`,
        [addr.city, addr.state]
      )
      addressId = ins[0].id
    }

    // 2) insere contato (uma única vez por animal)
    await pool.query(
      `INSERT INTO contacts(animal_id, email, phone, address_id)
         VALUES ($1,$2,$3,$4)
       ON CONFLICT(animal_id) DO NOTHING`,
      [a.id, a.contact.email, a.contact.phone, addressId]
    )
  }
  console.log('✅ contacts seeded')
}

async function main() {
  try {
    await seedTypes()
    await seedAnimals()
    await seedContacts()
  } catch (err) {
    console.error(err)
  } finally {
    await pool.end()
  }
}

main()
