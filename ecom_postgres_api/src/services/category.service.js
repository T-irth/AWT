const categoryModel = require('../models/category.model');

const createCategory = async (name) => {
    if (!name) throw new Error("Category name is required");

    return await categoryModel.createCategory(name);
};

const getCategories = async () => {
    return await categoryModel.getAllCategories();
};

module.exports = { createCategory, getCategories };