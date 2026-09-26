const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { seedDatabase } = require('../scripts/seed');
const { quizzes, animalFacts, spaceFacts, historyFacts } = require('../scripts/seedData');
const { createMemoryDb } = require('./support/memoryDb');
const { startTestServer } = require('./support/testServer');

const imagesDir = path.join(__dirname, '..', '..', 'src', 'assets', 'images');
const imageExists = (name) => fs.existsSync(path.join(imagesDir, `${name}.jpg`));

describe('seed data', () => {
  test('every quiz has 10 questions whose answer is one of 4 distinct options', () => {
    for (const quiz of quizzes) {
      assert.equal(quiz.array.length, 10, quiz.name);
      for (const { question, options, answer } of quiz.array) {
        assert.equal(options.length, 4, question);
        assert.equal(new Set(options).size, 4, question);
        assert.ok(options.includes(answer), question);
      }
      assert.ok(['animal', 'math', 'language', 'miscellaneous'].includes(quiz.category), quiz.name);
    }
    assert.equal(new Set(quizzes.map((q) => q.name)).size, quizzes.length, 'quiz names are unique');
  });

  test('every referenced image exists in the frontend', () => {
    const images = [
      ...quizzes.map((q) => q.quizImage),
      ...[...animalFacts, ...spaceFacts, ...historyFacts].flatMap((a) => [a.image, ...a.factsarr.map(([, image]) => image).filter(Boolean)]),
    ];
    const missing = images.filter((name) => !imageExists(name));
    assert.deepEqual(missing, []);
  });

  test('seeding twice leaves one copy of each document and keeps other content', async () => {
    const db = createMemoryDb({ quiz: [{ name: 'kuis-lama', title: 'Kuis Lama', category: 'math', array: [] }] });
    await seedDatabase(db);
    const counts = await seedDatabase(db);
    assert.equal(counts.quizzes, quizzes.length);
    assert.equal(await db.quiz.countDocuments({}), quizzes.length + 1);
    assert.equal(await db.animalFact.countDocuments({}), animalFacts.length);
  });

  test('the seeded content works through the API', async () => {
    const db = createMemoryDb();
    await seedDatabase(db);
    const api = await startTestServer({ db });
    try {
      for (const endpoint of ['/api/fetchAnimalQuiz', '/api/fetchMathQuiz', '/api/fetchLanguageQuiz', '/api/fetchMiscellaneousQuiz']) {
        const res = await api.request('GET', endpoint);
        assert.ok(res.data.length > 0, endpoint);
      }
      const quiz = await api.request('POST', '/api/fetchQuiz', { body: { name: 'penjumlahan' } });
      const first = quiz.data.array[0];
      const graded = await api.request('POST', '/api/checkAnswer', { body: { name: 'penjumlahan', question: first.question, answer: '5' } });
      assert.equal(graded.data.answer, '5');
    } finally {
      await api.close();
    }
  });
});
