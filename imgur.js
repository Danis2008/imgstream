
var http = require('http');

exports.poll = function(callback) {
    var request = http.get('http://imgur.com/gallery/hot/time.json', function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            callback(JSON.parse(body));
        });
    });
}
