const express = require("express");
const Joi = require("joi");
const db = require("./db");

const app = express();

app.use(express.json());

app.get("/api/tasks", (req, res) => {
  res.json(db.getAll());
});

app.get("/api/task/:id", (req, res) => {
  let id = parseInt(req.params.id);
  res.json(db.memoryDb.get(id));
});

app.post("/api/tasks", (req, res) => {
  const payload = req.body;

  const schema = Joi.object({
    description: Joi.string().required(),
    faite: Joi.boolean().required(),
  });
  const { value, error } = schema.validate(payload);
  if (error) res.status(400).send({ erreur: error.details[0].message });

  db.insertOne(value);

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

  db.updateOne(id, payload);

  res.status(204).send();
});

module.exports = app;
