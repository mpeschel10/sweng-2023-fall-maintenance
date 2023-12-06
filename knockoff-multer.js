const fs = require('node:fs');
const path = require('path');
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

function saveFile(name, stream, info) { return new Promise((resolve, reject) => {
	const { filename, encoding, mimeType } = info;
	console.log(`Server: KnockoffMulter: File [${name}]: filename: %j, encoding: %j, mimeType: %j`, filename, encoding, mimeType);

	const destName = filename;
	const destPath = `www/uploads/${destName}`;
	
	fs.writeFile(destPath, "", error => { if (!error) return; reject(error);});

	stream.on('data', (data) => {
		fs.appendFile(destPath, data, error => { if (!error) return; reject(error); });
	}).on('close', () => {
		console.log('server: KnockoffMulter: File [${name}] done');
		resolve(path.relative('www', destPath));
	});
})}

function parseAndSave(req) { return new Promise((resolve, reject) => {
	resolve();
	// const bb = busboy({headers: req.headers});
	// const paths = [];
	// const fields = [];

	// bb.on('file', )
	// bb.on('field', )
	// bb.on('close', () => {
	// 	resolve()
	// })
})}

function saveFiles(req) { return new Promise((resolve, reject) => {
	const bb = busboy({ headers: req.headers });

	const pathPromises = [];
	bb.on('file', (name, file, info) => {
		pathPromises.push(saveFile(name, file, info));
	});

	bb.on('field', (name, val, info) => {
		console.log(`Server: KnockoffMulter: Field [${name}]: value: %j`, val);
	});
	
	bb.on('close', () => {
		console.log('Server: KnockoffMulter: Done parsing form! Now awaiting path promises');
		Promise.all(pathPromises).then(paths => {
			uploadUrls = paths.map(path => `http://localhost/${path}`);
			resolve(uploadUrls);
		})
	});

	req.pipe(bb);
})}

exports.saveFiles = saveFiles;
exports.summarise = summarise;
exports.parseAndSave = parseAndSave;

