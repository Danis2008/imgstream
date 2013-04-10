console.log('Plop');

var socket = io.connect();

socket.on('item', function(data) {
    console.log(data);
});
