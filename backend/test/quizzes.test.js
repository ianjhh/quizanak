const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
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

  test('suggests other quizzes from the same category', async () => {
    const res = await api.request('POST', '/api/fetchSimilarQuiz', { body: { category: 'animal', quizName: 'binatang-laut' } });
    assert.equal(res.status, 200);
    assert.deepEqual(res.data.map((q) => q.name), ['burung']);
  });
});
