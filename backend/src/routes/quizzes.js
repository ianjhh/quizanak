const express = require('express');
const jwt = require('jsonwebtoken');

// Quiz catalogue, quiz questions, grading and the per-user score history.
function quizRoutes({ config, db }) {
  const router = express.Router();
  const { quiz, credentials } = db;
  const { jwtSecret } = config;

  router.post('/api/fetchSimilarQuiz', async (req, res) => {
    try {
      let result = await quiz.find({ category: req.body.category, name: { $nin: [req.body.quizName] } }, { projection: { _id: 0, title: 1, quizImage: 1, name: 1 } }).toArray();
      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  router.post('/api/fetchQuiz', async (req, res) => {
    try {
      let result = await quiz.findOne({ name: req.body.name });

      /* Never ship answers to the browser. Grading happens in /api/checkAnswer
         and /api/submitQuiz so the client cannot read or fabricate a result. */
      if (result && Array.isArray(result.array)) {
        result.array = result.array.map(({ answer, ...question }) => question);
      }

      res.status(200).json(result);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  /* Grades a single question so the UI can still show instant feedback.
     Only reveals the answer to the question the user just submitted. */
  router.post('/api/checkAnswer', async (req, res) => {
    try {
      let found = await quiz.findOne({ name: req.body.name }, { projection: { array: 1 } });
      if (!found) {
        return res.status(404).send('Not found!');
      }

      let question = (found.array || []).find((item) => item.question === req.body.question);
      if (!question) {
        return res.status(404).send('Question not found!');
      }

      res.status(200).json({ correct: question.answer === req.body.answer, answer: question.answer });
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  /* Scores the whole attempt server-side and records it against the user named in
     the JWT, so neither the score nor the account can be supplied by the client. */
  router.post('/api/submitQuiz', async (req, res) => {
    if (!req.cookies.jwt) {
      return res.status(403).send('Not authorized!');
    }

    jwt.verify(req.cookies.jwt, jwtSecret, async (err, authorizedData) => {
      if (err) {
        return res.status(403).send('Not authorized!');
      }

      try {
        let found = await quiz.findOne({ name: req.body.name }, { projection: { array: 1 } });
        if (!found) {
          return res.status(404).send('Not found!');
        }

        let key = new Map((found.array || []).map((item) => [item.question, item.answer]));
        let submitted = Array.isArray(req.body.answers) ? req.body.answers : [];

        /* one point per question, and each question counts only once */
        let seen = new Set();
        let score = 0;
        for (const item of submitted) {
          if (seen.has(item.question)) continue;
          seen.add(item.question);
          if (key.get(item.question) === item.answer) score++;
        }

        await credentials.updateOne({ username: authorizedData.username },
          {
            $push: {
              history: {
                $each: [[req.body.name, score]],
                $slice: 10,
              },
            },
          });

        res.status(200).json({ score: score, total: key.size });
      } catch (e) {
        console.log(e);
        res.status(400).send('Error!');
      }
    });
  });

  for (const [path, category] of [
    ['/api/fetchAnimalQuiz', 'animal'],
    ['/api/fetchMathQuiz', 'math'],
    ['/api/fetchMiscellaneousQuiz', 'miscellaneous'],
    ['/api/fetchLanguageQuiz', 'language'],
  ]) {
    router.get(path, async (req, res) => {
      try {
        let result = await quiz.find({ category }).toArray();
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400).send('Error!');
      }
    });
  }

  router.post('/api/fetchHistory', async (req, res) => {
    try {
      let result = await credentials.findOne({ username: req.body.username }, { history: 1, _id: 0 });
      res.status(200).json(result.history);
    } catch (e) {
      console.log(e);
      res.status(400).send('Error!');
    }
  });

  return router;
}

module.exports = { quizRoutes };
