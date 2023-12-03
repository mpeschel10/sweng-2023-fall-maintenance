const database = require('./database.js');

const connection = database.connection();
async function main() {
	console.log("Start of main function");
	try {
		const response = await database.query(connection, "Select * from requests");
		console.log("The winner is: ", response);
	} catch (e) {
		console.error("Error!", e);
	}
	process.exit();
}

main();
