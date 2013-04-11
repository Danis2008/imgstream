
var onNewItem = function(item) {
    var element = document.createElement('li');
    var link = document.createElement('a');
    link.href = item.link;
    link.title = item.title;
    link.style.backgroundImage = "url('" + item.thumbnail + "')";
    //link.dataset.powertip = '<img src="http://i.imgur.com/' + item.id + 'l.jpg" />';

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
    $(element).powerTip();
    $(element).imagesLoaded(function() {
        $('ul').prepend(element).masonry('reload');
    });

    if ($('li').length > 100) {
        $('li:last').remove();
    }
}

$('ul').masonry({
    isAnimated: true,
    itemSelector: 'a'
});

var socket = io.connect();

socket.emit('join', {room: 'imgur'});

socket.on('item', onNewItem);

$('#filter input').change(function() {
    if ($(this).is(':checked')) {
        socket.emit('join', {room: $(this).attr('id')});
    } else {
        socket.emit('leave', {room: $(this).attr('id')});
    }
});
