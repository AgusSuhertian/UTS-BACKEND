const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const warung = require('./components/warung/warung-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  warung(app);

  return app;
};
