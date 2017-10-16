const http = require('http');
const https = require('https');
const fs = require("fs");
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;
const htmlrootdir = "/Users/l/html/html_doc"
var rootindexhtml = [];

function httpreq(options, postData, cb) {
	var req = https.request(options, (res) => {
		// console.log(`STATUS: ${res.statusCode}`);
		// console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		var body = "";
		res.on('data', (chunk) => {
			body += (`${chunk}`);
		});
		res.on('end', () => {
			cb(body);

		});
	});

	req.on('error', (e) => {
		console.log(`problem with request: ${e.message}`);
	});

	if (postData) req.write(postData);
	req.end();
}

function getWord(res, word) {
	httpreq({
		'hostname': 'www.vocabulary.com',
		'port': 443,
		'path': '/dictionary/definition.ajax?search=' + word + '&lang=en',
		'method': 'GET',
		'headers': {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
		}
	}, false, (data) => {
		var json = JSON.stringify({
			'data': data
		});
		res.writeHead(200);
		res.end(json);
	});
}

function autocomplete(res, char) {
	httpreq({
		'hostname': 'www.vocabulary.com',
		'port': 443,
		'path': '/dictionary/autocomplete?search=' + char,
		'method': 'GET',
		'headers': {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
		}
	}, false, (data) => {
		var json = JSON.stringify({
			'data': data
		});
		res.writeHead(200);
		res.end(json);
	});
}

function getdom(res, url, cb) {
	url = 'http:' + url;
	console.log(url);
	http.get(url, (res) => {
		res.setEncoding('utf8');
		var body = "";
		res.on('data', (chunk) => {
			body += (`${chunk}`);
		});
		res.on('end', () => {
			cb(body);

		});

		//console.log(`Got response: ${res.statusCode}`);
		// consume response body
		//res.resume();
	}).on('error', (e) => {
		console.log(`Got error: ${e.message}`);
	});
}
for (var i of fs.readdirSync(htmlrootdir)) {
	if (fs.statSync(path.resolve(htmlrootdir, i)).isDirectory()) {
		rootindexhtml.push(`<a href="${i}/index.html">${i}</a>`);
	}
}

function reqroot(res) {
	res.writeHead(200);
	res.write(rootindexhtml.join("\n<br>"));
	res.end();
}

function notroot(res, filepath) {
	try {
		var content = fs.readFileSync(filepath);
		res.writeHead(200);
		res.write(content);
		res.end();
	} catch (err) {
		res.writeHead(404);
		res.write("");
		res.end();
		console.error(" no file!!!!", err);
	}
}
const server = http.createServer((req, res) => {
	console.log(req.url);
	if (/.*\/$/.test(req.url) && !req.headers['x-requested-with']) {
		req.url.replace(/(.*)\//, (ma, p1, p2) => {
			if (p1 == "") {
				console.log(111111111);
				reqroot(res);
			} else {
				console.log(2222222);
				var filepath = htmlrootdir + p1 + "/index.html"
				notroot(res, filepath);
			}
		});
	} else {
		if (req.headers['x-requested-with']) {
			console.log(444444);
			// var myRe = new RegExp("\/"+kk+"\/(\w+)", "g");
			var marr = req.url.match(/\/(\w+)\/(.*)/);
			console.log(marr[1]);
			console.log(marr[2]);
			if (marr) {
				if (marr[1] == "autocomplete") {
					autocomplete(res, marr[2]);
				}
				if (marr[1] == "dictionary") {
					getWord(res, marr[2]);
				}
				if (marr[1] == "getdom") {
					getdom(res, marr[2], (data) => {
						var json = JSON.stringify({
							'data': data
						});
						res.writeHead(200);
						res.end(json);
					});
				}
			}
		} else {
			var filepath = htmlrootdir + req.url;
			console.log(3333333);
			notroot(res, filepath);

		}

	}

});


server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});