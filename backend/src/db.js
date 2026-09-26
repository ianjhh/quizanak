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
    game: database.collection('game'),
    animalFact: database.collection('animalFact'),
    spaceFact: database.collection('spaceFact'),
    historyFact: database.collection('historyFact'),
  };
}

module.exports = { connectDatabase };
