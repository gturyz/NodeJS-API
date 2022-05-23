const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Mon API crud", () => {
  beforeEach(() => {
    db.tasks.memoryDb = new Map();
    db.tasks.id = 0;
    db.tasks.insertOne({ description: "Alice", faite: false });
    db.tasks.insertOne({ description: "Bob", faite: true });
    db.tasks.insertOne({ description: "Charlie", faite: true });
  });

  it("GET /api/tasks retourne JSON de la database", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .expect(200)
      .expect("content-type", /json/);
    expect(JSON.parse(res.text)).toMatchObject(db.tasks.getAll());
  });

  it("GET /api/task/:id retourne le JSON de l'objet correspondant en DB", async () => {
    const res = await request(app)
      .get("/api/task/1")
      .expect(200)
      .expect("content-type", /json/);
    expect(JSON.parse(res.text)).toMatchObject(db.tasks.memoryDb.get(1));
  });

  describe("Modification de la base de donnée POST/PUT/DELETE", () => {
    let token;

    beforeAll(async () => {
      db.users.memoryDb = new Map();
      db.users.id = 0;

      await request(app).post("/signup").send({
        email: "test@gmail.com",
        username: "Test",
        motdepasse: "secret1234",
      });

      const res = await request(app)
        .post("/signin")
        .send({ email: "test@gmail.com", motdepasse: "secret1234" });
      // .end((err, response) => {
      token = res.headers["x-auth-token"];
      // });
    });

    it("POST /api/tasks doit créer un nouvel objet en BDD et le retourner", async () => {
      let insertion = { description: "Insertion", faite: false };
      let id = db.tasks.id;
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(insertion)
        .expect(201)
        .expect("content-type", /json/);

      expect(db.tasks.memoryDb.get(id)).toMatchObject(insertion);
    });

    it("PUT /api/task/:id modifie l'objet correspondant en DB", async () => {
      let modification = { description: "Modified", faite: true };
      const res = await request(app)
        .put("/api/task/1")
        .set("Authorization", `Bearer ${token}`)
        .send(modification)
        .expect(204);
      expect(modification).toMatchObject(db.tasks.memoryDb.get(1));
    });

    it("DELETE /api/task/:id supprime l'objet correspondant en DB", async () => {
      const res = await request(app)
        .delete("/api/task/1")
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
      expect(db.tasks.memoryDb.get(1)).toBeUndefined();
    });
  });

  it.each([{ username: "PasdeMotpasse" }, { motdepasse: "PasdeName" }])(
    "POST /signup devrait refuser %p sans l'insérer.",
    async (invalidObject) => {
      const idDébutTest = db.users.id;
      const result = await request(app)
        .post("/signup")
        .send(invalidObject)
        .expect(400);
      const idFinTest = db.users.id;
      expect(idFinTest).toBe(idDébutTest);
    }
  );

  it("POST /signup devrait être ajouté à la base de données et retourner username sans motdepasse", async () => {
    const result = await request(app)
      .post("/signup")
      .send({
        username: "Deadpool",
        motdepasse: "secret1234",
        email: "deadpool@gmail.com",
      })
      .expect(201);
    expect(result.body).toEqual({
      username: "Deadpool",
      email: "deadpool@gmail.com",
    });
  });

  it("POST /signup doit être ajouté à la BD avec le motdepasse haché", async () => {
    const result = await request(app)
      .post("/signup")
      .send({
        username: "Geralt",
        motdepasse: "secret1234",
        email: "geralt@gmail.com",
      })
      .expect(201);

    const { id, found: account } = db.users.findByProperty(
      "username",
      "Geralt"
    );
    const hashedPassword = account.motdepasse;
    expect(hashedPassword).not.toMatch(/secret1234/);
  });

  it("POST /signin ne doit pas accepter les connexions à un compte existant mais avec le mauvais mot de passe", async () => {
    // ATTENTION ici test@gmail.com ne doit pas exister sinon erreur non lié au code.
    const inscription = await request(app).post("/signup").send({
      email: "test@gmail.com",
      username: "Test",
      motdepasse: "secret1234",
    });

    const connexion = await request(app)
      .post("/signin")
      .send({ email: "test@gmail.com", motdepasse: "secret12345" })
      .expect(400);
  });
});
