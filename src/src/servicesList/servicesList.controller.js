

angular.module('puraApp').component('serviceslist', {
    templateUrl: './src/servicesList/servicesList.html',
    controller: servicesListController,
    bindings: {}
});


function servicesListController($sce, $uibModal, User, $log, Services, User) {


    this.availableServices = Services.get();


    this.servicesList = [
        { name: 'trello', serviceURL: 'trello.com/login', isTeamRequired: false },
        { name: 'freshdesk', serviceURL: '.freshdesk.com', isTeamRequired: true }
    ];

    // Initialize the scope functions
    // { name: 'trello', app_url: 'https://trello.com/login' },
    //     { name: 'freshdesk', app_url: 'https://infinitewp.freshdesk.com' },

    var counter = 1;

    this.data = [];
    this.data.tabs = [];
    this.data.tabs = [
        { name: 'slack', app_url: 'https://sivaram636.slack.com' }
    ];


    // this.initTabs = () => {
    //     for (i = 1; i <= this.data.tabs.length; i++) {
    //         this.active = i;
    //     }
    //     //this.active = 0;
    // }

    // this.initTabs();

    // setTimeout(() => {
    //     getWebViews();
    // }, 2000);


    this.trustSrc = (src) => {
        return $sce.trustAsResourceUrl(src);
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
        }, function() {
            $log.info('modal-component dismissed at: ' + new Date());
        });
    }
}



angular.module('puraApp').controller('addServiceCtrl', function($uibModalInstance, service, Services) {
    var $ctrl = this;
    $ctrl.service = service;

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.addService = function() {
        $ctrl.service.label = $ctrl.name;
        if (service.isSubdomain) {
            $ctrl.service.baseURL = 'https://' + $ctrl.domain + $ctrl.service.baseURL;
        }
        $uibModalInstance.close($ctrl.service);
    }
})
