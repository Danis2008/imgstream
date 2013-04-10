
var onNewItem = function(item) {
    var element = document.createElement('li');
    var link = document.createElement('a');
    link.href = 'http://i.imgur.com/' + item.id + '.gif';
    link.title = item.title;
    link.style.backgroundImage = "url('http://i.imgur.com/" + item.id + "m.jpg')";

    if (item.width/item.height > 1.3) {
        // horizontal
        link.style.height = '160px';
        link.style.width = '330px';
    } else if (item.height/item.width > 1.3) {
        //vertical
        link.style.height = '330px';
        link.style.width = '160px';
    } else {
        //square
        link.style.height = '160px';
        link.style.width = '160px';
    }

    element.appendChild(link);
    $(element).imagesLoaded(function() {
        $('ul').prepend(element).masonry('reload');
    });
}

$('ul').masonry({
    isAnimated: true,
    itemSelector: 'a'
});

var socket = io.connect();

socket.on('item', onNewItem);
