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

			const bb = busboy({ headers: req.headers });

			const upload_urls = [];
			bb.on('file', (name, file, info) => {
			  const { filename, encoding, mimeType } = info;
			  console.log(
				`File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
				filename,
				encoding,
				mimeType
			  );

			  const destName = filename;
			  const destPath = `www/uploads/${destName}`;
			  fs.writeFile(destPath, "", error => { if (!error) return; console.log("File create error ", error);});

			  file.on('data', (data) => {
				// console.log(`File [${name}] got ${data.length} bytes`);
				fs.appendFile(destPath, data, error => { if (!error) return; console.log("File append error ", error);});
			  }).on('close', () => {
				console.log(`File [${name}] done`);
				upload_urls.push(`http://localhost/uploads/${destName}`);
			  });
			});
			bb.on('field', (name, val, info) => {
			  console.log(`Field [${name}]: value: %j`, val);
			});
			bb.on('close', () => {
			  console.log('Done parsing form!');
			  res.writeHead(200, { "Content-Type": "application/json" });
			  res.end(JSON.stringify(upload_urls));
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
