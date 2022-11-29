const customerSeed = require('./seeds/customer.json');

const seedCustomerTable = async (db) => {
  for (let i = 0; i < customerSeed.length; i++) {
    const customer = customerSeed[i];
    await db.customer.upsert(customer);
  }
};

const seedAllTables = async (db) => {
  await seedCustomerTable(db);
};

module.exports = { seedAllTables };
