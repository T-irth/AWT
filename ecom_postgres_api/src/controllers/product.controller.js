const productService = require('../services/product.service');

const createProduct = async (req, res) => {
    try {
        const { name, price, category_id } = req.body;
        const product = await productService.createProduct(
            name,
            price,
            Number(category_id)
        );
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createProduct, getProducts };