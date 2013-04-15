
var http = require('http');

var lastid = 0;

exports.feeds = {
    new: {
        title: 'flickr',
        period: 5000,
        host: 'api.flickr.com',
        port: '80',
        path: '/services/rest/?method=flickr.photos.getRecent&' +
            'api_key=bf20b2a6d20ec51d467a53a3b94dadc6&' +
            'extras=geo%2Ctags%2Curl_m%2Curl_l&' +
            'per_page=100&page=10&format=json&nojsoncallback=1',
        method: 'GET'
    }
};

exports.enable = function(callback) {
    for (var i in exports.feeds) {
        var feed = exports.feeds[i];
        setTimeout((function(feed) {return function() {
            exports.poll(feed, function(items) {
                callback(items, feed.title);
            });}})(feed),
            Math.random() * feed.period / 10);
        setInterval((function(feed) {return function() {
            exports.poll(feed, function(items) {
                callback(items, feed.title);
            });}})(feed),
            feed.period);
    }
}

exports.poll = function(feed, callback) {
    console.log('Polling: ' + feed.host + ':' + feed.port + feed.path);
    var request = http.request(feed, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            try {
                var json = JSON.parse(body);
                processStream(json.photos, callback);
            }
            catch (e) {
                console.log('Exception handling Flickr items');
                console.log(e);
            }
        });
    });
    request.end();
    request.on('error', function(error) {
        console.log(error);
    });
}

var base58 = (function(alpha) {
    var alphabet = alpha || '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
    base = alphabet.length;
    return {
        encode: function(enc) {
            if(typeof enc!=='number' || enc !== parseInt(enc))
                throw '"encode" only accepts integers.';
            var encoded = '';
            while(enc) {
                var remainder = enc % base;
                enc = Math.floor(enc / base);
                encoded = alphabet[remainder].toString() + encoded;
            }
            return encoded;
        },
        decode: function(dec) {
            if(typeof dec!=='string')
                throw '"decode" only accepts strings.';
            var decoded = 0;
            while(dec) {
                var alphabetPosition = alphabet.indexOf(dec[0]);
                if (alphabetPosition < 0)
                    throw '"decode" can\'t find "' + dec[0] + '" in the alphabet: "' + alphabet + '"';
                var powerOf = dec.length - 1;
                decoded += alphabetPosition * (Math.pow(base, powerOf));
                dec = dec.substring(1);
            }
            return decoded;
        }
    };
})();

var processStream = function(items, callback) {
    var newItems = Array();

    var latest = lastid;

    for (var i in items.photo) {
        var item = items.photo[i];
        if (item.id > lastid) {
            latest = Math.max(item.id, latest);
            var geo = undefined;
            if (item.latitude && item.longitude) {
                geo = {latitude: item.latitude, longitude: item.longitude};
            }
            newItems.push({
                title: item.title,
                thumbnail: item.url_m,
                link: 'http://flic.kr/p/' + base58.encode(parseInt(item.id)),
                width: item.width_l,
                height: item.height_l,
                tags: item.tags.split(/ /),
                geo: geo
            });
        }
    }

    newItems.sort(function(a, b) {
        return a.id - b.id;
    });

    callback(newItems);

    lastid = latest;
}
