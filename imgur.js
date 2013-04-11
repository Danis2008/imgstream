
var http = require('https');

var lastdate = 0;

exports.feeds = {
    test: {
        host: 'erebus.seos.fr',
        port: '5555',
        path: '/plop.json',
        method: 'GET',
        headers: {
            'Authorization': 'Client-Id 121b759f2669cea',
        }
    },
    new: {
        host: 'api.imgur.com',
        port: '443',
        path: '/3/gallery/user/time/?showViral=true',
        method: 'GET',
        headers: {
            'Authorization': 'Client-Id 121b759f2669cea',
        }
    }
};

exports.poll = function(feed, callback) {
    var request = http.request(feed, function(res) {
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
            }
        });
    });
    request.end();
    request.on('error', function(error) {
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
            newItems.push({
                title: item.title,
                thumbnail: 'http://i.imgur.com/' + item.id + 'm.jpg',
                link: 'http://i.imgur.com/' + item.id + '.jpg',
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
