require('./utils/spellcheck.js');
require('./utils/zoom.js');
var path = require('path');
var fs = require('fs');

const {
    ipcRenderer
} = require('electron');
var remote = require('electron').remote;
var webContents = remote['getCurrentWebContents']();

var notificationHandler;

var notificationMap = {};
var service = null;
var globalNotification = true;

slack = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        console.log('am in preload' + service);

        setInterval(getMessages, 1000);
        initNotificationProxy();
        initIpcListener();
        injectCSS();
        setTimeout(function() {
            getTeamIcon()
        }, 4e3)

    }
}


function injectCSS() {
    var e = path['join'](__dirname, 'css', 'slack.css');
    fs['readFile'](e, function(e, t) {
        t && !e && webContents['insertCSS'](t.toString())
    })
}


function getTeamIcon() {
    var e = arguments['length'] <= 0 || void(0) === arguments[0] ? 0 : arguments[0];
    $('#team_menu')['click'](), e++;
    var t = $('.team_icon')['css']('background-image');
    t = /^url\((['"]?)(.*)\1\)$/ ['exec'](t), t = t ? t[2] : '', t ? ipcRenderer['sendToHost']('avatar-slack', {
        url: t
    }) : 3 >= e && setTimeout(function() {
        getTeamIcon(e++)
    }, 1e3), setTimeout(function() {
        $('.team_menu')['remove'](), $('#message-input')['focus']()
    }, 10)
}




function getMessages() {
    var e = $('.unread_highlights, .unread_highlight')['not']('.hidden')['length'],
        t = $('.unread')['length'] - e;
    // console.log('sending notification count to manageyum');

    ipcRenderer.sendToHost('notification-count', {
        count: e,
        count_indirect: t
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
                    console.log('notificationclicked' + onclickOld)
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
            onClickFn()
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

    ipcRenderer.on('slack-blur', function(event, args) {
        setTimeout(() => {
            TS.model.ui.is_window_focused = false;
            console.log('window blurred' + TS.model.ui.is_window_focused);
        }, 1000);
    });
}
