require('./utils/spellcheck.js');
require('./utils/zoom.js');
const { ipcRenderer } = require('electron');


var notificationMap = {};

var service = null;
var globalNotification = true;

function getMessages() {

    var unreads = $('.unresponded-count').not('.zero');
    var count = 0;

    if (unreads) {
        unreads.forEach(function(unread) {
            var unread_count = unread.innerHTML;
            if (!isNaN(unread_count)) {
                count = count + parseInt(unread_count);
            }
        });

        ipcRenderer['sendToHost']('notification-count', {
            count: count
        })
    }


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

            var newOptions = options;
            newOptions.icon = 'https://www.olark.com/img/common/layout/logo.svg';
            ipcRenderer.sendToHost('notification-message', {
                title: title,
                options: newOptions
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





olark = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        setInterval(getMessages, 1000);
        initNotificationProxy();
        initIpcListener();
        console.log("whatsapp preloader initialized");
    }
}
