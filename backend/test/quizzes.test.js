const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { startTestServer } = require('./support/testServer');
const { createMemoryDb } = require('./support/memoryDb');

const quizzes = [
  {
    name: 'binatang-laut',
    title: 'Binatang Laut',
    description: 'Kenali hewan laut',
    category: 'animal',
    quizImage: 'binatang-laut1',
    array: [
      { question: 'Hewan apa yang bernapas dengan insang?', options: ['Ikan', 'Kucing'], answer: 'Ikan' },
      { question: 'Mamalia laut terbesar?', options: ['Paus biru', 'Hiu'], answer: 'Paus biru' },
    ],
  },
  {
    name: 'burung',
    title: 'Burung',
    description: 'Kenali burung',
    category: 'animal',
    quizImage: 'burung1',
    array: [{ question: 'Burung apa yang tidak bisa terbang?', options: ['Penguin', 'Elang'], answer: 'Penguin' }],
  },
  {
    name: 'penjumlahan',
    title: 'Penjumlahan',
    description: 'Tambah-tambahan',
    category: 'math',
    quizImage: 'angka',
    array: [{ question: '2 + 3 = ?', options: ['5', '6'], answer: '5' }],
  },
];

describe('quiz endpoints', () => {
  let api;

  before(async () => {
    api = await startTestServer({ db: createMemoryDb({ quiz: quizzes }) });
  });

  after(() => api.close());

  test('lists quizzes by category', async () => {
    const animal = await api.request('GET', '/api/fetchAnimalQuiz');
    assert.equal(animal.status, 200);
    assert.deepEqual(animal.data.map((q) => q.name), ['binatang-laut', 'burung']);

    const math = await api.request('GET', '/api/fetchMathQuiz');
    assert.deepEqual(math.data.map((q) => q.name), ['penjumlahan']);
  });

  test('quiz lists carry only card fields, not the questions and answers', async () => {
    const res = await api.request('GET', '/api/fetchAnimalQuiz');
    assert.deepEqual(res.data[0], {
      name: 'binatang-laut',
      title: 'Binatang Laut',
      description: 'Kenali hewan laut',
      quizImage: 'binatang-laut1',
      category: 'animal',
    });
  });

  test('sends quiz questions without their answers', async () => {
    const res = await api.request('POST', '/api/fetchQuiz', { body: { name: 'binatang-laut' } });
    assert.equal(res.status, 200);
    assert.equal(res.data.title, 'Binatang Laut');
    assert.equal(res.data.array.length, 2);
    for (const question of res.data.array) {
      assert.equal(question.answer, undefined);
      assert.ok(question.options.length > 0);
    }
  });

  test('grades a single answer', async () => {
    const question = 'Hewan apa yang bernapas dengan insang?';
    const right = await api.request('POST', '/api/checkAnswer', { body: { name: 'binatang-laut', question, answer: 'Ikan' } });
    assert.deepEqual(right.data, { correct: true, answer: 'Ikan' });

    const wrong = await api.request('POST', '/api/checkAnswer', { body: { name: 'binatang-laut', question, answer: 'Kucing' } });
    assert.deepEqual(wrong.data, { correct: false, answer: 'Ikan' });

    const missing = await api.request('POST', '/api/checkAnswer', { body: { name: 'binatang-laut', question: 'nope', answer: 'x' } });
    assert.equal(missing.status, 404);
  });

  test('tells picture questions with the same text apart by their picture', async () => {
    await api.db.quiz.insertOne({
      name: 'ikan-tebak',
      title: 'Ikan',
      category: 'picture-test',
      array: [
        { question: 'Ikan apa ini?', imagesrc: 'ikan1', options: ['cupang', 'lele'], answer: 'cupang' },
        { question: 'Ikan apa ini?', imagesrc: 'ikan2', options: ['cupang', 'lele'], answer: 'lele' },
      ],
    });
    const check = (imagesrc, answer) => api.request('POST', '/api/checkAnswer',
      { body: { name: 'ikan-tebak', question: 'Ikan apa ini?', imagesrc, answer } });
    assert.deepEqual((await check('ikan2', 'lele')).data, { correct: true, answer: 'lele' });
    assert.deepEqual((await check('ikan1', 'lele')).data, { correct: false, answer: 'cupang' });

    const hash = bcrypt.hashSync('rahasia123', 4);
    await api.db.credentials.insertOne({ username: 'tari', email: 'tari@example.com', password: hash, verified: true, history: [] });
    const login = await api.request('POST', '/api/login', { body: { username: 'tari', password: 'rahasia123' } });
    const res = await api.request('POST', '/api/submitQuiz', {
      headers: { Authorization: `Bearer ${login.data.token}` },
      body: { name: 'ikan-tebak', answers: [
        { question: 'Ikan apa ini?', imagesrc: 'ikan1', answer: 'cupang' },
        { question: 'Ikan apa ini?', imagesrc: 'ikan2', answer: 'lele' },
      ] },
    });
    assert.deepEqual(res.data, { score: 2, total: 2 });
  });

  describe('scores and history', () => {
    const q1 = 'Hewan apa yang bernapas dengan insang?';
    const q2 = 'Mamalia laut terbesar?';
    let budi;
    let sari;

    const login = async (username) => {
      const res = await api.request('POST', '/api/login', { body: { username, password: 'rahasia123' } });
      return { Authorization: `Bearer ${res.data.token}` };
    };
    const submit = (auth, answers) => api.request('POST', '/api/submitQuiz', { headers: auth, body: { name: 'binatang-laut', answers } });

    before(async () => {
      const hash = bcrypt.hashSync('rahasia123', 4);
      await api.db.credentials.insertOne({ username: 'budi', email: 'budi@example.com', password: hash, verified: true, history: [] });
      await api.db.credentials.insertOne({ username: 'sari', email: 'sari@example.com', password: hash, verified: true, history: [['burung', 1]] });
      budi = await login('budi');
      sari = await login('sari');
    });

    test('scores the attempt on the server, counting each answered question once', async () => {
      const res = await submit(budi, [
        { question: q1, answer: 'Ikan' },
        { question: q1, answer: 'Ikan' },
        { question: q2, answer: 'Hiu' },
        { question: 'not in this quiz', answer: 'x' },
      ]);
      assert.equal(res.status, 200);
      assert.deepEqual(res.data, { score: 1, total: 2 });
    });

    test('requires a signed-in user', async () => {
      const res = await api.request('POST', '/api/submitQuiz', { body: { name: 'binatang-laut', answers: [] } });
      assert.equal(res.status, 401);
    });

    test('keeps the 10 most recent scores', async () => {
      await api.db.credentials.updateOne({ username: 'budi' }, { $set: { history: [] } });
      for (let attempt = 1; attempt <= 12; attempt++) {
        await submit(budi, attempt % 2 ? [{ question: q1, answer: 'Ikan' }] : []);
      }
      const res = await api.request('POST', '/api/fetchHistory', { headers: budi });
      assert.equal(res.data.length, 10);
      // Attempts 3 to 12 remain; odd attempts scored 1.
      assert.deepEqual(res.data.map(([, score]) => score), [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
    });

    test("returns only the signed-in user's history", async () => {
      const res = await api.request('POST', '/api/fetchHistory', { headers: sari, body: { username: 'budi' } });
      assert.deepEqual(res.data, [['burung', 1]]);

      const anonymous = await api.request('POST', '/api/fetchHistory', { body: { username: 'budi' } });
      assert.equal(anonymous.status, 401);
    });
  });

  test('suggests other quizzes from the same category', async () => {
    const res = await api.request('POST', '/api/fetchSimilarQuiz', { body: { category: 'animal', quizName: 'binatang-laut' } });
    assert.equal(res.status, 200);
    assert.deepEqual(res.data.map((q) => q.name), ['burung']);
  });
});
