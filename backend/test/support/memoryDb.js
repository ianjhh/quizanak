// A small in-memory stand-in for the MongoDB collections the API uses. It
// implements only the query and update operators the routes rely on.

let nextId = 1;

function matchesValue(actual, expected) {
  if (expected !== null && typeof expected === 'object' && !Array.isArray(expected)) {
    return Object.entries(expected).every(([op, value]) => {
      switch (op) {
        case '$in':
          return value.some((v) => matchesValue(actual, v));
        case '$nin':
          return !value.some((v) => matchesValue(actual, v));
        case '$ne':
          return !matchesValue(actual, value);
        case '$exists':
          return (actual !== undefined) === value;
        default:
          throw new Error(`memoryDb: unsupported operator ${op}`);
      }
    });
  }
  if (expected === null || expected === undefined) {
    return actual === null || actual === undefined;
  }
  if (Array.isArray(actual) && !Array.isArray(expected)) {
    return actual.includes(expected);
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function matches(doc, filter = {}) {
  return Object.entries(filter).every(([field, expected]) => matchesValue(doc[field], expected));
}

function project(doc, projection) {
  const copy = structuredClone(doc);
  if (!projection || Object.keys(projection).length === 0) {
    return copy;
  }
  const fields = Object.entries(projection);
  const including = fields.some(([field, on]) => field !== '_id' && on);
  if (including) {
    const result = {};
    if (projection._id !== 0) {
      result._id = copy._id;
    }
    for (const [field, on] of fields) {
      if (on && field in copy) {
        result[field] = copy[field];
      }
    }
    return result;
  }
  for (const [field, on] of fields) {
    if (!on) {
      delete copy[field];
    }
  }
  return copy;
}

function duplicateKeyError(field) {
  const error = new Error(`E11000 duplicate key error: ${field}`);
  error.code = 11000;
  error.keyPattern = { [field]: 1 };
  return error;
}

class MemoryCursor {
  constructor(docs, projection) {
    this.docs = docs;
    this.projection = projection;
  }

  project(projection) {
    this.projection = projection;
    return this;
  }

  limit(count) {
    this.docs = this.docs.slice(0, count);
    return this;
  }

  async toArray() {
    return this.docs.map((doc) => project(doc, this.projection));
  }
}

class MemoryCollection {
  constructor(docs = []) {
    this.docs = docs.map((doc) => ({ _id: `id${nextId++}`, ...structuredClone(doc) }));
    this.uniqueFields = [];
  }

  async createIndex(keys, options = {}) {
    if (options.unique) {
      this.uniqueFields.push(...Object.keys(keys));
    }
    return Object.keys(keys).join('_');
  }

  async findOne(filter, options = {}) {
    const doc = this.docs.find((d) => matches(d, filter));
    return doc ? project(doc, options.projection) : null;
  }

  find(filter, options = {}) {
    return new MemoryCursor(this.docs.filter((d) => matches(d, filter)), options.projection);
  }

  async countDocuments(filter) {
    return this.docs.filter((d) => matches(d, filter)).length;
  }

  async distinct(field) {
    return [...new Set(this.docs.map((d) => d[field]).filter((v) => v !== undefined))];
  }

  async insertOne(doc) {
    for (const field of this.uniqueFields) {
      if (doc[field] !== undefined && this.docs.some((d) => d[field] === doc[field])) {
        throw duplicateKeyError(field);
      }
    }
    const stored = { _id: `id${nextId++}`, ...structuredClone(doc) };
    this.docs.push(stored);
    return { acknowledged: true, insertedId: stored._id };
  }

  async replaceOne(filter, replacement, options = {}) {
    const index = this.docs.findIndex((d) => matches(d, filter));
    if (index === -1) {
      if (!options.upsert) {
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      }
      const { insertedId } = await this.insertOne(replacement);
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedId: insertedId };
    }
    this.docs[index] = { _id: this.docs[index]._id, ...structuredClone(replacement) };
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }

  async updateOne(filter, update) {
    const doc = this.docs.find((d) => matches(d, filter));
    if (!doc) {
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    }
    for (const [op, fields] of Object.entries(update)) {
      for (const [field, value] of Object.entries(fields)) {
        switch (op) {
          case '$set':
            doc[field] = structuredClone(value);
            break;
          case '$unset':
            delete doc[field];
            break;
          case '$inc':
            doc[field] = (doc[field] || 0) + value;
            break;
          case '$push': {
            const list = Array.isArray(doc[field]) ? doc[field] : [];
            const items = value && value.$each ? value.$each : [value];
            list.push(...structuredClone(items));
            if (value && value.$slice !== undefined) {
              // Positive keeps the first N elements, negative the last N (as in MongoDB).
              const n = value.$slice;
              doc[field] = n >= 0 ? list.slice(0, n) : list.slice(n);
            } else {
              doc[field] = list;
            }
            break;
          }
          default:
            throw new Error(`memoryDb: unsupported update operator ${op}`);
        }
      }
    }
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }
}

// Returns an object shaped like the one src/db.js creates.
function createMemoryDb(seed = {}) {
  return {
    credentials: new MemoryCollection(seed.credentials),
    quiz: new MemoryCollection(seed.quiz),
    animalFact: new MemoryCollection(seed.animalFact),
    spaceFact: new MemoryCollection(seed.spaceFact),
    historyFact: new MemoryCollection(seed.historyFact),
  };
}

module.exports = { MemoryCollection, createMemoryDb };
