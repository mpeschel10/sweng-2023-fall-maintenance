const http = require('node:http');

const multer = require('./knockoff-multer.js');
const database = require('./database.js');
const { parse } = require('node:path');

const hostname = '127.0.0.1';
const port = 3090;

// From https://stackoverflow.com/a/49428486/6286797
function streamToString (stream) {
	const chunks = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	})
}

// From https://stackoverflow.com/a/3409200/6286797
function parseCookies (request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`, 2);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

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
	if (req.method === "GET") {
		const connection = database.connection();
		const request_parameters = new URLSearchParams(req.queryString);

		let query = "SELECT * FROM requests";
		let sql_parameter_clauses = [];
		let sql_parameters = [];
		
		const id = request_parameters.get('id');
		if (id !== null && id !== "") {
			sql_parameter_clauses.push("id = ?");
			sql_parameters.push(parseInt(id));
		}

		// table.appendChild(date);
		
		const apartment = request_parameters.get("apartment");
		if (apartment !== null && apartment !== "") {
			sql_parameter_clauses.push("apartment LIKE ?");
			sql_parameters.push('%' + apartment + '%');
		}

		const location = request_parameters.get("location");
		if (location !== null && location !== "") {
			sql_parameter_clauses.push("location LIKE ?");
			sql_parameters.push('%' + location + '%');
		}

		const before = request_parameters.get("before");
		if (before !== null && before !== "") {
			sql_parameter_clauses.push("datetime < ?");
			sql_parameters.push(before);
		}

		const after = request_parameters.get("after");
		if (after !== null && after !== "") {
			sql_parameter_clauses.push("datetime > ?");
			sql_parameters.push(after);
		}

		const status = request_parameters.get("status");
		if (status !== null && status !== "" && status != "ANY") {
			sql_parameter_clauses.push("status = ?");
			sql_parameters.push(status);
		}
		
		if (sql_parameters.length > 0) {
			query += " WHERE " + sql_parameter_clauses.join(' AND ');
		}
		const data = await database.query(connection, query, sql_parameters);
		
		res.statusCode =  200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
	} else if (req.method === "POST") {
		const [fields, paths] = await multer.parseAndSave(req);
		const params = fields.reduce((obj, [key, value]) => {
			obj[key] = value; return obj;
		}, {});
		const tenant = parseInt(params.id);
		const connection = database.connection();
		const tenantData = await database.query(connection,
			"SELECT apartment FROM tenants WHERE user_id = ?",
			tenant
		);

		if (tenantData.length == 0) {
			res.statusCode = 404;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(`Bad parameter id=${tenant}: No tenant with that user_id exists.`));
			return;
		}

		const apartment = tenantData[0]['apartment'];
		const datetime = new Date().getTime() / 1000;

		const values = [tenant, apartment, params.location, params.description, datetime, params.photo];
		
		const data = await database.query(connection,
			"INSERT INTO requests (tenant, apartment, location, description, datetime, photo) VALUES (?, ?, ?, ?, ?, ?)",
			values
		);
		
		res.statusCode = 303; // 303 SEE OTHER: Tells client to use GET for next request
		res.setHeader('Location', `http://localhost/request.html?id=${data.insertId}`);
		res.end();
	} else if (req.method === 'PATCH') {
		const query = new URLSearchParams(req.queryString);
		const id = parseInt(query.get('id'));
		
		const patchString = await streamToString(req);
		const patch = JSON.parse(patchString);
		const status = patch.status;
		
		const connection = database.connection();
		const result = await database.query(connection, 'UPDATE requests SET status = ? WHERE id = ?', [status, id]);
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(result));
	} else {
		res.statusCode = 501;
		res.end('Unknown method');
	}
}

async function request_user(req, res) {
	const params = new URLSearchParams(req.queryString);
	if (req.method === "GET") {
		let query = "SELECT * FROM users";
		const userAttributes = [];
		if (params.has("id")) {
			query += " WHERE id = ?";
			userAttributes.push(parseInt(params.get("id")));
		}

		const connection = database.connection();
		const data = await database.query(connection, query, userAttributes);
		res.statusCode =  200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));

	} else if (req.method === "POST") {
		const userAttributes = [params.get('username'), params.get('password'), params.get('kind')];
		// console.log("Server: Params are", params);
		// console.log("Server: Attribs are", userAttributes);
		
		const connection = database.connection();
		const data = (await database.query(connection,
			'INSERT INTO users (username, password, kind) VALUES (?, ?, ?)', userAttributes
		)).insertId;

		res.statusCode =  200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
	} else {
		res.statusCode = 501;
		res.end('Unknown method');
	}
}

