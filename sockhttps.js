var shttps = require('socks5-https-client');
 
exports.httpreq = function (options, postData, cb) {
  options.headers={
'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27',

    'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    // 'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-us,en;q=0.5'
    };
  var req = shttps.request(options, (res) => {
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
