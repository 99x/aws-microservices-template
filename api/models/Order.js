module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    'Customer',
    {
      OrderId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      CustomerId: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      ProductId: {
        type: Sequelize.UUID
      },
      SupplierId: {
        type: Sequelize.UUID
      },
      Status: {
        type: Sequelize.STRING
      }
    },
    {
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt'
    }
  );
};