async function request_tenant(req, res) {
	if (req.method === "GET") {
		const connection = database.connection();
		const data = await database.query(connection, "SELECT * FROM users JOIN tenants ON users.id = tenants.user_id");
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
	} else if (req.method === "PATCH") {
		const query = new URLSearchParams(req.queryString);
		const id = parseInt(query.get('id'));
		
		const patchString = await streamToString(req);
		const patch = JSON.parse(patchString);
		const apartment = patch.apartment;

		const connection = database.connection();
		const data = await database.query(connection, "UPDATE tenants SET apartment = ? WHERE id = ?", [apartment, id]);
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
	} else if (req.method === "DELETE") {
		const query = new URLSearchParams(req.queryString);
		const id = parseInt(query.get('id'));
		
		const connection = database.connection();
		const data = await database.query(connection, "DELETE FROM tenants WHERE id = ?", [id]);
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(data));
	} else if (req.method === "POST") {
		const [fields, paths] = await multer.parseAndSave(req);
		console.log("Fileds:", fields, paths);
		const bodyParameters = fields.reduce((obj, [key, value]) => { obj[key] = value; return obj}, {});
		const userParameters = [
			bodyParameters.username,
			bodyParameters.password,
			'TENANT',
		];

		const connection = database.connection();
		const userResult = await database.query(connection, "INSERT INTO users (username, password, kind) VALUES (?, ?, ?)", userParameters);
		const userId = userResult.insertId;

		const tenantParameters = [
			userId, 
			bodyParameters.name,
			bodyParameters.phone,
			bodyParameters.email,
			Math.round(new Date().getTime() / 1000),
			bodyParameters.apartment,
		]
		await database.query(connection, "INSERT INTO tenants (user_id, name, phone, email, in_date, apartment) VALUES (?, ?, ?, ?, ?, ?)", tenantParameters);
	
		res.statusCode = 303;
		res.setHeader("Location", "/users.html");
		res.end();
	} else {
		res.statusCode = 405;
		res.end();
	}
}

async function request_auth(req, res) {
	const uri = req.headers['x-original-uri'];
	const [path, queryString] = uri.split('?', 2);
	console.log("Authorizing ", path, queryString);
	if (!path.endsWith('html')) {
		res.end();
		return;
	}

	const cookies = parseCookies(req);
	console.log(cookies);
	const userKind = cookies['user-kind'];

	if (uri === "/index.html" || uri === '/login.html') {
		res.statusCode = 200;
	} else if (uri === "/request.html") {
		if (userKind !== 'MAINTENANCE' && userKind !== 'TENANT')
			res.statusCode = 403;
	} else if (uri === "/requests.html") {
		if (userKind !== 'MAINTENANCE')
			res.statusCode = 403;
	} else if (uri === "/requests/new.html") {
		if (userKind !== 'TENANT')
			res.statusCode = 403;
	} else if (uri === "/upload.html") {
		if (userKind !== 'TENANT')
			res.statusCode = 403;
	} else if (uri === "/users.html") {
		if (userKind !== 'MANAGER')
			res.statusCode = 403;
	} else {
		res.statusCode = 403;
	}
	res.end();
}

async function request_login(req, res) {
	const query = new URLSearchParams(req.queryString);
	const username = query.get('username');
	const password = query.get('password');

	const connection = database.connection();
	const [user] = await database.query(connection, 'SELECT kind FROM users WHERE username = ? AND password = ?', [username, password]);
	
	const cookie = `user-kind=${user.kind}`;
	console.log("Setting cookie:", cookie);
	if (user) {
		res.statusCode = 302;
		res.setHeader("Set-Cookie", cookie);
		res.setHeader("Location", `/index.html`);
	} else {
		res.statusCode = 403;
	}
	res.end();
}

async function request_debug_summarise(req, res) {
	await multer.summarise(req);
	res.statusCode = 204;
	res.end();
}

async function request_debug_body(req, res) {
	console.log(await streamToString(req));
	res.end();
}

// Skeleton copied from https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
function handle_request(req, res) {
	console.log("Server: Handling request ", req.method, req.url);
	// I think this is bugged?
	// That is, sometimes requests will include the fqdn in req.url
	//  and this will break if that happens.
	const [path, queryString] = req.url.split('?', 2);
	req.path = path;
	req.queryString = queryString;
	
	switch (path) {
		case '/auth':
			request_auth(req, res);
			break;
		case '/image':
			request_image(req, res);
			break;
		case '/request':
			request_request(req, res);
			break;
		case '/user':
			request_user(req, res);
			break;
		case '/tenant':
			request_tenant(req, res);
			break;
		case '/debug/summarise':
			request_debug_summarise(req, res);
			break;
		case '/debug/body':
			request_debug_body(req, res);
			break;
		case '/login':
			request_login(req, res);
			break;
		default:
			res.statusCode = 404;
			res.setHeader('Content-Type', 'text/utf-8');
			res.end('404 not found\r\n');
			break;
	}
}

const server = http.createServer(handle_request);

server.listen(port, hostname, () => {
  console.log(`Server: Running at http://${hostname}:${port}/`);
});
