const express = require('express');
const { asyncHandler } = require('../http');

// Fact articles: a list endpoint and a single-article endpoint per category.
function factRoutes({ db }) {
  const router = express.Router();

  for (const { list, article, collection } of [
    { list: '/api/fetchAnimalFacts', article: '/api/fetchAnimalFact', collection: db.animalFact },
    { list: '/api/fetchSpaceFacts', article: '/api/fetchSpaceFact', collection: db.spaceFact },
    { list: '/api/fetchRandomFacts', article: '/api/fetchRandomFact', collection: db.historyFact },
  ]) {
    // The list pages only need the title and image, not every article's facts.
    router.get(list, asyncHandler(async (req, res) => {
      const result = await collection.find({}).project({ factsarr: 0 }).toArray();
      res.status(200).json(result);
    }));

    router.post(article, asyncHandler(async (req, res) => {
      const result = await collection.findOne({ link_name: req.body.link_name });
      res.status(200).json(result);
    }));
  }

  return router;
}

module.exports = { factRoutes };
