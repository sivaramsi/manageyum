require('./utils/spellcheck.js');
require('./utils/zoom.js');


const { ipcRenderer } = require('electron');

var notificationMap = {};

var service = null;



function replacePopupWithRedirect() {
    var google_auth_button = $('google_auth_button');
    if (google_auth_button) {
        var str = google_auth_button.getAttribute('onclick');
        str = str.replace('false', 'true');
        google_auth_button.setAttribute('onclick', str);
    }
}

function getMessages() {
    var title = document.title;
    var count_indirect = 0;
    if (service.custom_badges_conf && service.custom_badges_conf.length > 0) {
        if (title.startsWith('●')) {
            count_indirect = 1;
        }
    }
    ipcRenderer['sendToHost']('notification-count', {
        count: 0,
        count_indirect: count_indirect
    })
}


function initIpcListener() {
    ipcRenderer.on('open-notification', function(event, args) {
        console.log('am called');

        var notification = args;
        var onClickFn = notificationMap[notification.title]

        if (onClickFn) {
            console.log('inside notificationHandler')
            onClickFn();
        }
    });

    ipcRenderer.on('serviceUpdate', function(event, args) {
        service = args;
    });
}


asana = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        setInterval(getMessages, 1000);
        replacePopupWithRedirect();
        initIpcListener();
        console.log("asana preloader initialized");
    }
}
