const express = require('express');
const { asyncHandler } = require('../http');

// How many recent quiz scores each user keeps.
const HISTORY_LENGTH = 10;

// Quiz catalogue, quiz questions, grading and the per-user score history.
function quizRoutes({ db, sessions }) {
  const router = express.Router();
  const { quiz, credentials } = db;

  router.post('/api/fetchSimilarQuiz', asyncHandler(async (req, res) => {
    const result = await quiz.find({ category: req.body.category, name: { $nin: [req.body.quizName] } }, { projection: { _id: 0, title: 1, quizImage: 1, name: 1 } }).toArray();
    res.status(200).json(result);
  }));

  router.post('/api/fetchQuiz', asyncHandler(async (req, res) => {
    const result = await quiz.findOne({ name: req.body.name });

    /* Never ship answers to the browser. Grading happens in /api/checkAnswer
       and /api/submitQuiz so the client cannot read or fabricate a result. */
    if (result && Array.isArray(result.array)) {
      result.array = result.array.map(({ answer, ...question }) => question);
    }

    res.status(200).json(result);
  }));

  /* Grades a single question so the UI can still show instant feedback.
     Only reveals the answer to the question the user just submitted. */
  router.post('/api/checkAnswer', asyncHandler(async (req, res) => {
    const found = await quiz.findOne({ name: req.body.name }, { projection: { array: 1 } });
    if (!found) {
      return res.status(404).send('Not found!');
    }

    const question = (found.array || []).find((item) => item.question === req.body.question);
    if (!question) {
      return res.status(404).send('Question not found!');
    }

    res.status(200).json({ correct: question.answer === req.body.answer, answer: question.answer });
  }));

  /* Scores the whole attempt server-side and records it against the user named in
     the JWT, so neither the score nor the account can be supplied by the client. */
  router.post('/api/submitQuiz', asyncHandler(async (req, res) => {
    const session = sessions.read(req);
    if (!session) {
      return res.status(401).send('Silakan login terlebih dahulu.');
    }

    const found = await quiz.findOne({ name: req.body.name }, { projection: { array: 1 } });
    if (!found) {
      return res.status(404).send('Not found!');
    }

    const key = new Map((found.array || []).map((item) => [item.question, item.answer]));
    const submitted = Array.isArray(req.body.answers) ? req.body.answers : [];

    /* one point per question, and each question counts only once */
    const seen = new Set();
    let score = 0;
    for (const item of submitted) {
      if (!item || !key.has(item.question) || seen.has(item.question)) continue;
      seen.add(item.question);
      if (key.get(item.question) === item.answer) score++;
    }

    // A negative $slice keeps the most recent entries; the old positive one kept
    // the first ten forever, so history stopped updating after ten quizzes.
    await credentials.updateOne({ username: session.username }, {
      $push: {
        history: {
          $each: [[req.body.name, score]],
          $slice: -HISTORY_LENGTH,
        },
      },
    });

    // The total is the number of questions answered: quizzes can hold more
    // questions than one attempt asks.
    res.status(200).json({ score, total: seen.size });
  }));

  for (const [path, category] of [
    ['/api/fetchAnimalQuiz', 'animal'],
    ['/api/fetchMathQuiz', 'math'],
    ['/api/fetchMiscellaneousQuiz', 'miscellaneous'],
    ['/api/fetchLanguageQuiz', 'language'],
  ]) {
    router.get(path, asyncHandler(async (req, res) => {
      const result = await quiz.find({ category }).toArray();
      res.status(200).json(result);
    }));
  }

  // The signed-in user's recent scores, oldest first. The username used to come
  // from the request body, so anyone could read anyone's history.
  router.post('/api/fetchHistory', asyncHandler(async (req, res) => {
    const session = sessions.read(req);
    if (!session) {
      return res.status(401).send('Silakan login terlebih dahulu.');
    }
    const user = await credentials.findOne({ username: session.username }, { projection: { _id: 0, history: 1 } });
    res.status(200).json((user && user.history) || []);
  }));

  return router;
}

module.exports = { quizRoutes };
