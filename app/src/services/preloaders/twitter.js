require('./utils/spellcheck.js');
require('./utils/zoom.js');
const { ipcRenderer } = require('electron');


var notificationMap = {};

var service = null;
var globalNotification = true;

function getMessages() {

    var count = 0;

    var notifications = $('.notifications .count-inner')[0];
    var peopleNav = $('.global-nav .people .count')[0];
    var isPeopleCountDisplayed = $(peopleNav).css('display') != 'none' ? true : false;

    if (notifications && notifications.innerHTML.length > 0 && isPeopleCountDisplayed) {
        count = parseInt(notifications.innerHTML);
    }
    
    var dmNotifs = $('.dm-nav .count-inner')[0];
    var dmNav = $('.global-dm-nav .dm-new')[0]
    var isCountDisplayed = $(dmNav).css('display') != 'none' ? true : false;
    if (dmNotifs && dmNotifs.innerHTML.length > 0 && isCountDisplayed) {
        count = count + parseInt(dmNotifs.innerHTML);
    }

    ipcRenderer['sendToHost']('notification-count', {
        count: count
    });

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


    ipcRenderer.on('redirect-url', function(event, args) {
        console.log('am called')
        var url = args;
        window.location.assign(args);
    });

    ipcRenderer.on('serviceUpdate', function(event, args) {
        service = args;
    });
    ipcRenderer.on('global-notification', function(event, args) {
        console.log("global-notification changed");
        globalNotification = args;
    });
}





twitter = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        setInterval(getMessages, 1000);
        initNotificationProxy();
        initIpcListener();
        console.log("twitter preloader initialized");
    }
}
