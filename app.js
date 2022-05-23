const express = require("express");
require("express-async-errors");

const Joi = require("joi");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();

const jwt = require("jsonwebtoken");
require("dotenv").config();
if (!process.env.JWT_PRIVATE_KEY) {
  console.log(
    "Vous devez créer un fichier .env qui contient la variable JWT_PRIVATE_KEY"
  );
  process.exit(1);
}

app.use(express.json());

function authGuard(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ erreur: "Vous devez vous connecter" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
    console.log(decoded);
    next();
  } catch (exc) {
    return res.status(400).json({ erreur: "Token Invalide" });
  }
}

app.post("/signup", async (req, res) => {
  const payload = req.body;
  const schema = Joi.object({
    email: Joi.string().required().email(),
    username: Joi.string().required(),
    motdepasse: Joi.string().required(),
  });

  const { value: account, error } = schema.validate(payload);
  if (error) return res.status(400).send({ erreur: error.details[0].message });

  const { id, found } = db.users.findByProperty("email", account.email);
  if (found) return res.status(400).send("Please signin instead of signup");

  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(account.motdepasse, salt);
  account.motdepasse = passwordHashed;

  db.users.insertOne(account);
  res.status(201).json({
    username: account.username,
    email: account.email,
  });
});

app.post("/signin", async (req, res) => {
  const payload = req.body;
  const schema = Joi.object({
    email: Joi.string().required().email(),
    motdepasse: Joi.string().required(),
  });

  const { value: connexion, error } = schema.validate(payload);

  if (error) return res.status(400).send({ erreur: error.details[0].message });

  const { id, found: account } = db.users.findByProperty(
    "email",
    connexion.email
  );
  if (!account) return res.status(400).send({ erreur: "Email Invalide" });

  const passwordIsValid = await bcrypt.compare(
    req.body.motdepasse,
    account.motdepasse
  );
  if (!passwordIsValid)
    return res.status(400).send({ erreur: "Mot de Passe Invalide" });

  const token = jwt.sign({ id }, process.env.JWT_PRIVATE_KEY);
  res
    .header("x-auth-token", token)
    .status(200)
    .send({ username: account.username });
});

app.get("/api/tasks", (req, res) => {
  res.json(db.tasks.getAll());
});

app.get("/api/task/:id", (req, res) => {
  let id = parseInt(req.params.id);
  res.json(db.tasks.memoryDb.get(id));
});

app.post("/api/tasks", [authGuard], (req, res) => {
  const payload = req.body;
  const user = req.user;

  const schema = Joi.object({
    description: Joi.string().required(),
    faite: Joi.boolean().required(),
  });
  const { value, error } = schema.validate(payload);
  if (error) res.status(400).send({ erreur: error.details[0].message });

  value.crééePar = user.id;

  db.tasks.insertOne(value);

  res.status(201).json(payload);
});

app.put("/api/task/:id", [authGuard], (req, res) => {
  let id = parseInt(req.params.id);
  const payload = req.body;

  const schema = Joi.object({
    description: Joi.string().required(),
    faite: Joi.boolean().required(),
  });
  const { value, error } = schema.validate(payload);
  if (error) res.status(400).send({ erreur: error.details[0].message });

  db.tasks.updateOne(id, payload);

  res.status(204).send();
});

app.delete("/api/task/:id", [authGuard], (req, res) => {
  let id = parseInt(req.params.id);

  const user = req.user;
  const task = db.tasks.get(id);

  if (user.id !== task.crééePar)
    res.status(400).send({ erreur: "Cette tâche ne vous appartient pas" });

  db.tasks.deleteOne(id);

  res.status(204).send();
});

module.exports = app;
