const RDS_HOSTNAME = process.env.RDS_HOSTNAME;
const RDS_USERNAME = process.env.RDS_USERNAME;
const RDS_PASSWORD = process.env.RDS_PASSWORD;
const STAGE = process.env.STAGE || 'local';
const DATABASE_NAME = `order-app-db-${STAGE}`;
const DEPLOYMENT = process.env.DEPLOYMENT;

module.exports = {
  RDS_HOSTNAME,
  RDS_USERNAME,
  RDS_PASSWORD,
  STAGE,
  DATABASE_NAME,
  DEPLOYMENT
};
