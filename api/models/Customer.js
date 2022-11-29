module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Customer', {
    CustomerId: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false
    },
    Name: {
      type: Sequelize.STRING
    },
    Address: {
      type: Sequelize.STRING
    },
    Gender: {
      type: Sequelize.STRING(1)
    }
  });
};
