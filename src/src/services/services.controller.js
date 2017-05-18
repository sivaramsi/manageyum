const { app, globalShortcut } = require('electron')






angular.module('puraApp').component('services', {
        templateUrl: './src/services/services.html',
        controller: servicesController,
        bindings: {}
    })
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {

        $stateProvider
            .state('services', {
                url: '/services',
                component: 'services'
            })
        $urlRouterProvider.otherwise('/');
    })


function servicesController($sce, $uibModal, User, $log, Services, $rootScope, $timeout, $scope) {
    var self = this;

    this.userServices = User.getServices();
    this.getWebViews = getWebViews;
    this.availableServices = Services.get();

    $timeout(() => {
        getWebViews();
    }, 1000);


    $rootScope.$on('newService', (event, newService) => {
        console.log("refreshServices called" + newService);
        this.userServices.push(newService);
        // need to add webview listener
    });




    this.trustSrc = (src) => {
        return $sce.trustAsResourceUrl(src);
    }

    this.getPreloadJS = (service) => {
        if (service.has_preloader) {
            return './src/services/preloaders/' + service.name + '.js';
        }
    }


    function hideTabsPane() {
        $('.tab-pane').css('display', 'none');
        $('.tab-pane .active').css('display', 'block');

    }




    function getWebViews() {
        const webviews = document.getElementsByClassName('service_views');
        angular.forEach(webviews, (webview) => {
            var serviceName = webview.id;
            var service = _.find(self.availableServices, { name: serviceName });
            if (service.has_preloader) {
                webview.addEventListener("dom-ready", function() {
                    console.log('webview dom loaded');
                    //webview.openDevTools();
                    webview.executeJavaScript(service.name + '.init()');
                });
                webview.addEventListener('ipc-message', (event) => {
                    ipcMessageHandler(event);
                })
            }
        });
    }


    function ipcMessageHandler(event) {
        if (event.channel === 'notification-count') {
            var notification = event.args[0];
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, { label: label });
            updateCountInService(service, notification);
        }
        if (event.channel === 'notification-message') {
            var notification = event.args[0];
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, { label: label });
            updateOverViewInService(service, notification);
        }
        if (event.channel === 'notification-click') {
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, { label: label });
            focusService(service);
        }

    }

    function updateCountInService(service, notification) {
        service.notification = notification;
        $scope.$apply(service);
    }


    function updateOverViewInService() {
        console.log('updateOnverview called');
    }

    function focusService(service) {
        console.log("trying to focus window");
        window.focus();
        app.focus();
    }


}



angular.module('puraApp').controller('ModalInstanceCtrl', function($uibModalInstance, service) {
    var $ctrl = this;
    $ctrl.service = service;
    $ctrl.ok = function() {

    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.addService = function() {
        var userConfig = {
            name: $ctrl.name,
            serviceURL: $ctrl.serviceURL
        }
        if ($ctrl.service.isTeamRequired) {
            userConfig.serviceURL = 'https://' + $ctrl.domain + $ctrl.serviceURL;
        }
        var data = {
            service: $ctrl.service,
            userConfig: userConfig
        }
        $uibModalInstance.close(data);
    }
})



angular.module('puraApp').directive('sortableTab', function($timeout, $document) {
    return {
        link: function(scope, element, attrs, controller) {
            // Attempt to integrate with ngRepeat
            // https://github.com/angular/angular.js/blob/master/src/ng/directive/ngRepeat.js#L211
            var match = attrs.ngRepeat.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
            var tabs;
            scope.$watch(match[2], function(newTabs) {
                tabs = newTabs;
            });

            var index = scope.$index;
            scope.$watch('$index', function(newIndex) {
                index = newIndex;
            });

            attrs.$set('draggable', true);

            // Wrapped in $apply so Angular reacts to changes
            var wrappedListeners = {
                // On item being dragged
                dragstart: function(e) {
                    e.originalEvent.dataTransfer.effectAllowed = 'move';
                    e.originalEvent.dataTransfer.dropEffect = 'move';
                    e.originalEvent.dataTransfer.setData('application/json', index);
                    element.addClass('dragging');
                },
                dragend: function(e) {
                    //e.stopPropagation();
                    element.removeClass('dragging');
                },

                // On item being dragged over / dropped onto
                dragenter: function(e) {},
                dragleave: function(e) {
                    element.removeClass('hover');
                },
                drop: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var sourceIndex = e.originalEvent.dataTransfer.getData('application/json');
                    move(sourceIndex, index);
                    element.removeClass('hover');
                }
            };

            // For performance purposes, do not
            // call $apply for these
            var unwrappedListeners = {
                dragover: function(e) {
                    e.preventDefault();
                    element.addClass('hover');
                },
                /* Use .hover instead of :hover. :hover doesn't play well with
                   moving DOM from under mouse when hovered */
                mouseenter: function() {
                    element.addClass('hover');
                },
                mouseleave: function() {
                    element.removeClass('hover');
                }
            };

            angular.forEach(wrappedListeners, function(listener, event) {
                element.on(event, wrap(listener));
            });

            angular.forEach(unwrappedListeners, function(listener, event) {
                element.on(event, listener);
            });

            function wrap(fn) {
                return function(e) {
                    scope.$apply(function() {
                        fn(e);
                    });
                };
            }

            function move(fromIndex, toIndex) {
                // http://stackoverflow.com/a/7180095/1319998
                tabs.splice(toIndex, 0, tabs.splice(fromIndex, 1)[0]);
            };

        }
    }
});
