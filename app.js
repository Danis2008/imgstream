
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , imgur = require('./imgur.js')
  , redis = require('redis')
  , http = require('http')
  , io = require('socket.io')
  , path = require('path');

var app = express();
var db = redis.createClient();

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

var onNewItems = function(items) {
    for (var i in items) {
        io.sockets.emit('item', items[i]);
    }
}

setInterval(function() {imgur.poll(imgur.feeds.new, onNewItems);}, 6000);

