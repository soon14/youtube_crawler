// https://api.pcloud.com/getfilelink?fileid=1431281537&hashCache=11229092765761200000&forcedownload=1&auth=015ERkZF9I9Z4tDxYFdcOMhYnDLFyw4e8YnVg0Fk

// https://api.pcloud.com/listfolder?folderid=287484623&recursive=0&iconformat=id&getkey=1&auth=015ERkZF9I9Z4tDxYFdcOMhYnDLFyw4e8YnVg0Fk
// https://api.pcloud.com/listfolder?folderid=0&recursive=0&iconformat=id&getkey=1&auth=015ERkZF9I9Z4tDxYFdcOMhYnDLFyw4e8YnVg0Fk
const https = require('https');
require('buffer').Buffer;
const fs = require('fs');
const querystring = require('querystring');
const path = require('path');
const wf = require("./writeIntoFile");
const parseString = require('xml2js').parseString;
const url = require('url');



class Utils {
	mkqs(obj) {
		return querystring.stringify(obj);
	}
	httpsget(url, cb) {
		https.get(url, (res) => {
			// console.log('statusCode:', res.statusCode);
			// console.log('headers:', res.headers);
			var body = "";
			res.on('data', (chunk) => {
				body += (`${chunk}`);
			});
			res.on('end', () => {
				cb(body);
			});


		}).on('error', (e) => {
			console.error(e);
		});
	}
	httpsreq(options, postData, cb) {
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
}



class Pcloud extends Utils {
	constructor() {
		super();
		this.auth = "5QFSAXZF9I9Z4BgSVMQWo8S8MWKr4W50shHQNBqV";  //asdsadsa@qq.com
		// this.auth = "KoCEDXZVaE9Zmb5xbc7W7XmhFEUJPLAVTYidRuVk";  //605170265@qq.com
		// this.auth = "MpBfhZ3Ma9ZJX1KkPwensVNQxIRrnIIvL5dEIIV";  //qwuewqeqwe@qq.com
		// this.auth = "CwUhUZe41MZ8C7t4dyz3cLvmpAzJ4h5xuuyKiKX";  //qwedadwrrwr@qq.com
		// this.auth = "nLO53XZdDgMZsFziaPjAYek2fYAbWxNtfR0Y2c0k"; //e3rr43r34@qq.com
		// this.auth = "upmnwVZgrCMZjTABetzbOSR0ywv01P5pWzGEDRUk"; //eqe3eqesdf@qq.com
		// this.auth = "jf6CEXZqnKMZP88vbD7MpIkBLQrjPr3OOHBRQxi7"; //qwe234234@qq.com
		// this.auth = "jCkGt7Z1TEMZUhlXyfnwUE8djiUeTh0AXHYxu17k"; //23ewwer3r@qq.com
		// this.auth = "NHjF0ZnPEMZilip7aRkEqQcYxLGYA89W5jena4k"; //34tfdgy5y2@qq.com
		// this.auth = "8AMf9XZKqEMZwSgDGjVjfz5zw3oobGrhKXeLuX9X"; //asdadr342@qq.com
		// this.auth = "L8MhpZLEEMZnu2Q9VX7AzBO0hJf6lVwqhTnHX07"; //asdasdsd2342@qq.com
		// this.auth = "hEAg2VZvAEMZqBmSGoSFj65dyxEmJRy5obC2zUU7"; //14erwqrwq@qq.com
		// this.auth = "D0WvOXZQCVTZgyX4N7Tmh6upLRMICUe7OuVGPGYV"; //qwe32wdada@qq.com
		// this.auth = "BGVQ3XZuAVTZUyIsrbg2048GC3JNIbAlLhunmggV"; // 234dsfewf@qq.com
		// this.auth = "4unDpkZmGzCZTwSusFD46wX8XgBRthh0W7BOgL4k"; //  sadasd23@qq.com
		// this.auth = "8CgYo7ZfFuCZMfTpltlBnI0w9iKG7GomL8zche07"; // asddwqdqwd@qq.com
		// this.auth = "YxLXDkZwEICZElnibyahAGbc4bQoNm0aIznp5UkX"; // asda3223ewe@qq.com
		// this.auth = "RI0mIVZyCSxZWng6P7m8OmhVhGDGzh5oX4SstYDV"; // wqeqee3@qq.com
		// this.auth = "fVgCekZ6MplZzMGxtGxyEy4OicbNdK2VhFAWNST7"; // sawde23ee@qq.com
		this.urlgetauth = "https://api.pcloud.com/userinfo?" +
			this.mkqs({
				"getauth": 1,
				"logout": 1,
				"username":"asdsadsa@qq.com",
				// "username":"605170265@qq.com",
				// "username":"qwuewqeqwe@qq.com",
				// "username":"qwedadwrrwr@qq.com",
				// "username":"e3rr43r34@qq.com",
				// "username": "eqe3eqesdf@qq.com",
				// "username": "qwe234234@qq.com",
				// "username": "23ewwer3r@qq.com",
				// "username": "34tfdgy5y2@qq.com",
				// "username": "asdadr342@qq.com",
				// "username": "asdasdsd2342@qq.com",
				// "username": "14erwqrwq@qq.com",
				// "username": "qwe32wdada@qq.com",
				// "username": "234dsfewf@qq.com",
				// "username": "sadasd23@qq.com",
				// "username": "asddwqdqwd@qq.com",
				// "username": "asda3223ewe@qq.com",
				// "username": "wqeqee3@qq.com",
				// "username": "sawde23ee@qq.com",
				"password": "123qwe",
			});
		this.urlgetfolderallfile = 'https://api.pcloud.com/listfolder?' +
			this.mkqs({
				"auth": this.auth,
				"folderid": "0",
				"recursive": 0,
				"iconformat": "id",
				"getkey": 1,
			});
		this.resultData = [];
	}
	getauth() {
		this.httpsget(this.urlgetauth, (body) => {
			console.log(body);
		});
		return this;
	}
	getDownloadUrl() {
		var _this = this;
		this.httpsget(this.urlgetfolderallfile, (body) => {
			var arr = JSON.parse(body).metadata.contents;
			(function loopw() {
				if (arr.length) {
					var url2 = "https://api.pcloud.com/getfilelink?" +
						_this.mkqs({
							"fileid": arr.shift().fileid,
							"hashCache": "11229092765761200000",
							"forcedownload": 1,
							"auth": _this.auth
						});
					_this.httpsget(url2, (body) => {
						var obj = JSON.parse(body);
						var addr = 'https://' + obj.hosts[0] + obj.path;
						// console.log(addr);
						_this.resultData.push(addr);
						loopw();
					});
				} else {
					wf.writeIntoFile(path.join(__dirname, '../pcloudDownloadUrl'), _this.resultData.join("\n"), 1);
				}
			}())

		});
		return this;
	}

