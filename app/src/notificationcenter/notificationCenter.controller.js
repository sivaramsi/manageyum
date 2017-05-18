angular.module('puraApp').component('notificationcenter', {
    templateUrl: './src/notificationcenter/notificationCenter.html',
    controller: notificationCenterCtrl,
    bindings: {}
});


function notificationCenterCtrl($sce, $uibModal, User, $log, Services, $rootScope) {
    var self = this;
    this.notifications = User.getNotifications();

    $rootScope.$on('refreshNotificationCenter', (event, args) => {
        this.notifications = User.getNotifications();
    });

    function getNotificationsForServices(services) {
        let notifications = User.getNotifications();
        let tempNotifications = [];
        angular.forEach(notifications, (notification) => {
            let service = _.find(services, { uuid: notification.uuid });
            if (service) {
                tempNotifications.push(notification);
            }
        });
        return tempNotifications;
    }

    this.refreshNotifications = function() {
        let activeProfile = User.getLastSelectedProfile();
        if (activeProfile) {
            let services = activeProfile.services;
            this.notifications = getNotificationsForServices(services);
            return;
        }
        this.notifications = User.getNotifications();
    }

    $rootScope.$on('profileChanged', (event, newService) => {
        this.refreshNotifications();
    });


    this.onNotificationClick = function(service, notification) {
        $rootScope.$broadcast('notificationClicked', { service: service, notification: notification });
    }

    this.closeNotification = function(service) {
        let index = self.notifications.indexOf(service);
        if (index > -1) {
            self.notifications.splice(index, 1);
        }
        $rootScope.$broadcast('refreshNotificationCenter', { service: service });
    }

    this.openShareModal = function() {
        $rootScope.$broadcast('openShareModal', {});

    }
}
