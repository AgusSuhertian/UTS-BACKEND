const warungRepository = require('./warung-repository');

async function createProduct(name, catalog, price) {
  try {
    await warungRepository.createProduct(name, catalog, price);
  } catch (err) {
    return null;
  }

  return true;
}

async function getProduct(id) {
  const warung = await warungRepository.getProduct(id);

  if (!warung) {
    return null;
  }

  return {
    name: warung.name,
    catalog: warung.catalog,
    price: warung.price,
  };
}

async function getProducts() {
  const products = await warungRepository.getProducts();

  const results = [];
  for (let i = 0; i < products.length; i += 1) {
    const warung = products[i];
    results.push({
      id: warung.id,
      product: warung.name,
      catalog: warung.catalog,
      price: warung.price,
    });
  }

  return results;
}

async function deleteProduct(id) {
  const warung = await warungRepository.getProduct(id);

  if (!warung) {
    return null;
  }

  try {
    await warungRepository.deleteProduct(id);
  } catch (err) {
    return null;
  }

  return true;
}

async function productsRegistered(name) {
  const product = await warungRepository.getProductByName(name);

  if (product) {
    return true;
  }

  return false;
}

async function getProductByName(name) {
  const product = await warungRepository.getProductByName(name);

  return product;
}

async function updateProductPrice(id, price) {
  const product = await warungRepository.getProduct(id);

  if (!product) {
    return null;
  }

  try {
    await warungRepository.updateProductPrice(id, price);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  createProduct,
  getProduct,
  createProduct,
  getProducts,
  deleteProduct,
  productsRegistered,
  updateProductPrice,
  getProductByName,
};
