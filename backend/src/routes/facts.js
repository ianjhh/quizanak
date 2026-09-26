const express = require('express');

// Fact articles: a list endpoint and a single-article endpoint per category.
function factRoutes({ db }) {
  const router = express.Router();
  const { animalFact, spaceFact, historyFact } = db;

  router.get('/api/fetchAnimalFacts', async (req, res) => {
    try {
      let result = await animalFact.find({}).project({ factsarr: 0 }).toArray();
      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  router.get('/api/fetchSpaceFacts', async (req, res) => {
    try {
      let result = await spaceFact.find({}, { factsarr: 0 }).toArray();
      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  router.get('/api/fetchRandomFacts', async (req, res) => {
    try {
      let result = await historyFact.find({}, { factsarr: 0 }).toArray();
      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  for (const [path, collection] of [
    ['/api/fetchAnimalFact', animalFact],
    ['/api/fetchSpaceFact', spaceFact],
    ['/api/fetchRandomFact', historyFact],
  ]) {
    router.post(path, async (req, res) => {
      try {
        let result = await collection.findOne({ link_name: req.body.link_name });
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400).send('Error!');
      }
    });
  }

  return router;
}

module.exports = { factRoutes };
