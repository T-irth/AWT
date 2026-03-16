const pool = require('../config/db');

const createProduct = async (name, price, category_id) => {
    const result = await pool.query(
        'INSERT INTO products (name, price, category_id) VALUES ($1, $2, $3) RETURNING *',
        [name, price, category_id]
    );
    return result.rows[0];
};

const getAllProducts = async () => {
    const result = await pool.query(`
    SELECT 
      p.id,
      p.name,
      p.price,
      c.id AS category_id,
      c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id
  `);
    return result.rows;
};

module.exports = {
    createProduct,
    getAllProducts
};