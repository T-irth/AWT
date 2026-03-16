const sequelize = new Sequelize(
  "inventory_db",   // Database name
  "root",           // MySQL username
  "",               // MySQL password
  {
    host: "localhost",
    dialect: "mysql",
    logging: false   
  }
);

module.exports = sequelize;