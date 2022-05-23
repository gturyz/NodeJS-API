const db = {
  tasks: {
    id: 0,
    memoryDb: new Map(),
    insertOne: function (obj) {
      this.memoryDb.set(this.id++, obj);
    },
    exists: function (id) {
      return this.memoryDb.has(id);
    },
    updateOne: function (id, obj) {
      if (this.exists(id)) {
        this.memoryDb.set(id, obj);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    },
    deleteOne: function (id) {
      if (this.exists(id)) {
        this.memoryDb.delete(id);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    },
    getAll: function () {
      return Object.fromEntries(this.memoryDb);
    },
  },
  users: {
    id: 0,
    memoryDb: new Map(),
    insertOne: function (obj) {
      this.memoryDb.set(this.id++, obj);
    },
    exists: function (id) {
      return this.memoryDb.has(id);
    },
    updateOne: function (id, obj) {
      if (this.exists(id)) {
        this.memoryDb.set(id, obj);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    },
    deleteOne: function (id) {
      if (this.exists(id)) {
        this.memoryDb.delete(id);
      } else {
        throw new Error(`Key ${id} doesn't not exists`);
      }
    },
    getAll: function () {
      return Object.fromEntries(this.memoryDb);
    },
    findByProperty(propertyName, value) {
      let result = false;
      this.memoryDb.forEach((obj, id) => {
        if (!result) {
          if (propertyName in obj && obj[propertyName] === value) {
            result = { id: id, found: obj };
          }
        }
      });
      return result || {};
    },
  },
};

db.tasks.insertOne({ description: "Alice", faite: false, crééePar: 1 });
db.tasks.insertOne({ description: "Bob", faite: true, crééePar: 2 });
db.tasks.insertOne({ description: "Charlie", faite: true, crééePar: 0 });

module.exports = db;
