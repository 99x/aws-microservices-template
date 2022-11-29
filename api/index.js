'use strict';

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { STAGE } = require('./util/env-vars');
const { db, getInitialConnection, createDB } = require('./util/database');
const { seedAllTables } = require('./util/seed');
const { getPort, getHost } = require('./util/port-config');

app.get('/init', async (req, res) => {
  try {
    const initalDbConnection = await getInitialConnection();
    const dbResponse = await createDB(initalDbConnection);
    await initalDbConnection.end();
    let syncOpts = {};
    if (STAGE !== 'prod') {
      syncOpts = { force: true };
    }
    await db.sequelize.sync(syncOpts);
    const updateResult = await seedAllTables(db);
    res.send({
      dbResponse,
      message: 'DB intialized and seeded'
    });
  } catch (e) {
    console.error(e);
  }
});

app.get('/order/customers', async (req, res) => {
  try {
    let response = [];
    response = await db.customer.findAll();
    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(getPort(), getHost());
console.log(`Running on http://${getHost()}:${getPort()}`);
