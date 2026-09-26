const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer } = require('./support/testServer');
const { createMemoryDb } = require('./support/memoryDb');

const article = (linkName, title) => ({
  link_name: linkName,
  title,
  image: linkName,
  factsarr: [['Fakta pertama', 'gambar1'], ['Fakta kedua', '']],
});

describe('fact endpoints', () => {
  let api;

  before(async () => {
    api = await startTestServer({
      db: createMemoryDb({
        animalFact: [article('fakta-anjing', 'Fakta Anjing')],
        spaceFact: [article('fakta-mars', 'Fakta Mars')],
        historyFact: [article('fakta-aneh', 'Fakta Aneh')],
      }),
    });
  });

  after(() => api.close());

  for (const [list, single, linkName] of [
    ['/api/fetchAnimalFacts', '/api/fetchAnimalFact', 'fakta-anjing'],
    ['/api/fetchSpaceFacts', '/api/fetchSpaceFact', 'fakta-mars'],
    ['/api/fetchRandomFacts', '/api/fetchRandomFact', 'fakta-aneh'],
  ]) {
    test(`${list} lists the articles and ${single} returns one`, async () => {
      const all = await api.request('GET', list);
      assert.equal(all.status, 200);
      assert.deepEqual(all.data.map((a) => a.link_name), [linkName]);
      assert.equal(all.data[0].factsarr, undefined, 'the list leaves out the article body');
      assert.ok(all.data[0].title && all.data[0].image);

      const one = await api.request('POST', single, { body: { link_name: linkName } });
      assert.equal(one.status, 200);
      assert.equal(one.data.factsarr.length, 2);
    });
  }
});
