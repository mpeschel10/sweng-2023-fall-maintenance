const http = require('node:http');
const fs = require('node:fs');

const busboy = require('busboy');

const hostname = '127.0.0.1';
const port = 3090;

function handle_image(req, res) {
	switch (req.method) {
		case 'POST':
			// res.statusCode = 200;
			// res.setHeader('Content-Type', 'text/plain');
			
			// Copied from https://github.com/mscdex/busboy
			console.log('POST request');
			console.log('Touching file');
			const content = 'Some content!';

			fs.writeFile('www/uploads/test.txt', content, err => {
			  if (err) {
				console.error(err);
			  }
			  // file written successfully
			});

			const bb = busboy({ headers: req.headers });
			bb.on('file', (name, file, info) => {
			  const { filename, encoding, mimeType } = info;
			  console.log(
				`File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
				filename,
				encoding,
				mimeType
			  );
			  file.on('data', (data) => {
				console.log(`File [${name}] got ${data.length} bytes`);
			  }).on('close', () => {
				console.log(`File [${name}] done`);
			  });
			});
			bb.on('field', (name, val, info) => {
			  console.log(`Field [${name}]: value: %j`, val);
			});
			bb.on('close', () => {
			  console.log('Done parsing form!');
			  res.writeHead(303, { Connection: 'close', Location: '/' });
			  res.end();
			});
			req.pipe(bb);
			
			break;			
		default:
			console.log('Unknown http method', req.method);
			res.statusCode = 501;
			res.end('Unknown method');
			break;
	}
}


// Skeleton copied from https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
function handle_request(req, res) {
	switch (req.url) {
		case '/image':
			handle_image(req, res);
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
