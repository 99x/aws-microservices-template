const { STAGE } = require('./env-vars');

const stagePort = {
  local: 3000,
  dev: 5001,
  prod: 5000
};

const HOST = '0.0.0.0';

const getPort = () => {
  return stagePort[STAGE];
};

const getHost = () => {
  return HOST;
};

module.exports = {
  getPort,
  getHost
};
