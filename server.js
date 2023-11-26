const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3090;

// Skeleton copied from https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
function handle_request(req, res) {
	switch (req.method) {
		case 'POST':
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/plain');
			res.end('Ticket received\n');
			break;
		default:
			console.log('Unknown http method', req.method);
			res.statusCode = 501;
			res.end('Unknown method');
			break;
	}
}

const server = http.createServer(handle_request);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
