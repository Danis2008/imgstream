
var http = require('http')
  , redis = require('redis');

var db = redis.createClient();

exports.poll = function(callback) {
    var request = http.get('http://imgur.com/gallery/hot/time.json', function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            processStream(JSON.parse(body).data, callback);
        });
    });
}

var processStream = function(items, callback) {
    var newItems = Array();

    db.hget('imgur', 'lastdate', function(err, reply) {
        var lastdate = 0;

        if (reply) {
            lastdate = reply;
        }

        var latest = lastdate;

        for (var i in items) {
            var item = items[i];
            var date = Date.parse(item.hot_datetime);
            if (date > lastdate) {
                latest = Math.max(date, latest);
                newItems.push(item);
            }
        }

        newItems.sort(function(a, b) {
            var datea = Date.parse(a.hot_datetime);
            var dateb = Date.parse(b.hot_datetime);
            return datea - dateb;
        });

        callback(newItems);

        db.hset('imgur', 'lastdate', latest);
    });
}
