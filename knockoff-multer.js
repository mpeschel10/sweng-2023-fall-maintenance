const fs = require('node:fs');
const busboy = require('busboy');

// Copied from https://github.com/mscdex/busboy
function summarise(req) { return new Promise((resolve, reject) => {
	const bb = busboy({ headers: req.headers });

	bb.on('file', (name, file, info) => {
	const { filename, encoding, mimeType } = info;
	console.log(
		`Server: KnockoffMulter: File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
		filename,
		encoding,
		mimeType
	);

	file.on('data', (data) => {
		console.log(`Server: KnockoffMulter: File [${name}] got ${data.length} bytes`);
	}).on('close', () => {
		console.log(`Server: KnockoffMulter: File [${name}] done`);
	});
	});
	bb.on('field', (name, val, info) => {
		console.log(`Server: KnockoffMulter: Field [${name}]: value: %j`, val);
	});
	bb.on('close', () => {
		console.log('Server: KnockoffMulter: Done parsing form!');
		resolve();
	});
	
	req.pipe(bb);
})};

function saveFiles(req) { return new Promise((resolve, reject) => {
	const bb = busboy({ headers: req.headers });

	const upload_urls = [];
	bb.on('file', (name, file, info) => {
		const { filename, encoding, mimeType } = info;
		console.log(
			`Server: KnockoffMulter: File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
			filename,
			encoding,
			mimeType
		);

		const destName = filename;
		const destPath = `www/uploads/${destName}`;
		fs.writeFile(destPath, "", error => { if (!error) return; reject(error);});

		file.on('data', (data) => {
			fs.appendFile(destPath, data, error => {
				// console.log("Append file went through");
				if (!error) return; reject(error);
			});
		}).on('close', () => {
			console.log(`Server: KnockoffMulter: File [${name}] done`);
			upload_urls.push(`http://localhost/uploads/${destName}`);
		});
	});

	bb.on('field', (name, val, info) => {
		console.log(`Server: KnockoffMulter: Field [${name}]: value: %j`, val);
	});
	
	bb.on('close', () => {
		console.log('Server: KnockoffMulter: Done parsing form!');
		resolve(upload_urls);
	});

	req.pipe(bb);
})};

exports.saveFiles = saveFiles;
exports.summarise = summarise;

