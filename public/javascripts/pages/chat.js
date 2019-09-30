$(function() {

    $('#chat-facebook_81').popover(
        {
            animation: true,
            html: true,
            placement: 'top',
            trigger: 'click',
            title: 'Inocencio',
            content: '<b>Test</b>. This is a testing',
            delay: { show: 200, hide: 200 }
        }
    );

    //adjust chat window size
    var chatSize = 430;

    $('#chat-main').height( $(window).height() - chatSize + 'px' );

    $(window).resize(function(){
        $('#chat-main').height( $(window).height() - chatSize + 'px' );
    });

    //check if web storage is available
    if (typeof(Storage) !== 'undefined') {
        //set the initial chat window position
        if ($('#user-id')) {
            if (!localStorage.chatWindow)
                localStorage.chatWindow = 'min';

            if (localStorage.chatWindow == 'min')
                noExpandChatNA();
            else if (localStorage.chatWindow == 'max')
                expandChatNA();
            else if (localStorage.chatWindow == 'hid')
                hideChat();
        }
    } else {
        //TODO warn the user when he changes the browser online
    }

});

function sendMsg() {
    var msg = $('#chat-input').val();
    var name = $('#user-name').val();
    var id = $('#user-id').val();

    if (!name && name === undefined)
        name = 'Usuário';

    //expand
    if (msg && $.trim(msg).length > 0) {
        $.get('/photo/showProfilePhotoByIdAsBase64/' + id, function(photo) {
            var div = $('<div class="media">');

            var out = '<a class="pull-left" href="#"><img class="media-object" src="' + photo + '"></a>';
            out += '<div class="media-body"><h5 class="media-heading">'+ name + ' ('+ new Date().toString('H:mm') + ')</h5>' + msg + '</div>';
            div.html(out);

            $('#chat-main').append(div);
            $('#chat-main')[0].scrollTop = $('#chat-main')[0].scrollHeight;
        });
    }

    //clean up text field
    $('#chat-input').val('');
}

//expand it
function expandChat() {
    $('#chat').animate({ width: 600 }, 400).show();
    $('#chat-input').animate({ width: 590 }, 400).show();
    localStorage.chatWindow = 'max';
}

//expand it without any animation
function expandChatNA() {
    $('#chat').width(600).show();
    $('#chat-input').width(590).show();
    localStorage.chatWindow = 'max';
}

//default size
function noExpandChat() {
    $('#chat').animate({ width: 250 }, 400).show();
    $('#chat-input').animate({ width: 240 }, 400).show();
    localStorage.chatWindow = 'min';
}

//default size without any animation
function noExpandChatNA() {
    $('#chat').width(250).show();
    $('#chat-input').width(240).show();
    localStorage.chatWindow = 'min';
}

//hide the chat
function hideChat() {
    $('#chat').animate({ width: 0 }, 400).hide();
    $('#chat-input').animate({ width: 0 }, 400).hide();
    localStorage.chatWindow = 'hid';
}