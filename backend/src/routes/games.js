const express = require('express');

function gameRoutes({ db }) {
  const router = express.Router();
  const { game } = db;

  router.get('/api/fetchAllGames', async (req, res) => {
    try {
      let result = await game.find({}).toArray();
      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  router.post('/api/fetchGame', async (req, res) => {
    try {
      let result = await game.findOne({ name: req.body.gameName });
      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  return router;
}

module.exports = { gameRoutes };
