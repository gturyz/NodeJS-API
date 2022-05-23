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

  it("POST /api/tasks doit créer un nouvel objet en BDD et le retourner", async () => {
    let insertion = { description: "Insertion", faite: false };
    let id = db.id;
    const res = await request(app)
      .post("/api/tasks")
      .send(insertion)
      .expect(201)
      .expect("content-type", /json/);

    expect(db.memoryDb.get(id)).toMatchObject(insertion);
  });

  it("PUT /api/task/:id modifie l'objet correspondant en DB", async () => {
    let modification = { description: "Modified", faite: true };
    const res = await request(app)
      .put("/api/task/1")
      .send(modification)
      .expect(204);
    expect(modification).toMatchObject(db.memoryDb.get(1));
  });

  it("DELETE /api/task/:id supprime l'objet correspondant en DB", async () => {
    const res = await request(app).delete("/api/task/1").expect(204);
    console.log(db.memoryDb.get(1));
    expect(db.memoryDb.get(1)).toBeUndefined();
  });
});
