const mysql = require("mysql2");

// Create a connection pool with your specific configuration
const pool = mysql.createPool({
  host: "mysql-demo1-aryaisworking-aa18.k.aivencloud.com",
  user: "avnadmin",
  password: "AVNS_HsFwsXeJUFCRG1FIcut",
  port: 10792,
  database: "defaultdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool };
