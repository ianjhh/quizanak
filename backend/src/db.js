const { MongoClient } = require('mongodb');

// Creates the MongoDB client (it connects on first use) and returns the
// collections the API works with.
function connectDatabase(uri) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  const database = client.db('imgupload');

  return {
    client,
    credentials: database.collection('credentials'),
    quiz: database.collection('quiz'),
    animalFact: database.collection('animalFact'),
    spaceFact: database.collection('spaceFact'),
    historyFact: database.collection('historyFact'),
  };
}

// Usernames and emails must be unique. The sign-up route checks first, and
// these indexes also stop two simultaneous sign-ups from both succeeding.
async function ensureIndexes({ credentials }) {
  for (const field of ['username', 'email']) {
    try {
      await credentials.createIndex({ [field]: 1 }, { unique: true });
    } catch (err) {
      console.error(`Could not create a unique index on credentials.${field} (are there duplicates?):`, err.message);
    }
  }
}

module.exports = { connectDatabase, ensureIndexes };
