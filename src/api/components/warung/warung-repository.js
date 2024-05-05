const { warung } = require('../../../models');

async function createProduct(name, catalog, price) {
  return warung.create({
    name,
    catalog,
    price,
  });
}

async function getProduct(id) {
  return warung.findById(id);
}

async function getProductByName(name) {
  return warung.findOne({ name });
}

async function getProducts(name, catalog, price) {
  const query = {};
  if (name) query.name = { $regex: name, $options: 'i' };
  if (catalog) query.catalog = catalog;
  if (price) query.price = { $lte: price };

  return warung.find(query);
}

async function deleteProduct(id) {
  return warung.deleteOne({ _id: id });
}

async function updateProductPrice(id, price) {
  return warung.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        price,
      },
    }
  );
}

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  deleteProduct,
  getProductByName,
  updateProductPrice,
};
