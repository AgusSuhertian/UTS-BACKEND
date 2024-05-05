const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const warungControllers = require('./warung-controller');
const warungValidator = require('./warung-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/warung', route);
  // Menampilkan Menu
  route.get('/Menu', authenticationMiddleware, warungControllers.getProducts);

  // Menambah Menu
  route.post(
    '/tambahmenu',
    authenticationMiddleware,
    celebrate(warungValidator.createProduct),
    warungControllers.createProduct
  );

  // Update Harga
  route.put(
    '/aturharga/:id',
    authenticationMiddleware,
    celebrate(warungValidator.updateProducPrice),
    warungControllers.updateProductPrice
  );

  // Hapus Menu
  route.delete(
    '/hapusmenu/:id',
    authenticationMiddleware,
    warungControllers.deleteProduct
  );

  // Memasukan Menu ke keranjang
  route.post(
    '/keranjang/:id',
    authenticationMiddleware,
    celebrate(warungValidator.addMenu),
    warungControllers.addMenu
  );

  // Bayar bill
  route.get(
    '/keranjang/:id/bill',
    authenticationMiddleware,
    warungControllers.bill
  );

  // Bayar bill
  route.get(
    '/keranjang/:id/bill/paybill',
    authenticationMiddleware,
    warungControllers.payBill
  );
};
