require('./utils/spellcheck.js');
require('./utils/zoom.js');
const { ipcRenderer } = require('electron');


var notificationMap = {};

var service = null;
var oldCount;
var globalNotification = true;

function getMessages() {

    console.log("getMessages" + document.title);
    var isMessenger = document.title.indexOf('Messenger') != -1 ? true : false;
    var count = document.title.replace("Messenger", "").replace("(", "").replace(")", "").replace(' ', '');

    if (isNaN(count)) {
        count = 0;
        return;
    }

    if (oldCount != count && isMessenger) {
        ipcRenderer['sendToHost']('notification-count', {
            count: count
        });
    }
    oldCount = count;
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


function titleModified() {
    console.log("title titleModified");
    getMessages();
}


messenger = {
    init: function(serviceConfig) {


        service = JSON.parse(serviceConfig);

        getMessages();

        window.onload = function() {
            var titleEl = document.getElementsByTagName("title")[0];
            var docEl = document.documentElement;

            if (docEl && docEl.addEventListener) {
                docEl.addEventListener("DOMSubtreeModified", function(evt) {
                    var t = evt.target;
                    if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
                        titleModified();
                    }
                }, false);
            } else {
                document.onpropertychange = function() {
                    if (window.event.propertyName == "title") {
                        titleModified();
                    }
                };
            }
        };


        initNotificationProxy();
        initIpcListener();
        console.log("messenger preloader initialized" + service);
    }
}
