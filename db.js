const pgp = require("pg-promise")();

// set to your own databases configuration
const cn = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "jubelio",
};

const mydb = pgp(cn);

module.exports = mydb;
