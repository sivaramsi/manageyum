angular.module('puraApp').component('serviceslist', {
    templateUrl: './src/servicesList/servicesList.html',
    controller: servicesListController,
    bindings: {}
});


function servicesListController($sce, $uibModal, User, $log, Services, User, $rootScope, hotkeys, $analytics) {
    var self = this;

    this.availableServices = Services.get();

    this.customService = _.find(this.availableServices, { name: 'custom_app' });



    function initHotKeys() {
        hotkeys.add({
            combo: 'esc',
            description: 'This one goes to 11',
            callback: function() {
                console.log("am called");
                self.close();
            }
        });
    }


    initHotKeys();



    this.trustSrc = (src) => {
        return $sce.trustAsResourceUrl(src);
    }

    this.close = () => {
        $rootScope.$broadcast('closeServiceList', {});
    }

    this.openAddServiceModal = (service) => {

        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/addNewService.html',
            controller: 'addServiceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                service: function() {
                    return service;
                }
            }
        });

        modalInstance.result.then(function(serviceData) {
            console.log('serviceData' + serviceData);
            User.addService(serviceData);
            $analytics.eventTrack('new_service', { service_name: serviceData.name });
            if (serviceData.is_custom_app) {
                $analytics.eventTrack('custom_app', { service_name: serviceData.label });
            }
            self.close();
        }, function() {
            $log.info('modal-component dismissed at: ' + new Date());
        });
    }
}



angular.module('puraApp').controller('addServiceCtrl', function($uibModalInstance, service, Services, User) {
    var $ctrl = this;
    $ctrl.service = service;

    $ctrl.showNotifications = true;
    $ctrl.isActive = true;
    $ctrl.profiles = User.getProfiles();
    $ctrl.selectedProfile = {};
    $ctrl.selectedProfile.name = "All Apps";


    if (!$ctrl.service.is_custom_app) {

        $ctrl.name = service.name;
    }

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };


    $ctrl.selectProfile = function(profile) {
        $ctrl.selectedProfile = profile;
    }


    $ctrl.addService = function() {

        let userServices = User.getServices();

        var service = null;
        service = angular.copy($ctrl.service);

        service.label = $ctrl.name;
        service.showNotifications = $ctrl.showNotifications;
        service.isActive = $ctrl.isActive;
        service.uuid = Date.now().toString();
        if (service.isSubdomain) {
            service.baseURL = 'https://' + $ctrl.domain + $ctrl.service.baseURL;
        }
        if ($ctrl.customURL && $ctrl.needCustomURL) {
            if ($ctrl.customURL.indexOf("http://") == 0 || $ctrl.customURL.indexOf("https://") == 0) {
                service.baseURL = $ctrl.customURL;
            } else {
                service.baseURL = 'https://' + $ctrl.customURL;
            }
        }
        if ($ctrl.service.is_custom_app) {
            if ($ctrl.customAppURL.indexOf("http://") == 0 || $ctrl.customAppURL.indexOf("https://") == 0) {
                service.baseURL = $ctrl.customAppURL;
            } else {
                service.baseURL = 'https://' + $ctrl.customAppURL;
            }
        }
        $uibModalInstance.close(service);

        if($ctrl.selectedProfile.name != 'All Apps'){
            $ctrl.selectedProfile.services.push(service);
            User.updateProfile($ctrl.selectedProfile);
        }
    }
})
