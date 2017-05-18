var semver = require('semver');


var AutoLaunch = require('auto-launch');

var machineId = require('electron-machine-id');

var minecraftAutoLauncher = new AutoLaunch({
    name: 'Manageyum'
});


var notifier = require('node-notifier');


angular.module('puraApp').component('services', {
        templateUrl: './src/services/services.html',
        controller: servicesController,
        bindings: {}
    })
    .config(function($stateProvider, $urlRouterProvider, $httpProvider, $uibTooltipProvider) {

        $stateProvider
            .state('services', {
                url: '/services',
                component: 'services'
            });
        $urlRouterProvider.otherwise('/');
    });


function servicesController($sce, $uibModal, User, $log, Services, $rootScope, $timeout, $scope, app, BrowserWindow, path, shell, remote, hotkeys, ipcRenderer, webContents, clipboard) {
    var self = this;


    this.userServices = User.getActiveServices();
    this.availableServices = Services.get();
    this.getPreloadJS = getPreloadJS;
    this.trustSrc = trustSrc;

    this.globalNotification = User.getGlobalNotification();


    this.isRefreshing = [];



    checkSupportedVersion();
    checkForBanners();

    checkAutoLaunch();

    setInterval(function() {
        checkSupportedVersion();
    }, 4.32e+7);

    setAppBlurListener();

    //
    // var bw = BrowserWindow.getFocusedWindow();
    // bw.on('will-attach-webview', (event, params) => {
    // })




    this.getIsRefreshing = function(serviceId) {
        return this.isRefreshing[serviceId];
    };


    function initWebViews(userServices) {
        var clonedServices = angular.copy(userServices);
        let service = clonedServices.shift();
        if (service && service.isActive) {
            let webview = createWebviewForService(service);
            initListenerForService(service, webview);
            var finishLoadHandler = () => {
                console.log('service did finish load ' + service.label);
                loadWebviews(clonedServices);
                let nextService = clonedServices.shift();
                if (nextService) {
                    let tabsPane = $('#service_views_cont_' + nextService.uuid).parent()[0];
                    if (tabsPane.className.indexOf('active') == -1) {
                        $(tabsPane).addClass('tabspane-pull-right');
                        setTimeout(() => {
                            $(tabsPane).removeClass('tabspane-pull-right');
                        }, 300);
                    }
                    var tabHeight = $('.nav.nav-tabs').height();
                    $('.service_views').height($(window).height() - tabHeight);
                }
                webview.removeEventListener("did-finish-loading", finishLoadHandler);
            };
            if (webview) {
                webview.addEventListener("did-finish-load", finishLoadHandler);
            }
        }

    }



    function loadWebviews(services) {
        initWebViews(services);
        // $('.main_tabs .tab-content .tab-pane').removeClass('showPaneLoad');
        playwithcss();
        // if (!services) {
        //     $('.main_loading').fadeOut('slow');
        // }
    }


    function playwithcss() {
        //$('.main_tabs .tab-content .tab-pane').addClass('showPaneLoad');

        //var tabsPane = $('.main_tabs .tab-content .tab-pane').not('.active');

        setTimeout(() => {
            //$('.main_tabs .tab-content .tab-pane').removeClass('showPaneLoad');
            $('.main_loading').fadeOut('slow');
            // $('.tab-pane.active').show();
        }, 1000);
    }

    function checkAutoLaunch() {
        var autoLaunch = User.getAutoLaunch();
        if (autoLaunch === null) {
            User.setAutoLaunch(true);
            minecraftAutoLauncher.enable();
            return;
        }
        if (autoLaunch) {
            minecraftAutoLauncher.enable();
            return;
        }
        minecraftAutoLauncher.disable();
        return;
    }


    function createWebviewForService(service) {

        var isAlreadyWebviewCreated = document.getElementsByName(service.uuid).length > 0 ? true : false;

        if (!isAlreadyWebviewCreated) {
            var webview = document.createElement('webview');
            webview.id = service.name;
            webview.setAttribute('class', 'service_views');
            webview.setAttribute('name', service.uuid);
            webview.setAttribute('label', service.uuid);
            webview.preload = self.getPreloadJS(service);
            webview.allowpopups = true;
            webview.src = self.trustSrc(service.baseURL);
            webview.partition = "persist:" + service.uuid;
            webview.setAttribute('hide', '');
            var parent = document.getElementById('service_views_cont_' + service.uuid);
            parent.appendChild(webview);

            return webview;
        }

        return null;

    }

    function checkSupportedVersion() {
        var appVersion = window.appVersion;
        User.getLastSupportedVersion().then(function(snapshot) {
            if (snapshot && snapshot.val()) {
                var isAppMustWithinSupport = semver.gte(appVersion, snapshot.val());
                if (!isAppMustWithinSupport) {
                    showUnSupportedPopup();
                }
            }
        });
    }

    function checkForBanners() {
        User.getBanner().then(function(snapshot) {
            if (snapshot && snapshot.val()) {
                var banner = snapshot.val();
                var isAlreadyClosed = User.isBannerClosed(banner.id);
                if (banner && !isAlreadyClosed) {
                    self.banner = banner;
                }
            }
        });
    }



    function showUnSupportedPopup() {
        User.getModalContent().then(function(snapshot) {
            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: './src/services/dynamicModal.html',
                controller: 'dynamicModalCtrl',
                controllerAs: '$ctrl',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    modalContent: function() {
                        return snapshot.val();
                    }
                }
            });
        });
    }


    function initShareModalNotifier() {
        let notifiedDate = User.getNotifyDate();
        let isShared = User.getShared();
        if (notifiedDate === null) {
            var a = new Date();
            a.setDate(a.getDate() + 3);
            User.setNotifyDate(a);
        } else if (notifiedDate && isShared === null) {
            notifiedDate = new Date(notifiedDate);
            var currentDate = new Date();
            if (currentDate.getDate() >= notifiedDate.getDate() && currentDate.getMonth() == notifiedDate.getMonth() && currentDate.getYear() == notifiedDate.getYear()) {
                setTimeout(function() {
                    self.showShareModal();
                    User.setShared(true);
                }, 10000);
            } else if (currentDate.getDate() < notifiedDate.getDate() && currentDate.getMonth() == notifiedDate.getMonth() && currentDate.getYear() == notifiedDate.getYear()) {
                notifiedDate = new Date(notifiedDate);
                var currentDate = new Date();
                var differenceInTime = notifiedDate.getTime() - currentDate.getTime();
                setTimeout(function() {
                    self.showShareModal();
                    User.setShared(true);
                }, differenceInTime);
            }
        }
    }


    function initSubscribeModalNotifier() {
        let notifiedDate = User.getSubscribeNotifyDate();
        let isSubscribed = User.getSubscribed();
        if (notifiedDate === null) {
            var a = new Date();
            a.setDate(a.getDate() + 10);
            User.setSubscribeNotifyDate(a);
        } else if (notifiedDate && isSubscribed === null) {
            notifiedDate = new Date(notifiedDate);
            var currentDate = new Date();
            if (currentDate.getDate() >= notifiedDate.getDate() && currentDate.getMonth() == notifiedDate.getMonth() && currentDate.getYear() == notifiedDate.getYear()) {
                setTimeout(function() {
                    self.showSubscribeModal();
                    User.setSubcribed(true);
                }, 10000);
            } else if (currentDate.getDate() < notifiedDate.getDate() && currentDate.getMonth() == notifiedDate.getMonth() && currentDate.getYear() == notifiedDate.getYear()) {
                notifiedDate = new Date(notifiedDate);
                var currentDate = new Date();
                var differenceInTime = notifiedDate.getTime() - currentDate.getTime();
                setTimeout(function() {
                    self.showSubscribeModal();
                    User.setSubcribed(true);
                }, differenceInTime);
            }
        }
    }






    function initListenerForService(userservice, webview) {
        if (webview) {

            var service = _.find(self.availableServices, {
                name: userservice.name
            });
            if (service.has_preloader) {
                if (!userservice.isRefreshing) {
                    // require('electron-context-menu')({
                    //     window: webview,
                    //     prepend: (params, browserWindow) => [{
                    //         label: 'Go Back',
                    //         click: () => {
                    //             webview.goBack();
                    //         }
                    //     }, {
                    //         label: 'Copy Current Page URL',
                    //         click: () => {
                    //             let url = webview.getURL();
                    //             clipboard.writeText(url);
                    //         }
                    //     }]
                    // });
                }


                webview.addEventListener("did-start-loading", function() {
                    if (userservice.name == 'custom_app') {
                        var customAppCookies = User.getCustomAppCookies(userservice.uuid);
                        var webcontents = webview.getWebContents();
                        var session = webcontents.session;
                        angular.forEach(customAppCookies, (cookie) => {
                            cookie.url = userservice.baseURL;
                            delete cookie['domain'];
                            session.cookies.set(cookie, (error, cookies) => {});
                        })
                    }
                })





                webview.addEventListener("dom-ready", function() {

                    // webview.openDevTools();

                    let userServices = User.getServices();
                    var newUserService = _.find(userServices, {
                        uuid: userservice.uuid
                    });

                    if (newUserService.name == 'custom_app') {

                        var webcontents = webview.getWebContents();
                        var session = webcontents.session;
                        var cookieInterval = null;

                        session.cookies.on('changed', (error, cookies) => {
                            //console.log('custom_app cookies changed');
                            if (cookieInterval) {
                                clearTimeout(cookieInterval);
                                //console.log('cookie timer cleared');
                            }
                            cookieInterval = setTimeout(() => {
                                console.log('got new cookies and wrote');
                                session.cookies.get({}, (error, cookies) => {

                                    User.setCustomAppCookies(newUserService.uuid, cookies);
                                });

                            }, 10000);

                        });
                    }


                    // newUserService.isRefreshing = false;
                    // userservice.isRefreshing = false;

                    self.isRefreshing[userservice.uuid] = false;

                    if (userservice.muteNotification) {
                        webview.setAudioMuted(true);
                    }


                    var jsonString = JSON.stringify(newUserService);
                    webview.executeJavaScript(service.name + '.init(\'' + jsonString + '\')');
                    webview.send('global-notification', User.getGlobalNotification());

                });



                webview.addEventListener('ipc-message', (event) => {
                    ipcMessageHandler(event);
                });


                webview.addEventListener('new-window', (e) => {

                    var disposition = e.disposition;
                    if (disposition === 'new-window') {
                        return;
                    }

                    const protocol = require('url').parse(e.url).protocol
                    if (protocol === 'http:' || protocol === 'https:') {
                        shell.openExternal(e.url)
                    }
                });


                webview.addEventListener('did-get-redirect-request', (e) => {

                    if ((e.oldURL == "https://twitter.com/sessions" && e.newURL == "https://twitter.com/") || e.newURL.indexOf('https://twitter.com/account/login_verification') != -1) {

                        webview.send('redirect-url', e.newURL);
                    }
                    if (e.oldURL == "https://twitter.com/sessions" && e.newURL == "https://tweetdeck.twitter.com/?via_twitter_login=true") {

                        webview.send('redirect-url', e.newURL);
                    }
                });

                webview.addEventListener('page-favicon-updated', (e) => {
                    let userServices = User.getServices();

                    if (userservice && userservice.is_custom_app && e.favicons.length > 0) {
                        userservice.favicon = e.favicons[0];
                        updateService(userservice);
                        $scope.$apply();
                    }
                });

                webview.addEventListener('destroyed', (e) => {});


            }
        }
    }




    this.backwardHistory = function() {
        var webview = getActiveWebview();
        if (webview) {
            webview.goBack();
        }
    }



    this.forwardHistory = function() {
        var webview = getActiveWebview();
        if (webview) {
            webview.goForward();
        }
    }


    function moveToTab(index) {
        if (index == 1) {
            self.active = 0;
            return;
        }
        index = parseInt(index) - 1;
        let activeServices = _.filter(self.userServices, {
            isActive: true
        });
        if (activeServices.length >= index) {
            let activeService = activeServices[index - 1];
            let uuid = activeService.uuid;
            self.active = uuid;
            return;
        }

    }


    function initHotKeys() {
        hotkeys.add({
            combo: 'mod',
            action: 'keyup',
            description: 'This one goes to 11',
            callback: function() {
                self.showHelperCounts = false;
            }
        });
        hotkeys.add({
            combo: 'mod',
            action: 'keydown',
            description: 'This one goes to 11',
            callback: function() {
                self.showHelperCounts = true;
            }
        });
        hotkeys.add({
            combo: 'mod+f',
            description: 'This one goes to 11',
            callback: function() {
                const ElectronSearchText = require('electron-search-text');

                let webview = getActiveWebview();
                if (webview) {
                    const searcher = new ElectronSearchText({
                        target: '#' + webview.id, // selector for search target
                        delay: 150, // delay call search function
                        visibleClass: '.electronSearchText-visible', // for toggle search box
                        input: '.electronSearchText-input', // selector for search input
                        count: '.electronSearchText-count', // selector for search results count
                        box: '.electronSearchText-box' // selector for search box
                    });

                    $('.electronSearchText-box').show();
                    $('.electronSearchText-input').focus();
                    $('.electronSearchText-box').addClass('electronSearchText-visible');


                    ipcRenderer.on('toggleSearch', function() {
                        searcher.emit('toggle');
                        // $('.electronSearchText-box').hide();
                    });
                    ipcRenderer.on('did-press-escape', function() {

                        // $('.electronSearchText-box').hide();
                    });


                }

            }
        });

        hotkeys.add({
            combo: 'esc',
            description: 'This one goes to 11',
            callback: function() {
                $('.electronSearchText-box').hide();
            }
        });


        let numShortcuts = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        angular.forEach(numShortcuts, (number) => {
            hotkeys.add({
                combo: 'mod+' + number,
                description: 'This one goes to 11',
                callback: function() {
                    moveToTab(number);
                }
            });
        });
    }


    initHotKeys();


    function reloadActiveWebview() {
        let activeUUID = self.active != 0 ? self.active : null;

        if (activeUUID) {
            var webview = document.getElementsByName(activeUUID)[0];
            // let userServices = User.getServices(activeUUID);
            var newUserService = _.find(self.userServices, {
                uuid: activeUUID
            });
            self.isRefreshing[activeUUID] = true;
            // newUserService.isRefreshing = true;
            setTimeout(function() {
                self.isRefreshing[activeUUID] = false;
                // newUserService.isRefreshing = false;
            }, 10000);
            if (webview) {
                webview.remove();
                let newWebview = createWebviewForService(newUserService);
                initListenerForService(newUserService, newWebview);
                var tabHeight = $('.nav.nav-tabs').height();
                $('.service_views').height($(window).height() - tabHeight);
                //webview.loadURL(newUserService.baseURL);
                // webview.reload();
            }
        }
    }


    function getActiveWebview() {
        let activeUUID = self.active != 0 ? self.active : null;
        if (activeUUID) {
            var webview = document.getElementsByName(activeUUID)[0];
            return webview;
        }
        return null;
    }




    $rootScope.$on('newService', (event, newService) => {

        this.userServices.push(newService);

        setTimeout(() => {
            let webview = createWebviewForService(newService);
            initListenerForService(newService, webview);
            self.active = newService.uuid;
            $scope.$apply();
        }, 1000);
    });


    $rootScope.$on('notificationClicked', (event, notification) => {

        var service = notification.service;
        var webview = document.getElementsByName(service.uuid)[0];
        var userServiceIndex = _.findIndex(this.userServices, {
            uuid: service.uuid
        });
        webview.send('open-notification', notification.notification);
        if (userServiceIndex > -1) {
            self.active = service.uuid;
        }
    });


    $rootScope.$on('refreshNotificationCenter', (event, notification) => {
        this.notificationCenter = User.getNotifications();
        var count = 0;
        angular.forEach(this.notificationCenter, (service) => {
            count = count + service.notifications.length;
        });
        this.overallNotificationCount = count;
        updateDockBadge(count);
    });


    $rootScope.$on('serviceDeleted', (event, service) => {
        let index = _.findIndex(this.userServices, {
            uuid: service.uuid
        });
        this.userServices.splice(index, 1);
    });

    $rootScope.$on('serviceUpdated', (event, service) => {
        let webview = document.getElementsByName(service.uuid)[0];
        if (webview && service.isActive) {
            webview.send('serviceUpdate', service);
            if (service.muteNotification) {
                webview.setAudioMuted(true);
            }

        } else if (service.isActive) {
            this.userServices = User.getServices();
            setTimeout(() => {
                let webview = createWebviewForService(service);
                initListenerForService(service, webview);
            }, 1000);
        }
        this.userServices = User.getServices();
    });


    $rootScope.$on('closeServiceList', (event, service) => {
        self.setAddServices(false);
    });


    $rootScope.$on('dragEndRefreshServices', (event, service) => {
        User.updateServices(self.userServices);
    });


    $rootScope.$on('openShareModal', (event) => {
        self.showShareModal();
    });





    $rootScope.$on('autolaunchchange', (event) => {
        checkAutoLaunch();
    });


    ipcRenderer.on('reloadCurrentWebview', function(event, args) {

        reloadActiveWebview();
    });

    ipcRenderer.on('zoomIn', function(event, args) {

        sendEventToActiveWebview('zoomIn');
    });
    ipcRenderer.on('zoomOut', function(event, args) {
        sendEventToActiveWebview('zoomOut');
    });

    ipcRenderer.on('zoomReset', function(event, args) {
        sendEventToActiveWebview('zoomReset');
    });


    function sendEventToActiveWebview(event) {
        let activeUUID = self.active != 0 ? self.active : null;
        if (activeUUID) {
            var webview = document.getElementsByName(activeUUID)[0];
            if (webview) {
                webview.send(event, {});
            }
        }
    }


    ipcRenderer.on('focusCurrentWebview', function(event, args) {
        let activeUUID = self.active != 0 ? self.active : null;
        if (activeUUID) {
            var webview = document.getElementsByName(activeUUID)[0];
            if (webview) {
                webview.focus();
            }
        }
    });


    ipcRenderer.on('switchTabsForward', function(event, args) {

        var homeTabActive = $('.home_tab_menu.active')[0];
        var serviceTabActive = $('.service_tab_menu.active')[0];
        if (homeTabActive) {
            let activeUUID = homeTabActive.getAttribute('index');
            if (activeUUID == '0') {
                self.active = self.userServices[0].uuid;
                $scope.$apply();
            }
            return;
        }
        if (serviceTabActive) {
            let activeUUID = serviceTabActive.getAttribute('serviceid');
            let index = _.findIndex(self.userServices, {
                isActive: true,
                uuid: activeUUID
            });
            if (index > -1 && index == (self.userServices.length - 1)) {
                self.active = 0;
                $scope.$apply();
            } else {
                self.active = self.userServices[index + 1].uuid;
                $scope.$apply();
            }
        }
    });




    ipcRenderer.on('switchTabsBackward', function(event, args) {

        var homeTabActive = $('.home_tab_menu.active')[0];
        var serviceTabActive = $('.service_tab_menu.active')[0];
        if (homeTabActive) {
            let activeUUID = homeTabActive.getAttribute('index');
            if (activeUUID == '0') {
                self.active = self.userServices[self.userServices.length - 1].uuid;
                $scope.$apply();
            }
            return;
        }
        if (serviceTabActive) {
            let activeUUID = serviceTabActive.getAttribute('serviceid');
            let index = _.findIndex(self.userServices, {
                isActive: true,
                uuid: activeUUID
            });
            if (index > 0 && index < (self.userServices.length)) {
                self.active = self.userServices[index - 1].uuid;
                $scope.$apply();
            } else {
                self.active = 0;
                $scope.$apply();
            }
        }
    });


    ipcRenderer.on('copyCurrentPageURL', function(event, args) {
        var webview = getActiveWebview();
        if (webview) {
            let url = webview.getURL();
            clipboard.writeText(url);
        }
    });

    ipcRenderer.on('forwardHistory', function(event, args) {
        self.forwardHistory();
    });
    ipcRenderer.on('backwardHistory', function(event, args) {
        self.backwardHistory();
    });



    function trustSrc(src) {
        return $sce.trustAsResourceUrl(src);
    }

    function getPreloadJS(service) {
        if (service.has_preloader) {
            return './src/services/preloaders/' + service.name + '.js';
        }
    }


    function hideTabsPane() {
        $('.tab-pane').css('display', 'none');
        $('.tab-pane .active').css('display', 'block');

    }

    this.clearNotifications = function(service) {
        User.removeNotification(service);
        let webview = document.getElementsByName(service.uuid)[0];

        if (webview) {
            setTimeout(() => {
                webview.removeAttribute('hide', null);
                webview.focus();
            }, 100);
        }


        this.setWindowTitle(service.label);
    };

    this.setWindowTitle = function(name) {
        let bw = BrowserWindow.getFocusedWindow();
        if (bw) {
            bw.setTitle(name + " - Manageyum");
        }
    };

    this.getHelperCounts = function(index) {
        return index + 2;
    };


    this.showShareModal = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/shareModal.html',
            controller: 'shareModalCtrl',
            controllerAs: '$ctrl'
        });
    };



    this.showSubscribeModal = function() {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/subscription.html',
            controller: 'subscriptionCtrl',
            controllerAs: '$ctrl'
        });
    };


    initShareModalNotifier();
    initSubscribeModalNotifier();

    this.toggleNotification = function() {
        User.setGlobalNotification(!self.globalNotification);
        self.globalNotification = !self.globalNotification;
        var webviews = $('.service_views');
        angular.forEach(webviews, (webview) => {
            webview.send('global-notification', self.globalNotification);
        });
    };

    this.deselectService = function(service) {
        let webview = document.getElementsByName(service.uuid)[0];
        if (webview) {
            webview.setAttribute('hide', '');
            webview.blur();
            webview.send('slack-blur', {});
        }
    };


    this.setHomeNavIndex = function(index) {
        this.active = 0;
        this.navindex = index;
        $rootScope.$broadcast('homeNavIndexChanged', {
            index: index
        });
    }

    this.setAddServices = function(value) {
        this.showAddServices = value;
    }

    this.closeBanner = function(banner) {
        User.setBannerClosed(banner.id);
        self.banner = null;
    }



    function ipcMessageHandler(event) {
        if (event.channel === 'notification-count') {
            var notification = event.args[0];
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, {
                uuid: label
            });
            updateCountInService(service, notification);
            processDockCount();
        }
        if (event.channel === 'notification-message') {
            var notification = event.args[0];
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, {
                uuid: label
            });
            if (!isActiveService(service)) {
                updateOverViewInService(service, notification);
            }
            sendNotificationFallback(service, notification);
        }
        if (event.channel === 'notification-click') {
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, {
                uuid: label
            });
            focusService(service);
        }

        if (event.channel === 'avatar-slack') {
            var avatar = event.args[0];
            var targetWebview = event.target;
            var label = targetWebview.attributes.label.value;
            var service = _.find(self.userServices, {
                uuid: label
            });
            service.favicon = avatar.url;
            updateService(service);
        }
    }

    function sendNotificationFallback(service, notification) {
        if (process.platform == "win32") {
            var osVersion = require('os').release();

            var isLessThan10 = semver.lt(osVersion, '10.0.0');
            if (isLessThan10) {
                notifier.notify({
                    'title': notification.title,
                    'message': notification.options.body,
                    'icon': notification.options.icon,
                    'wait': true
                });
                notifier.on('click', function(notifierObject, options) {
                    focusService(service);
                    $rootScope.$broadcast('notificationClicked', {
                        service: service,
                        notification: notification
                    });
                });
            }
        }
    }

    function updateService(service) {
        User.updateService(service);
    }


    function updateCountInService(service, notification) {
        if (service) {
            service.notification = notification;
            $scope.$apply(service);
        }
    }


    function updateOverViewInService(service, notification) {
        notification.timestamp = Date.now();
        User.setNotification(service, notification);
    }


    function processDockCount() {
        let services = self.userServices;
        let notification_count = 0;
        let isBadgePresent = false;
        angular.forEach(services, function(service) {
            if (service.notification) {
                let notification = service.notification;
                if (notification.count != "" && !isNaN(notification.count)) {
                    notification_count = notification_count + parseInt(notification.count);
                }
                if (notification.count_indirect && notification.count_indirect > 0) {
                    isBadgePresent = true;
                }
            }
        });

        if (notification_count > 0) {
            updateDockBadge(notification_count);
            return;
        }
        if (isBadgePresent) {
            updateDockBadge(0, true);
            return;
        }
        updateDockBadge(0);
    }




    function isActiveService(service) {
        var a = $('.tab-pane.active .service_views')[0];
        if (a) {
            var serviceId = a.getAttribute('label');
            if (service.uuid === serviceId) {
                return true;
            }
        }
        return false;
    }



    function focusService(service) {


        let indexOfService = self.userServices.indexOf(service);

        if (indexOfService > -1) {
            self.active = service.uuid;
            var webview = document.getElementsByName(service.uuid)[0];
            webview.focus();
        }
        window.focus();
        app.focus();
        var win = BrowserWindow.getAllWindows();
        win = win[0];
        if (win) {
            win.show();
            win.focus();
        }

    }


    if (this.userServices.length === 0) {
        self.setAddServices(true);
    }



    function setAppBlurListener() {


    }


    function $windowResize(argument) {
        window.addEventListener('resize', function(e) {
            var tabHeight = $('.nav.nav-tabs').height();
            $('.service_views').height($(window).height() - tabHeight);
        });
        window.addEventListener('blur', function(e) {
            self.showHelperCounts = false;
            $scope.$apply();
            let activeUUID = self.active != 0 ? self.active : null;
            if (activeUUID) {
                var webview = document.getElementsByName(activeUUID)[0];
                if (webview) {
                    webview.blur();
                }
            }
        });

    }
    $windowResize();


    function updateDockBadge(count, isDot) {

        if (process.platform == 'darwin' || process.platform == 'linux') {
            if (isDot && process.platform == 'darwin') {
                app.dock.setBadge('\u2022');
                return;
            }
            app.setBadgeCount(count);
            return;
        }

        // (s = 'franz-win-dock-alert-10.png',
        // o = __('29-lots-of-new-messages')) : i > 0 ? (s = 'franz-win-dock-alert-' + i + '.png', o = __('30-12-new-messages', i)) : a > 0 && (s = 'franz-win-dock-alert.png', o = __('30-12-new-messages', a)), null !== s && (s = path['join'](__dirname, 'assets', s)), remote['app']['mainWindow']['setOverlayIcon'](s, o), null !== trayIcon) {
        var win = BrowserWindow.getAllWindows();
        win = win[0];
        if (win) {
            if (isDot) {
                var s = path['join'](__dirname, 'images/windock', 'win-dock-alert.png');
                win.setOverlayIcon(s, 'test');
                return;
            }
            if (count > 10) {
                var s = path['join'](__dirname, 'images/windock', 'win-dock-alert-10.png');
                win.setOverlayIcon(s, 'test');
                return;
            }
            if (count > 0 && count < 10) {
                var s = path['join'](__dirname, 'images/windock', 'win-dock-alert-' + count + '.png');
                win.setOverlayIcon(s, 'test');
                return;
            }
            var s = path['join'](__dirname, 'images/windock', 'win-dock-alert.png');
            win.setOverlayIcon(null, 'test');
        }
    }





    init();





    function init() {
        if (self.userServices && self.userServices.length > 0) {
            self.active = self.userServices[0].uuid;
            console.log('intial active set to 1st tab');
        }

        angular.forEach(self.userServices, (service) => {
            self.isRefreshing[service.uuid] = true;
        });

        $timeout(() => {
            initWebViews(self.userServices);
            playwithcss();
        }, 1000);
        checkValidity();
    }


    function showUpgradeModal(mustUpgrade) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: './src/services/upgradeModal.html',
            controller: 'upgradeModalController',
            controllerAs: '$ctrl',
            backdrop: 'static',
            keyboard: true,
            resolve: {
                mustUpgrade: function() {
                    return mustUpgrade;
                }
            }
        });
        modalInstance.result.then((result) => {
            if (result == 'settings') {
                self.setHomeNavIndex(2);
                return;
            }
            if (result == 'buyNow') {
                window.open('https://manageyum.com/pricing.html', '_blank');
                $rootScope.$broadcast('showRegistrationModal');
                return;
            }
            if (result == 'referFriends') {
                self.setHomeNavIndex(2);
                $rootScope.$broadcast('showReferralModal');
                return;
            }
        });
    }

    function isExpired(expiryDateStr) {
        var expiryDate = new Date(expiryDateStr);
        return expiryDate.getTime() < Date.now();
    }

    function checkForPromotion() {
        var lastShownDate = User.getLastPromoShown();
        if (lastShownDate == null) {
            showUpgradeModal(false);
            User.setLastPromoShown(Date.now());
            return;
        }
        if (lastShownDate) {
            lastShownDate = new Date(lastShownDate);
            var oneDay = 24 * 60 * 60 * 1000;
            var diffDays = Math.round(Math.abs((lastShownDate.getTime() - Date.now()) / (oneDay)));
            if (diffDays > 4) {
                showUpgradeModal(false);
                User.setLastPromoShown(Date.now());
                return;
            }
        }

    }

    function checkValidity() {
        let appInstallHash = machineId.machineIdSync();
        User
            .getUserPlan(appInstallHash)
            .then((response) => {
                User.setCurrentPlan(response.data);
                if (response.data.plan == 'pro' && isExpired(response.data.expiration)) {
                    showUpgradeModal(true);
                    return;
                }
                if (response.data.plan == 'pro') {
                    checkForPromotion();
                }
            });

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
        };
        $uibModalInstance.close(data);
    };
});


