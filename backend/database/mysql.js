// const mysql = require('mysql');
// const mysql_connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'w69huang',
//   password: '123',
//   database: 'testdb'
// });

const mysql = require('mysql');
const mysql_connection = mysql.createConnection({
  host: '35.188.40.76',
  user: 'root',
  password: 'gameflex123',
  database: 'testdb'
});
mysql_connection.connect((err) => {
  if (err) throw err;
  console.log('MySQL Database Connection Complete!');
});

module.exports = mysql_connection;
