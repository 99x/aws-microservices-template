const mysql = require('promise-mysql');
const Sequelize = require('sequelize');
const { DATABASE_NAME, RDS_USERNAME, RDS_PASSWORD, RDS_HOSTNAME } = require('./env-vars');

const sequelize = new Sequelize(DATABASE_NAME, RDS_USERNAME, RDS_PASSWORD, {
  host: RDS_HOSTNAME,
  dialect: 'mysql'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.customer = require('../models/Customer')(sequelize, Sequelize);
db.order = require('../models/Order')(sequelize, Sequelize);

db.customer.hasMany(db.order, {
  foreignKey: 'CustomerId'
});

db.order.belongsTo(db.customer, {
  foreignKey: 'CustomerId'
});

const createDB = async (db) => {
  return db.query(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME};`);
};

const getInitialConnection = () => {
  return mysql.createConnection({
    host: RDS_HOSTNAME,
    user: RDS_USERNAME,
    password: RDS_PASSWORD
  });
};

module.exports = {
  createDB,
  getInitialConnection,
  db
};
