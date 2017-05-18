require('./utils/spellcheck.js');
require('./utils/zoom.js');
const { ipcRenderer } = require('electron');

var notificationMap = {};
var service = null;

var globalNotification = true;

// function getMessages() {
//     var e = 0;
//     document['getElementsByClassName']('zA zE')['length'] > 0 && (e = document['getElementsByClassName']('zA zE')['length']),
//         document['getElementsByClassName']('J-Ke n0')['length'] > 0 && (null != document['getElementsByClassName']('J-Ke n0')[0]['getAttribute']('aria-label') && (e = parseInt(document['getElementsByClassName']('J-Ke n0')[0]['getAttribute']('aria-label')['replace'](/[^0-9.]/g, ''))),
//             null != document['getElementsByClassName']('J-Ke n0')[0]['getAttribute']('title') && (e = parseInt(document['getElementsByClassName']('J-Ke n0')[0]['getAttribute']('title')['replace'](/[^0-9.]/g, '')))),
//         isNaN(e) && (e = 0),
//         ipcRenderer['sendToHost']('notification-count', {
//             count: e
//         })
// }

function getMessages() {
    var e = 0;
    document['getElementsByClassName']('DsPmj')['length'] > 0 && (e = document['getElementsByClassName']('DsPmj')[0]['querySelectorAll']('div.G3')['length']), 
    ipcRenderer['sendToHost']('notification-count', {
        count: e
    })
}



function initNotificationProxy() {

    var OldNotification = Notification;

    OldNotification.onclick = Notification.onclick;

    var settings = {
        forceSilent: false,
        bodyOverride: undefined
    };

    Notification = function(title, options) {

        if ((service === null || service.showNotifications) && globalNotification) {

            ipcRenderer.sendToHost('notification-message', {
                title: title,
                options: options
            });


            var notification;
            setTimeout(() => {

                var onclickOld = notification.onclick;
                notificationMap[title] = onclickOld;
                notification.onclick = function() {
                    ipcRenderer.sendToHost('notification-click', {});
                    console.log('notificationclicked')
                    if (onclickOld) onclickOld();
                };
            }, 1);

            // Apply overrides              // Apply overrides
            options = Object.assign({}, options);
            options = Object.assign({}, options);
            if (settings.forceSilent) options.silent = true;
            if (settings.forceSilent) options.silent = true;
            if (settings.bodyOverride) options.body = settings.bodyOverride;
            if (settings.bodyOverride) options.body = settings.bodyOverride;

            return notification = new OldNotification(title, options);
        }
    };


    Notification.prototype = OldNotification.prototype;
    Notification.permission = OldNotification.permission;
    Notification.requestPermission = OldNotification.requestPermission;

}


function initIpcListener() {
    ipcRenderer.on('open-notification', function(event, args) {
        console.log('am called')
        var notification = args;
        var onClickFn = notificationMap[notification.title]
        if (onClickFn) {
            console.log('inside notificationHandler')
            onClickFn();
            //notificationHandler();
        }
    });
    ipcRenderer.on('serviceUpdate', function(event, args) {
        service = args;
    });
    ipcRenderer.on('global-notification', function(event, args) {
        console.log("global-notification changed");
        globalNotification = args;
    });
}



inbox = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        console.log("inbox preloader initialized");
        setInterval(getMessages, 1000);
        initNotificationProxy();
        initIpcListener();
    }
}
