"use strict";

var mysql = require('mysql');

var mysql_connection = mysql.createConnection({
  host: 'localhost',
  user: 'w69huang',
  password: '123',
  database: 'testdb'
});
mysql_connection.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');
});
module.exports = mysql_connection;