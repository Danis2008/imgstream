
var enabledTags = [];
var disabledTags = [];

var updateHeadline = function() {
    var headline = '';

    if (enabledTags.length) {
        headline = 'Tagged <em>' + enabledTags.join(', ') + '</em>';
    } else {
        headline = 'Everything';
    }

    if (disabledTags.length) {
        headline += ' excluding those tagged <em>' + disabledTags.join(', ') + '</em>';
    }

    var streams = [];
    $('#filter input[type="checkbox"]').each(function() {
        if ($(this).is(':checked')) {
            var label = $('label[for="' + $(this).attr('id') + '"]');
            streams.push(label[0].outerHTML);
        }
    });

    headline += ' from ' + streams.join(', ');

    $('h2').html(headline);
}

var onNewItem = function(item) {
    if (enabledTags.length) {
        for (var i in enabledTags) {
            for (var j in item.tags) {
                if (enabledTags[i] == item.tags[j]) {
                    var found = true;
                    break;
                }
            }
        }

        if (!found) {
            return;
        }
    }

    if (disabledTags.length) {
        for (var i in disabledTags) {
            for (var j in item.tags) {
                if (disabledTags[i] == item.tags[j]) {
                    return;
                }
            }
        }
    }

    var element = document.createElement('li');
    var link = document.createElement('a');
    link.href = item.link;
    link.title = item.title;
    link.target = '_blank';
    //link.style.backgroundImage = "url('" + item.thumbnail + "')";
    link.className = item.room;

    var tags = item.room;

    if (undefined != item.geo) {
        console.log(item.geo);
        tags += ' geo';
    }

    link.innerHTML = "<img src='" + item.thumbnail + "' /><span class='tags " + tags + "'>" + item.room + "</span>";
    //link.dataset.powertip = '<img src="http://i.imgur.com/' + item.id + 'l.jpg" />';

    /*
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
    */

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

socket.on('item', onNewItem);

socket.on('disconnect', function() {
    socket.on('connect', function() {
        $('#filter input').each(function() {
            if ($(this).is(':checked')) {
                socket.emit('join', {room: $(this).attr('id')});
            } else {
                socket.emit('leave', {room: $(this).attr('id')});
            }
        });
    });
});

$('#filter input[type="checkbox"]').change(function() {
    if ($(this).is(':checked')) {
        socket.emit('join', {room: $(this).attr('id')});
    } else {
        socket.emit('leave', {room: $(this).attr('id')});
    }

    updateHeadline();
}).change();

$('#submit').click(function() {
    var tags = [];
    var val = $('#tags').val();
    if (val != '') {
        tags = val.split(/,/);
    } else {
        tags = [];
    }

    enabledTags = [];
    disabledTags = [];
    for (var i in tags) {
        var tag = tags[i].trim();
        if (tag[0] == '-') {
            disabledTags.push(tag.substr(1));
        } else {
            enabledTags.push(tag);
        }
    }

    socket.emit('tags', {tags: enabledTags});

    updateHeadline();
});

$('form').submit(function() {return false;});

