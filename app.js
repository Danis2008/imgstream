
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , imgur = require('./imgur.js')
  , flickr = require('./flickr.js')
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

app.get('/', routes.index);

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

setTimeout(function() {
    setInterval(function() {imgur.poll(imgur.feeds.new, function(items) {onNewItems(items, 'imgur')});}, 10000);
}, 5000);

setInterval(function() {flickr.poll(flickr.feeds.new, function(items) {onNewItems(items, 'flickr')});}, 10000);

