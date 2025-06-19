// seed.js
require('dotenv').config();
const fs   = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedOrganizationCredentials() {
  console.log('🔐 Seeding organization credentials...');
  // 1) busca id e cnpj de todas as ONGs sem hash ainda
  const { rows: orgs } = await pool.query(
    `SELECT id, cnpj FROM organizations WHERE password_hash IS NULL`
  );

  for (const { id, cnpj } of orgs) {
    // 2) limpa formato, deixando só dígitos
    const plain = cnpj.replace(/\D/g, '');
    // 3) gera o hash (cost = 10)
    const hash = await bcrypt.hash(plain, 10);
    // 4) atualiza registro
    await pool.query(
      `UPDATE organizations
         SET password_hash = $1,
             created_at    = NOW()
       WHERE id = $2`,
      [hash, id]
    );
    console.log(` ONG ${id}: hash gerado de "${plain}"`);
  }

  console.log('✅ Organization credentials seeded');
}

async function seedAnimals() {
  console.log('🦴 Seeding animals...');
  const file = path.join(__dirname, 'src', 'mocks', 'data', 'animals.json');
  const { animals } = JSON.parse(await fs.readFile(file, 'utf8'));

  const allowed = ['Cat','Dog'];
  for (const a of animals) {
    if (!allowed.includes(a.type)) {
      console.warn(`⏭️ Skip tipo inválido: ${a.type} (id=${a.id})`);
      continue;
    }

    // 1) encontre o pk da ONG pelo CNPJ que está em a.organization_id
    const { rows: orgRows } = await pool.query(
      `SELECT id FROM organizations WHERE cnpj = $1`,
      [a.organization_id]
    );
    if (!orgRows.length) {
      console.warn(`⚠️ ONG não encontrada para CNPJ=${a.organization_id} (animal ${a.id})`);
      continue;
    }
    const orgFk = orgRows[0].id;

    // 2) insira o animal já apontando para organization_fk
    await pool.query(
      `INSERT INTO animals(
         id,
         organization_fk,
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
       ON CONFLICT (id) DO NOTHING`,
      [
        a.id,
        orgFk,
        a.url,
        a.type,
        a.name,
        a.description,
        a.age,
        a.gender,
        a.size,
        a.colors.primary,
        a.colors.secondary,
        a.colors.tertiary,
        a.breeds.breed,
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

  console.log('✅ Animals seeded');
}

async function main() {
  try {
    await seedOrganizationCredentials();
    await seedAnimals();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
