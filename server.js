const http = require('node:http');

const multer = require('./knockoff-multer.js');
const database = require('./database.js');

const hostname = '127.0.0.1';
const port = 3090;

async function request_image(req, res) {
	switch (req.method) {
		case 'POST':
			const paths = await multer.saveFiles(req);
			res.statusCode = 200;
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(paths));
			break;			
		default:
			console.log('Unknown http method', req.method);
			res.statusCode = 501;
			res.end('Unknown method');
			break;
	}
}

async function request_request(req, res) {
	switch (req.method) {
	case "GET":
		const connection = database.connection();
		const data = await database.query(connection, "SELECT * FROM requests");
		res.statusCode =  200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
		break;
	default:
		res.statusCode = 501;
		res.end('Unknown method');
	}
}

async function request_user(req, res) {
	switch (req.method) {
	case "GET":
		const connection = database.connection();
		const data = await database.query(connection, "SELECT * FROM users");
		res.statusCode =  200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
		break;
	default:
		res.statusCode = 501;
		res.end('Unknown method');
	}
}


// Skeleton copied from https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
function handle_request(req, res) {
	switch (req.url) {
		case '/image':
			request_image(req, res);
			break;
		case '/request':
			request_request(req, res);
			break;
		case '/user':
			request_user(req, res);
			break;
		default:
			res.status_code = 404;
			res.setHeader('Content-Type', 'text/utf-8');
			res.end('404 not found\r\n');
			break;
	}
}

const server = http.createServer(handle_request);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
