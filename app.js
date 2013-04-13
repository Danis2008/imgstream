
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , imgur = require('./imgur.js')
  , flickr = require('./flickr.js')
  , instagram = require('./instagram.js')
  , http = require('http')
  , io = require('socket.io')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var io = io.listen(server);

var onNewItems = function(items, room) {
    for (var i in items) {
        items[i].room = room;
        io.sockets.in(room).emit('item', items[i]);
    }
}

io.sockets.on('connection', function (socket) {
    socket.join('imgur');

    socket.on('join', function(data) {
        socket.join(data.room);
    });

    socket.on('leave', function(data) {
        socket.leave(data.room);
    });
});

var services = [imgur, flickr, instagram];
var feeds = {};
for (var i in services) {
    var service = services[i];

    for (var j in service.feeds) {
        var feed = service.feeds[j];
        var id = feed.title.replace(/\//, '-');

        feeds[id] = feed.title;
    }

    service.enable(onNewItems);
}

console.log(feeds);

app.get('/', function(req, res){
  res.render('index', { title: 'Latest images from the internets', feeds: feeds });
});

