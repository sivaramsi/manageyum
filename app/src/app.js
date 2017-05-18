'use strict';

/**
 * @ngdoc overview
 * @name puraApp
 * @description
 * # puraApp
 *
 * Main module of the application.
 */






//require('electron-context-menu')();


var SRC_DIR = './src/';
angular
    .module('puraApp', [
        'ui.router',
        'ui.bootstrap',
        'ngSanitize',
        'LocalStorageModule',
        'angular-electron',
        'ui.router.state.events',
        'angular-ladda',
        'angulartics',
        'stripe.checkout',
        'angulartics.mixpanel',
        'cfp.hotkeys',
        'checklist-model',
         'angular-md5'
    ])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider, $analyticsProvider) {

        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: SRC_DIR + 'index/index.html'
            })

        $urlRouterProvider.otherwise('/');
        $analyticsProvider.virtualPageviews(false);
    })
  
