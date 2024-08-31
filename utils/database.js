const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "Secretmysql!1909", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
