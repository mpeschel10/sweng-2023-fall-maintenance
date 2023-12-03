// From https://www.npmjs.com/package/mysql
const mysql      = require('mysql');
const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'AzureDiamond',
	password : 'hunter2',
	database : 'sweng'
});
 
connection.connect();
 
// results = [row]
// row = {attribute:value}
connection.query('SELECT * FROM users', function (error, results, fields) {
	if (error) throw error;
	console.log('The solution is: ', results);
});


connection.query('SELECT * FROM requests', function (error, results, fields) {
	if (error) throw error;
	console.log('The solution is: ', results);
});
  
connection.end();
   
	