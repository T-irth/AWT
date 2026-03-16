const categoryService = require('../services/category.service');

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await categoryService.createCategory(name);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCategory, getCategories };