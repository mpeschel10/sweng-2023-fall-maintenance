const mysql = require('mysql');

exports.connection = () => mysql.createConnection({
	host     : 'localhost',
	user     : 'AzureDiamond',
	password : 'hunter2',
	database : 'sweng'
});

exports.query = (connection, string, params) => new Promise((resolve, reject) => {
	console.log("Server: Database: Doing", string, "with params", params);
	connection.query(string, params, function (error, results, fields) {
		if (error) {
			reject(error);
		} else {
			resolve(results);
		}
	});
});

