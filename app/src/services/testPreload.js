test = {
    init: function() {
        console.log('am in preload');
        // Notification.onshow = function() {
        //     console.log("new notification in preload");
        // };
        // Notification.onclick = function() {
        //     console.log("new notification clicked in preload");
        // };
        var OldNotification = Notification;

        Notification = function(title, options) {
            // Send this to main thread.
            // Catch it in your main 'app' instance with `ipc.on`.
            // Then send it back to the view, if you want, with `event.returnValue` or `event.sender.send()`.
            // ipc.send('notification-shim', {
            //     title,
            //     options
            // });
            console.log('catches notification');

            // Send the native Notification.
            // You can't catch it, that's why we're doing all of this. :)
            return OldNotification(title, options);
        };
        Notification.prototype = OldNotification.prototype;
        Notification.permission = OldNotification.permission;
        Notification.requestPermission = OldNotification.requestPermission;

        document.addEventListener('notificationclick', function() {
            console.log('notificationclicked');
        })
    }
}
