const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const { getProducts } = require('./warung-repository');
const { query } = require('express');
const { createProduct } = require('./warung-controller');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createProduct: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      catalog: joi.string().min(1).max(50).required().label('Catalog'),
      price: joi.number().required().label('Price'),
    },
  },

  updateProducPrice: {
    body: {
      price: joi.number().required().label('Price'),
    },
  },

  addMenu: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
    },
  },
};
