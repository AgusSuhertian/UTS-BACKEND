const warungService = require('./warung-service');
const usersService = require('../users/users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { name } = require('../../../models/users-schema');
const { User } = require('../../../models');

// fungsi untuk menambahkan menu
async function createProduct(request, response, next) {
  try {
    const name = request.body.name;
    const catalog = request.body.catalog;
    const price = request.body.price;

    const productsRegistered = await warungService.productsRegistered(name);
    if (productsRegistered) {
      throw errorResponder(
        errorTypes.PRODUCT_ALREADY_TAKEN,
        'Produk sudah dibuat'
      );
    }

    const success = await warungService.createProduct(name, catalog, price);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to  create product'
      );
    }

    return response.status(200).json({ name, catalog, price });
  } catch (error) {
    return next(error);
  }
}

// fungsi yang digunakan untuk menampilkan menu
async function getProducts(request, response, next) {
  try {
    const warung = await warungService.getProducts();
    return response.status(200).json(warung);
  } catch (error) {
    return next(error);
  }
}

// fungsi yang digunakan untuk menghapus menu
async function deleteProduct(request, response, next) {
  try {
    const id = request.params.id;

    const success = await warungService.deleteProduct(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

// fungsi yang digunakan untuk mengubah harga menu
async function updateProductPrice(request, response, next) {
  try {
    const id = request.params.id;
    const price = request.body.price;

    const success = await warungService.updateProductPrice(id, price);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update price'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}
// map yang menampung menu dalam endpoint keranjang
let keranjang = new Map();
// map yang menampung total bill dalam endpoint bill
let total = new Map();

// fungsi untuk menambah kan menu
async function addMenu(request, response, next) {
  const id = request.params.id;
  const name = request.body.name;
  const user = await usersService.getUser(id);
  if (user === null) {
    return next(
      errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user')
    );
  }

  const menu = await warungService.getProductByName(name);
  if (menu === null) {
    return next(
      errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown menu')
    );
  }
  const myKeranjang =
    keranjang.get(user.id) === undefined ? [] : keranjang.get(user.id);

  myKeranjang.push(menu);
  keranjang.set(user.id, myKeranjang);
  let bill = 0;
  keranjang.get(user.id).forEach((element) => {
    bill = bill + element.price;
  });
  total.set(user.id, bill);
  const res = {
    myKeranjang: keranjang.get(user.id),
  };
  return response.status(200).json(res);
}

// fungsi untuk menampilkan total bill
async function bill(request, response, next) {
  try {
    const id = request.params.id;
    const user = await usersService.getUser(id);
    const bill = await total.get(user.id);
    return response.status(200).json(bill);
  } catch (error) {
    return next(error);
  }
}

//fungsi untuk membayar bill
async function payBill(request, response, next) {
  try {
    const id = request.params.id;
    const user = await usersService.getUser(id);

    // ini adalah total bill yang akan dibayar
    const totalBill = await total.get(user.id);

    // menerima pembayaran user
    const pay = request.body.pay;

    // ini logic yang akan menampilkan error jika user membayar dalam jumlah yang kurang
    if (pay < totalBill) {
      throw errorResponder(errorTypes.INVALID_PAYMENT, 'Not Enough Money');
    }

    // melakukan pembayaran
    const change = pay - totalBill;

    // Untuk mengupdate total bill user
    total.set(user.id, 0);

    // Mereturn kembalian (change)
    return response.status(200).json({ change });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  updateProductPrice,
  addMenu,
  payBill,
  bill,
};
