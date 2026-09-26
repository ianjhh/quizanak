const express = require('express');
const { asyncHandler } = require('../http');

// Fact articles: a list endpoint and a single-article endpoint per category.
function factRoutes({ db }) {
  const router = express.Router();
  const { animalFact, spaceFact, historyFact } = db;

  router.get('/api/fetchAnimalFacts', asyncHandler(async (req, res) => {
    const result = await animalFact.find({}).project({ factsarr: 0 }).toArray();
    res.status(200).json(result);
  }));

  router.get('/api/fetchSpaceFacts', asyncHandler(async (req, res) => {
    const result = await spaceFact.find({}, { factsarr: 0 }).toArray();
    res.status(200).json(result);
  }));

  router.get('/api/fetchRandomFacts', asyncHandler(async (req, res) => {
    const result = await historyFact.find({}, { factsarr: 0 }).toArray();
    res.status(200).json(result);
  }));

  for (const [path, collection] of [
    ['/api/fetchAnimalFact', animalFact],
    ['/api/fetchSpaceFact', spaceFact],
    ['/api/fetchRandomFact', historyFact],
  ]) {
    router.post(path, asyncHandler(async (req, res) => {
      const result = await collection.findOne({ link_name: req.body.link_name });
      res.status(200).json(result);
    }));
  }

  return router;
}

module.exports = { factRoutes };