angular.module('puraApp').controller('shareModalCtrl', function($uibModalInstance, shell) {
    var $ctrl = this;


    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.share = function(appName) {
        var href = '';
        switch (appName) {
            case 'facebook':
                href = 'https://www.facebook.com/sharer/sharer.php?u=http://www.manageyum.com';
                break;
            case 'twitter':
                href = "https://twitter.com/intent/tweet?status=I've added 2 services to manageyum! Get the free desktop app for Trello, Slack, Whatsapp and more at www.manageyum.com @manageyum";
                break;
            case 'email':
                href = "mailto:?body=I've added 2 services to manageyum! Get the free desktop app for Trello, Slack, Whatsapp and more at www.manageyum.com";
                break;
        }
        shell.openExternal(href);
        $uibModalInstance.dismiss('cancel');
    };
});


angular.module('puraApp').controller('upgradeModalController', function($uibModalInstance, mustUpgrade, User) {
    var $ctrl = this;
    $ctrl.mustUpgrade = mustUpgrade;
    $ctrl.currentPlan = User.getCurrentPlan();

    $ctrl.ok = function() {

    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $ctrl.editServices = function() {
        $uibModalInstance.close('settings');
    }

    $ctrl.buyNow = function() {
        $uibModalInstance.close('buyNow');
    };

    $ctrl.referFriends = function() {
        $uibModalInstance.close('referFriends');
    };

    $ctrl.getDaysLeft = function(dateStr) {
        var expiryDate = new Date(dateStr);
        var oneDay = 24 * 60 * 60 * 1000;
        var diffDays = Math.round(Math.abs((expiryDate.getTime() - Date.now()) / (oneDay)));
        return diffDays + ' days left';
    };
    if (!mustUpgrade) {
        $ctrl.expiryDate = $ctrl.getDaysLeft($ctrl.currentPlan.expiration);
    }


});

angular.module('puraApp').directive('sortableTab', function($timeout, $document, $rootScope) {
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
                    $rootScope.$broadcast('dragEndRefreshServices');
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
            }

        }
    };
});


angular.module('puraApp').filter('overflowCount', function() {
    return function(count) {
        if (!count) {
            return '';
        }
        if (count > 9) {
            return '9+';
        }
        return count;
    }

});


angular.module('puraApp').filter('labelParser', function() {
    return function(label) {

        if (!label) {
            return label;
        }
        return label.replace('_', ' ');

    }

});

angular.module('puraApp').controller('dynamicModalCtrl', function($uibModalInstance, modalContent, shell) {
    var $ctrl = this;
    $ctrl.title = modalContent.title;
    $ctrl.body = modalContent.body;
    $(document).on('click', 'a[href^="http"]', function(event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });
})
