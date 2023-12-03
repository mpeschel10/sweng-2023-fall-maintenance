// From https://www.npmjs.com/package/mysql
const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'AzureDiamond',
  password : 'hunter2',
  database : 'sweng'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
  connection.end();
});

const otherConnection = mysql.createConnection({
	host     : 'localhost',
	user     : 'AzureDiamond',
	password : 'hunter2',
	database : 'sweng'
  });
otherConnection.connect();
 
otherConnection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
  otherConnection.end();
});
 
