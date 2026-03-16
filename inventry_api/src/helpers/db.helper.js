//for config
const { MYSQL_DB_CONFIG } = require("../config/db.config");

//for mysql connection
const mysql = require("mysql2/promise");

//for Sequelize ORM
const { Sequelize } = require("sequelize");

module.exports = db = {};

initialize();

async function initialize() {
    const { HOST, USER, PORT, PASSWORD, DB } = MYSQL_DB_CONFIG;

    const connection = await mysql.createConnection({
        host: HOST,
        user: USER,
        password: PASSWORD,
    });

    await connection.query(`Create database if not exists \`${DB}\`;`);

    //connect to db
    const sequelize = new Sequelize(DB, USER, PASSWORD, {
        dialect: "mysql",
        host: HOST,
    });

    //   db.Shop = require("../models/shop.model")(sequelize);
       db.Category = require("../models/category.model")(sequelize);
       db.Product = require("../models/product.model")(sequelize);
    //   const shop_category = sequelize.define(
    //     "shop_category",
    //     {},
    //     { timestamps: false }
    //   );

    //   db.Shop.belongsToMany(db.Category, { through: shop_category });
    //   db.Category.belongsToMany(db.Shop, { through: shop_category });
       db.Category.hasMany(db.Product);
       db.Product.belongsTo(db.Category);
    await sequelize.sync({ alter: true });
}//note leazy loadind related data loade later 
// eagle related data load with run 