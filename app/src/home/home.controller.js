angular
    .module('puraApp')
    .component('home', {
        templateUrl: './src/home/home.html',
        controller: homeController,
        bindings: { navindex: "=" }
    });


function homeController($sce, $uibModal, User, $log, $rootScope) {


    this.userServices = User.getServices();

    this.activePill = 1;

    this.refreshNotificationCenter = function() {
        $rootScope.$broadcast('refreshNotificationCenter', { test: 'test' });
    }

    $rootScope.$on('homeNavIndexChanged', (event, data) => {
        console.log("home navindex changed" + data.index);
        this.activePill = data.index;
        // need to add webview listener
    });
}
