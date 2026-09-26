// Loads the starter quizzes and fact articles from seedData.js into MongoDB.
// Documents are matched by name/link_name and replaced, so running it again is
// safe and never touches other content or user accounts.
//
// Usage (from backend/): npm run seed
const { quizzes, animalFacts, spaceFacts, historyFacts } = require('./seedData');

async function upsertAll(collection, docs, key) {
  for (const doc of docs) {
    await collection.replaceOne({ [key]: doc[key] }, doc, { upsert: true });
  }
  return docs.length;
}

async function seedDatabase(db) {
  return {
    quizzes: await upsertAll(db.quiz, quizzes, 'name'),
    animalFacts: await upsertAll(db.animalFact, animalFacts, 'link_name'),
    spaceFacts: await upsertAll(db.spaceFact, spaceFacts, 'link_name'),
    historyFacts: await upsertAll(db.historyFact, historyFacts, 'link_name'),
  };
}

async function main() {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv is optional when the variables are already set
  }
  const { connectDatabase, ensureIndexes } = require('../src/db');
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.');
  }

  const db = connectDatabase(process.env.MONGODB_URI);
  try {
    await ensureIndexes(db);
    const counts = await seedDatabase(db);
    console.log('Seeded:', Object.entries(counts).map(([name, count]) => `${count} ${name}`).join(', '));
  } finally {
    await db.client.close();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}

module.exports = { seedDatabase };
