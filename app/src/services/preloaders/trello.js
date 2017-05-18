require('./utils/spellcheck.js');
require('./utils/zoom.js');
const { ipcRenderer } = require('electron');

var notificationMap = {};

var service = null;
var globalNotification = true;


function getMessages() {
    var newNotifications = document.getElementsByClassName('new-notifications');
    var t = 0;
    if (newNotifications.length > 0) {
        t = 1;
    }
    ipcRenderer['sendToHost']('notification-count', {
        count: 0,
        count_indirect: t
    })
}


function initNotificationProxy() {

    console.log('late invocation in trello');

    var OldNotification = window.Notification;

    OldNotification.onclick = Notification.onclick;

    var settings = {
        forceSilent: false,
        bodyOverride: undefined
    };


    window.fluid = {};

    window.fluid.showGrowlNotification = function(growlObject) {
        if ((service === null || service.showNotifications) && globalNotification) {
            console.log("trello notificationHandle");
            var title = growlObject.title;
            var options = growlObject;
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
                    var a = $('.icon-notification')[0];
                    a.click();
                    console.log('notificationclicked');
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

            return notification = new OldNotification(title, growlObject);
        }
    };


    Notification.prototype = OldNotification.prototype;
    Notification.permission = OldNotification.permission;
    Notification.requestPermission = OldNotification.requestPermission;

}

function initIpcListener() {
    ipcRenderer.on('open-notification', function(event, args) {
        console.log('am called');

        var notification = args;
        var onClickFn = notificationMap[notification.title];

        if (onClickFn) {
            console.log('inside notificationHandler');
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



trello = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        setInterval(getMessages, 1000);
        initNotificationProxy();
        //setInterval(initNotificationProxy,1000)
        initIpcListener();
        console.log("trello preloader initialized");
    }
};
