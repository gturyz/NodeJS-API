const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Mon API crud", () => {
  beforeEach(() => {
    db.memoryDb = new Map();
    db.id = 0;
    db.insertOne({ description: "Alice", faite: false });
    db.insertOne({ description: "Bob", faite: true });
    db.insertOne({ description: "Charlie", faite: true });
  });

  it("GET /api/tasks retourne JSON de la database", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .expect(200)
      .expect("content-type", /json/);
    expect(JSON.parse(res.text)).toMatchObject(db.getAll());
  });

  it("GET /api/task/:id retourne le JSON de l'objet correspondant en DB", async () => {
    const res = await request(app)
      .get("/api/task/1")
      .expect(200)
      .expect("content-type", /json/);
    expect(JSON.parse(res.text)).toMatchObject(db.memoryDb.get(1));
  });
});
