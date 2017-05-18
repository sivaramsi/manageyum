var machineId = require('electron-machine-id');

angular.module('puraApp').component('enabledservices', {
    templateUrl: './src/enabledServices/enabledServices.html',
    controller: enabledServicesController,
    bindings: {}
});



function enabledServicesController($sce, $uibModal, User, $log, Services, User, $rootScope, shell, remote) {



    this.launchOnStartup = User.getAutoLaunch();

    this.launchChange = () => {
        User.setAutoLaunch(this.launchOnStartup);
        $rootScope.$broadcast('autolaunchchange', {});
    };

    this.editService = (service) => {

        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/editService.html',
            controller: 'editServiceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                service: function() {
                    return service;
                },
                activeProfile: function() {
                    return User.getLastSelectedProfile();
                }
            }
        });

        modalInstance.result.then(function(serviceData) {
            console.log('serviceData' + serviceData);
        }, function() {
            $log.info('modal-component dismissed at: ' + new Date());
        });
    }

    this.getServices = function() {
        let activeProfile = User.getLastSelectedProfile();
        if (activeProfile) {
            this.enabledServices = activeProfile.services;
            this.mainLabel = activeProfile.name;
            return;
        }
        this.enabledServices = User.getServices();
        this.mainLabel = 'All Apps';
    }

    this.getServices();

    this.getHelp = function() {
        shell.openExternal('http://docs.manageyum.com');
    }


    $rootScope.$on('newService', (event, newService) => {
        this.enabledServices = this.getServices();
    });

    $rootScope.$on('homeNavIndexChanged', (event, index) => {
        if (index.index == 2) {
            this.getServices();
            this.currentPlan = User.getCurrentPlan();
            console.log('homenavindexchanged' + index);
        }
    });

    $rootScope.$on('profileChanged', (event, newService) => {
        this.getServices();
    });

    $rootScope.$on('serviceUpdated', (event, newService) => {
        this.getServices();
    });

    $rootScope.$on('serviceDeleted', (event, newService) => {
        this.getServices();
    });

    $rootScope.$on('showReferralModal', (event, newService) => {
        this.showReferral(true);
    });

    $rootScope.$on('showRegistrationModal', (event, newService) => {
        this.showRegistration(true);
    });





    this.openShareModal = function() {
        $rootScope.$broadcast('openShareModal', {});

    }


    this.showSubscription = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/subscription.html',
            controller: 'subscriptionCtrl',
            controllerAs: '$ctrl'
        });
    }

    this.showReferral = function(disableClose) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/referModal.html',
            controller: 'referralCtrl',
            controllerAs: '$ctrl',
            resolve: {
                disableClose: () => {
                    return disableClose;
                }
            }
        });
    }

    this.showRegistration = function(disableClose) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/registerModal.html',
            controller: 'registerModalCtrl',
            controllerAs: '$ctrl',
            resolve: {
                disableClose: () => {
                    return disableClose;
                }
            }
        });
    }

    this.buyNow = function() {
        window.open('https://manageyum.com/pricing.html', '_blank');
    }

    this.getExpiredDate = function(dateStr) {
        var expiryDate = new Date(dateStr);
        var oneDay = 24 * 60 * 60 * 1000;
        var diffDays = Math.round(Math.abs((expiryDate.getTime() - Date.now()) / (oneDay)));
        return diffDays + ' days trial left';
    }


    this.clearCache = function() {
        var win = remote.getCurrentWindow();
        win.webContents.session.clearCache(function() {
            //some callback.
            console.log('cache cleared');
        });
    }
}


angular.module('puraApp').controller('editServiceCtrl', function($uibModalInstance, service, Services, User, activeProfile) {
    var $ctrl = this;
    $ctrl.service = service;


    $ctrl.availableServices = Services.get();

    let masterService = _.find($ctrl.availableServices, {
        name: service.name
    });
    if (masterService && masterService.custom_badges) {
        $ctrl.service.custom_badges = masterService.custom_badges;
    }

    if (typeof service.showNotifications == 'undefined' || service.showNotifications) {
        service.showNotifications = true;
    }

    if (typeof service.isActive == 'undefined' || service.isActive) {
        service.isActive = true;
    }

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.saveService = function() {
        if (activeProfile) {
            User.updateProfileService(activeProfile.uuid, $ctrl.service);
            $uibModalInstance.close($ctrl.service);
            return;
        }
        User.updateService($ctrl.service);
        $uibModalInstance.close($ctrl.service);
    }
    $ctrl.deleteService = function() {
        User.deleteService($ctrl.service);
        $uibModalInstance.close($ctrl.service);
    }
})


angular.module('puraApp').controller('subscriptionCtrl', function($uibModalInstance, User) {
    var $ctrl = this;
    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.doSubscribe = function() {
        User.subscribe($ctrl.email);
        $uibModalInstance.dismiss('cancel');
    }
})

angular.module('puraApp').controller('referralCtrl', function($uibModalInstance, User, md5, disableClose, shell) {
    var $ctrl = this;
    $ctrl.disableClose = disableClose;
    var referralEmailId = User.getReferralEmail();
    if (referralEmailId) {
        let referralhash = md5.createHash(referralEmailId);
        $ctrl.referralLink = 'http://manageyum.com?ref=' + referralhash;
        User.getReferralDownloads({
            referralHash: referralhash
        }).then((data) => {
            $ctrl.downloads = data.data;
        })
    }


    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.generateReferalLink = function() {
        let referralhash = md5.createHash($ctrl.email);
        User
            .addReferralToServer({
                email: $ctrl.email,
                referralHash: referralhash
            })
            .then((response) => {
                $ctrl.referralLink = 'http://manageyum.com?ref=' + referralhash;
                User.setReferralEmail($ctrl.email);
            });
    }

    $ctrl.share = function(appName) {
        var href = '';
        switch (appName) {
            case 'facebook':
                href = 'https://www.facebook.com/sharer/sharer.php?u=' + $ctrl.referralLink;
                break;
            case 'twitter':
                href = "https://twitter.com/intent/tweet?status=I've added 2 services to manageyum! Get the free desktop app for Trello, Slack, Whatsapp and more at " + $ctrl.referralLink + " @manageyum";
                break;
            case 'email':
                href = "mailto:?body=I've added 2 services to manageyum! Get the free desktop app for Trello, Slack, Whatsapp and more at " + $ctrl.referralLink;
                break;
        }
        shell.openExternal(href);
    }


})


angular.module('puraApp').controller('registerModalCtrl', function($uibModalInstance, User, md5, disableClose) {
    var $ctrl = this;
    $ctrl.disableClose = disableClose;
    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.registerProduct = function() {
        let appInstallHash = machineId.machineIdSync();
        console.log('registerProduct');
        User
            .registerProduct({
                email: $ctrl.email,
                app_key: $ctrl.appKey,
                appInstallHash: appInstallHash
            })
            .then((response) => {
                console.log('registerProduct done');
            });
    }

})
