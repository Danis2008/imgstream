
var https = require('https')
  , http = require('http');

var lastdate = 0;

exports.feeds = {
    new: {
        title: 'imgur',
        period: 7000,
        host: 'api.imgur.com',
        port: '443',
        path: '/3/gallery/user/time/?showViral=true',
        method: 'GET',
        headers: {
            'Authorization': 'Client-Id 121b759f2669cea',
        }
    },
    funny: {
        title: 'r/funny',
        period: 30000,
        host: 'imgur.com',
        port: '80',
        path: '/r/funny.json',
        method: 'GET'
    },
    earthporn: {
        title: 'r/earthporn',
        period: 120000,
        host: 'imgur.com',
        port: '80',
        path: '/r/earthporn.json',
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
    var proto = http;
    if (feed.port == '443') {
        proto = https;
    }
    var request = proto.request(feed, function(res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            try {
                var json = JSON.parse(body);
                processStream(json.data, callback);
            }
            catch (e) {
                console.log('Exception handling ' + feed.title);
                console.log(e);
            }
        });
    });
    request.end();
    request.on('error', function(error) {
        console.log('HTTP error on handling ' + feed.title);
        console.log(error);
    });
}

var processStream = function(items, callback) {
    var newItems = Array();

    var latest = lastdate;

    for (var i in items) {
        var item = items[i];
        if (item.datetime > lastdate && !item.is_album) {
            latest = Math.max(item.datetime, latest);
            var extension = 'jpg';
            switch (item.type) {
                case 'image/gif':
                    extension = 'gif';
                    break;
                case 'image/png':
                    extension = 'png';
                    break;
            }
            newItems.push({
                title: item.title,
                thumbnail: 'http://i.imgur.com/' + item.id + 'm.' + extension,
                link: 'http://i.imgur.com/' + item.id + '.' + extension,
                width: item.width,
                height: item.height
            });
        }
    }

    newItems.sort(function(a, b) {
        return a.datetime - b.datetime;
    });

    callback(newItems);

    lastdate = latest;
}
