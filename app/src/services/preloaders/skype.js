require('./utils/spellcheck.js');
require('./utils/zoom.js');
const { ipcRenderer } = require('electron');
const { shell } = require('electron');

let jq = null;


var notificationMap = {};

var service = null;
var globalNotification = true;

function getMessages() {
    var e = document['getElementsByClassName']('counter'),
        t = e['length'];

    ipcRenderer['sendToHost']('notification-count', {
        count: t
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


function testAnchor(jq) {



    jq(document).on('click', 'a[href^="http"]', function(event) {
        console.log('href listener')
        event.preventDefault();
    });
    setInterval(function() {
        //jq('a').attr('onclick', 'window.urlHandler(event)')
        window.jq('a').map(function(element) {
            // console.log('element' + element);
            console.log('element on click' + this.getAttribute('onclick'));
            var onclickMethod = this.getAttribute('onclick');
            if (onclickMethod == 'return false;') {
                this.setAttribute('onclick', 'window.urlHandler(event)');
            }
        });
    }, 2000);
}

let urlHandler = function($event) {
    $event.preventDefault();

    console.log('urlHandler called' + $event);
    var url = $event.srcElement.href;
    if (url) {
        $event.stopPropagation();
        $event.stopImmediatePropagation();
        shell.openExternal(url);
    }
}

window.urlHandler = urlHandler;



skype = {
    init: function(serviceConfig) {
        service = JSON.parse(serviceConfig);
        setInterval(getMessages, 1000);
        initNotificationProxy();
        initIpcListener();

        setTimeout(() => {
            jq = require('jquery');
            window.jq = jq;
            console.log('am called');
            testAnchor(jq);
        }, 2000);

        console.log("skype preloader initialized" + service);
    }
}
