'use strict';

const { v4: uuidv4 } = require('uuid');
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

app.get('/api/customers', async (req, res) => {
  try {
    let response = [];
    response = await db.customer.findAll();
    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
});

app.get('/api/customer-orders', async (req, res) => {
  try {
    let response = [];
    response = await db.order.findAll();
    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
});

app.post('/api/customer-orders', async (req, res) => {
  try {
    const { customer_id = null, product_id = null, supplier_id = null } = req.body;
    let response = [];
    if (customer_id && product_id && supplier_id) {
      response = await db.order.create({
        OrderId: uuidv4(),
        CustomerId: customer_id,
        ProductId: product_id,
        SupplierId: supplier_id,
        Status: 'PENDING'
      });
    }
    res.send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
});

app.patch('/api/customer-orders', async (req, res) => {
  try {
    const { order_id = null } = req.body;
    let response = [];
    if (order_id) {
      const order = db.order.findOne({ where: { OrderId: order_id } });
      if (!order) {
        throw new Error('Order not found');
      }
      order.Status = 'APPROVED';
      response = await order.save();
    }
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
