const express = require("express");
const Joi = require("joi");
const db = require("./db");

const app = express();

app.use(express.json());

const task = Joi.object({
  description: Joi.string().required(),
  faite: Joi.boolean().required(),
});

app.get("/api/tasks", (req, res) => {
  res.json(db.getAll());
});

module.exports = app;
