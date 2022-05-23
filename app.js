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

app.get("/api/tasks", (req, res) => {
  res.json(db.tasks.getAll());
});

app.get("/api/task/:id", (req, res) => {
  let id = parseInt(req.params.id);
  res.json(db.tasks.memoryDb.get(id));
});

app.post("/api/tasks", (req, res) => {
  const payload = req.body;

  const schema = Joi.object({
    description: Joi.string().required(),
    faite: Joi.boolean().required(),
  });
  const { value, error } = schema.validate(payload);
  if (error) res.status(400).send({ erreur: error.details[0].message });

  db.tasks.insertOne(value);

  res.status(201).json(payload);
});

app.put("/api/task/:id", (req, res) => {
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

app.delete("/api/task/:id", (req, res) => {
  let id = parseInt(req.params.id);

  db.tasks.deleteOne(id);

  res.status(204).send();
});

module.exports = app;
