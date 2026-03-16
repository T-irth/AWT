const pool = require('../config/db');

const createCategory = async (name) => {
    const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
    );
    return result.rows[0];
};

const getAllCategories = async () => {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    return result.rows;
};

const getCategoryById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById
};