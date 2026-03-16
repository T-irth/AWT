const productModel = require('../models/product.model');
const categoryModel = require('../models/category.model');

const createProduct = async (name, price, category_id) => {
    if (!name || !price || !category_id)
        throw new Error("All fields are required");

    if (price <= 0)
        throw new Error("Price must be greater than 0");

    const category = await categoryModel.getCategoryById(category_id);

    if (!category)
        throw new Error("Category does not exist");

    return await productModel.createProduct(name, price, category_id);
};

const getProducts = async () => {
    return await productModel.getAllProducts();
};

module.exports = { createProduct, getProducts };