	readUploadUrl() {
		const buf2 = new Buffer(fs.readFileSync(path.join(__dirname,
			'../',
			"youtubeTempUrl")));
		var arr = buf2.toString().split('\n');
		var _this = this;
		(function loopp() {
			if (arr.length) {
				_this.remoteUpload(arr.shift());
				_this.uploadprogress(() => {
					loopp()
				});
			}
		}())
	}
	remoteUpload(uu) {
		// const buf2 = new Buffer(fs.readFileSync(path.join(__dirname, '../EnglishLessons4U')));
		// const arr = buf2.toString().split('\n\n');
		// console.log(arr[1]);
		// var uu = 'https://r4---sn-n4v7sn7s.googlevideo.com/videoplayback?initcwndbps=2742500&ipbits=0&dur=977.629&ratebypass=yes&expire=1476702010&mime=video%2Fmp4&key=yt6&nh=IgpwcjAxLnNqYzA3Kg03Mi4xNC4yMTkuMTYy&signature=0CE5CC77FE54038D10E9C5A299233038E5616D34.9833B4A0A3C99D2B8F8344F01E1B4B1292B74ECE&lmt=1472402373478479&source=youtube&upn=ROFPXu5-aWQ&ei=2VoEWLnGNsrg-QPdyqboCQ&itag=22&ip=45.33.52.129&requiressl=yes&ms=au&mt=1476680147&mv=m&sparams=dur%2Cei%2Cid%2Cinitcwndbps%2Cip%2Cipbits%2Citag%2Clmt%2Cmime%2Cmm%2Cmn%2Cms%2Cmv%2Cnh%2Cpl%2Cratebypass%2Crequiressl%2Csource%2Cupn%2Cexpire&id=o-AARHX8krKPZ-iUfKS9iQ2tpypuP1gpAMt0G6KiyqGNwF&pl=20&mm=31&mn=sn-n4v7sn7s&title=Training%20versus%20Testing%20--%20Effective%20Number%20of%20Hypotheses%20%40%20Machine%20Learning%20Foundations%20(%E6%A9%9F%E5%99%A8%E5%AD%B8%E7%BF%92%E5%9F%BA%E7%9F%B3)';
		var qs = this.mkqs({
			'folderid': 0,
			'progresshash': 'upload-7871911-xhr-524',
			'nopartial': 1,
			// 'url': arr[1],
			'url': uu,
			"auth": this.auth
		});
		// console.log(qs);
		this.httpsreq({
			'hostname': 'api.pcloud.com',
			'port': 443,
			'path': '/downloadfile?' + qs,
			'method': 'POST',
			'headers': {
				// 'Content-Type': 'application/x-www-form-urlencoded',
				// 'Content-Length': Buffer.byteLength(qs),
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
			}
		}, false, (body) => {
			var obj = JSON.parse(body);
			// console.log(obj);
		});

	}
	uploadprogress(cb) {
		var _this = this;
		(function looee() {
			var progress = "https://api.pcloud.com/uploadprogress?" +
				_this.mkqs({
					'progresshash': 'upload-7871911-xhr-524',
					"auth": _this.auth
				});
			_this.httpsget(progress, (body) => {
				var obj = JSON.parse(body);
				// console.log(obj);
				if (!obj.finished) {
					looee();
				} else {
					console.log(111111111111111)
						// console.log(typeof cb)
					cb();
				}
			});
		}())

	}
}

const pcloud = new Pcloud();
pcloud

// .getauth()	
.readUploadUrl()
// .getDownloadUrl()

// var fd = fs.openSync(path.join(__dirname,
// 			'../',
// 			"Machine Learning Foundations (機器學習基石)"),'r');
// var buf = new Buffer(1024);
// var read_so_far = fs.readSync(fd,buf,2,515);
// console.log(read_so_far)
// console.log(buf.toString('utf8',0,read_so_far));

class Panopto extends Utils {
	constructor(id) {
		super();
		this.id = id
		this.panoptoUrl2 = 'https://scs.hosted.panopto.com/Panopto/PublicAPI/4.1/ListSessions?' +
			this.mkqs({
				'folderID': 'b96d90ae-9871-4fae-91e2-b1627b43e25e'
			});

		this.panoptoUrl = 'https://scs.hosted.panopto.com/Panopto/Podcast/Podcast.ashx?' +
			this.mkqs({
				// 'courseid':'b96d90ae-9871-4fae-91e2-b1627b43e25e', //2015 fall 15-213 Introduction to Computer Systems
				// 'courseid': '2be55024-d2d3-4a3c-ac9c-9b348ddce5c4', //2015 summer 15-213 Introduction to Computer Systems
				// 'courseid': '4b73b1cc-afb6-4f6b-96c0-476a24527e3e', //2006 Fall: 10-601 Artificial Intelligence: Machine Learning
				// 'courseid': 'ed2ee867-9610-4bad-94af-5d12c2ea47cd', //2016 Spring: 15-721 Database Systems:
				// 'courseid': 'e0adbd1d-f211-49da-9231-871360c2a1f6', //2013 Spring: 15-251 Great Theoretical Ideas in Computer Science
				// 'courseid': '85e1b6bf-6ac9-4a92-a0de-aaf8c2dd2418', //2011 Spring 10-701: Machine Learning
				// 'courseid':'07756bb0-b872-4a4a-95b1-b77ad206dab3', //2013 Fall: 15-819 Advanced Topics in Programming Languages
				'courseid':'f62c2297-de88-4e63-aff2-06641fa25e98', //2016 Spring: 15-418 Parallel Computer Architecture and Programming
				'type': 'mp4',
			});
	}
	panoptoDo() {
		this.httpsget(this.panoptoUrl, (body) => {
			var resultData = '';
			parseString(body, (err, result) => {
				var item = result.rss.channel[0].item;
				for (var i of item) {
					resultData += i.guid[0] +
						'?title=' + encodeURIComponent(i.title[0].replace(/[\\\/:\*\?<>|"]/g, "")) +
						'\n';
				}
			});
			wf.writeIntoFile("panoptoDownloadUrl", resultData, 1);
		});
	}
	renameFile() {
		fs.readFile(path.join(__dirname, './panoptoDownloadUrl'), (err, data) => {
			const buf2 = new Buffer(data);
			const arr = buf2.toString().split('\n');
			const re2 = /\/([^\/]+)(?:\/?)\.mp4\?title=(.*)/;
			const dir = "/Volumes/D-1/Parallel Computer Architecture and Programming/machine learning";

			for (var i of fs.readdirSync(dir)) {
				for (var k of arr) {
					k.replace(re2, (m, p1, p2, p3) => {
						if (new RegExp(p1).test(i)) {
							fs.renameSync(path.resolve(dir, i),
								path.resolve(dir, decodeURIComponent(p2) + ".mp4"));
							console.log(p1);
							console.log(i);
						}

					});
				}
			}
		});

		return this;
	}
	getid() {
		this.t(this.id);
		return this;
	}
	t(val) {
		console.log(val);
		return this;
	}
}
// const pp = new Panopto(1);
// pp
// // .t(pp.panoptoUrl)
// .panoptoDo()
// .renameFile()



//  var aaa = ['a','b','c'];
// function* count(){
//   while(1) {
//     yield aaa.shift();
//   }
// }

// for (var x of count()) {
//   if(aaa.length)
//   	console.log(x)
// }