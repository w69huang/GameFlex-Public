"use strict";

// const mysql = require('mysql');
// const mysql_connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'w69huang',
//   password: '123',
//   database: 'testdb'
// });
var mysql = require('mysql');

var mysql_connection = mysql.createConnection({
  host: '34.71.14.117',
  user: 'root',
  password: '123',
  database: 'testdb'
});
mysql_connection.connect(function (err) {
  if (err) throw err;
  console.log('Connected!');
});
module.exports = mysql_connection;