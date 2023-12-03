const mysql = require('mysql');

exports.connection = () => mysql.createConnection({
	host     : 'localhost',
	user     : 'AzureDiamond',
	password : 'hunter2',
	database : 'sweng'
});

exports.query = (connection, string) => new Promise((resolve, reject) => {
	connection.query('SELECT * FROM users', function (error, results, fields) {
		if (error) {
			reject(error);
		} else {
			resolve(results, fields);
		}
	});
});
