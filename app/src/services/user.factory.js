angular.module('puraApp').factory('User', User)

function User(localStorageService, $rootScope, $http) {
    var notificationCenter = [];

    var SERVER_URL = 'https://api.manageyum.com/api/';

    return {
        addService: function(newService) {
            var existingServices = localStorageService.get('userservices');
            if (!existingServices) {
                existingServices = [];
            }
            existingServices.push(newService);
            localStorageService.set('userservices', existingServices);
            $rootScope.$broadcast('newService', newService);
        },
        getServices: function() {
            var services = localStorageService.get('userservices');
            if (!services) {
                return [];
            }
            return services;
        },
        getActiveServices: function() {
            let services = this.getServices();
            return _.filter(services, { isActive: true });
        },
        updateServices: function(services) {
            return localStorageService.set('userservices', services);
        },
        getNotifications: function() {
            return notificationCenter;
        },
        setNotification: function(service, newNotification) {
            var oldService = _.find(notificationCenter, { uuid: service.uuid });
            if (!oldService) {
                oldService = service;
                oldService.notifications = [];
                oldService.notifications.push(newNotification);
                notificationCenter.push(service)
                $rootScope.$broadcast('refreshNotificationCenter', newNotification);
                return;
            } else if (oldService && !oldService.notifications) {
                oldService.notifications = [];
                oldService.notifications.push(newNotification);
            }
            oldService.notifications.push(newNotification);
            $rootScope.$broadcast('refreshNotificationCenter', newNotification);
        },
        removeNotification: function(service) {
            var oldService = _.find(notificationCenter, { uuid: service.uuid });
            var index = notificationCenter.indexOf(oldService);
            if (index > -1) {
                notificationCenter.splice(index, 1);
            }
            $rootScope.$broadcast('refreshNotificationCenter', { test: 'test' });
        },
        updateService: function(service) {
            var existingServices = localStorageService.get('userservices');
            let index = _.findIndex(existingServices, { uuid: service.uuid });
            delete service['notifications'];
            existingServices[index] = service;
            localStorageService.set('userservices', existingServices);
            $rootScope.$broadcast('serviceUpdated', service);
            console.log('service updated');
        },
        updateProfileService: function(profileId, service) {
            let profiles = this.getProfiles();
            let profile = _.find(profiles, { uuid: profileId });
            let index = _.findIndex(profile.services, { uuid: service.uuid });
            profile.services[index] = service;
            localStorageService.set('profiles', profiles);
            $rootScope.$broadcast('serviceUpdated', service);
            console.log('service in profile updated');
        },
        addProfile: function(profile) {
            var existingProfiles = localStorageService.get('profiles');
            if (!existingProfiles) {
                existingProfiles = [];
            }
            existingProfiles.push(profile);
            localStorageService.set('profiles', existingProfiles);
            $rootScope.$broadcast('newProfile', profile);
        },
        getProfiles: function(profile) {
            var existingProfiles = localStorageService.get('profiles');
            if (!existingProfiles) {
                existingProfiles = [];
            }
            return existingProfiles;
        },
        updateProfile: function(profile) {
            var existingProfiles = localStorageService.get('profiles');
            // let oldProfile = _.find(existingProfiles, { uuid: profile.uuid });
            let index = _.findIndex(existingProfiles, { uuid: profile.uuid });
            existingProfiles[index] = profile;
            localStorageService.set('profiles', existingProfiles);
        },
        deleteProfile: function(profile) {
            var existingProfiles = localStorageService.get('profiles');
            let index = _.findIndex(existingProfiles, { uuid: profile.uuid });
            existingProfiles.splice(index, 1);
            localStorageService.set('profiles', existingProfiles);
            $rootScope.$broadcast('profileDeleted', profile);
        },
        updateLastSelectedProfile: function(profileId) {
            localStorageService.set('lastSelectedProfile', profileId);
        },
        getLastSelectedProfile: function(profileId) {
            var profileId = localStorageService.get('lastSelectedProfile');
            if (profileId) {
                let profiles = this.getProfiles();
                let profile = _.find(profiles, { uuid: profileId });
                return profile;
            }
            return null;
        },
        deleteService: function(service) {
            var existingServices = localStorageService.get('userservices');
            let index = _.findIndex(existingServices, { uuid: service.uuid });
            existingServices.splice(index, 1);
            localStorageService.set('userservices', existingServices);
            $rootScope.$broadcast('serviceDeleted', service);
        },
        getLastSupportedVersion: function() {
            return  new Promise((resolve,reject)=>{
              reject('config node')
            });
            // return firebase.database().ref('/app/minversion').once('value');
        },
        getModalContent: function() {
          return  new Promise((resolve,reject)=>{
            reject('config node')
          });
            // return firebase.database().ref('/modal').once('value');
        },
        getBanner: function() {
          return  new Promise((resolve,reject)=>{
            reject('config node')
          });
            //return firebase.database().ref('/banner').once('value');
        },
        isBannerClosed: function(bannerId) {
            var bannerMeta = localStorageService.get('banner.' + bannerId);
            if (bannerMeta === null) {
                return false;
            }
            return bannerMeta;
        },
        setBannerClosed: function(bannerId) {
            localStorageService.set('banner.' + bannerId, true);
            return;
        },
        getGlobalNotification: function() {
            var globalNotification = localStorageService.get('globalNotification');
            if (globalNotification === null) {
                return true;
            }
            return globalNotification;
        },
        setGlobalNotification: function(value) {
            localStorageService.set('globalNotification', value);
        },
        getShared: function() {
            return localStorageService.get('shared');
        },
        getSubscribed: function() {
            return localStorageService.get('isSubscribed');
        },
        setShared: function(value) {
            localStorageService.set('shared', value);
        },
        setSubcribed: function(value) {
            localStorageService.set('isSubscribed', value);
        },
        getNotifyDate: function() {
            return localStorageService.get('notifyDate');
        },
        getSubscribeNotifyDate: function() {
            return localStorageService.get('subscribeNotifyDate');
        },
        setNotifyDate: function(value) {
            return localStorageService.set('notifyDate', value);
        },
        setSubscribeNotifyDate: function(value) {
            return localStorageService.set('subscribeNotifyDate', value);
        },
        setCustomAppCookies: function(uuid, value) {
            return localStorageService.set('customCookieStore_' + uuid, value);
        },
        getCustomAppCookies: function(uuid) {
            return localStorageService.get('customCookieStore_' + uuid);
        },
        getAutoLaunch: function() {
            return localStorageService.get('autolaunch');
        },
        setAutoLaunch: function(value) {
            localStorageService.set('autolaunch', value);
        },
        getUserPlan: function(appInstallHash) {
            return $http.post(SERVER_URL + 'user', { appInstallHash: appInstallHash });
        },
        setUserPlan: function(plan) {

        },
        processPayment: function(data) {
            return $http.post(SERVER_URL + 'payment', data);
        },
        registerProduct: function(data) {
            return $http.post(SERVER_URL + 'register', data);
        },
        subscribe: function(emailId) {
            var mailchimpURL = 'https://manageyum.com/mailchimp.php';
            return $http.post(mailchimpURL, { email: emailId });
        },
        setCurrentPlan: function(plan) {
            localStorageService.set('userPlan', plan);
        },
        getCurrentPlan: function() {
            return localStorageService.get('userPlan');
        },
        setReferralEmail: function(emailId) {
            localStorageService.set('referralEmail', emailId);
        },
        getReferralEmail: function() {
            return localStorageService.get('referralEmail');
        },
        addReferralToServer: function(data) {
            return $http.post(SERVER_URL + 'referral/add', data);
        },
        getReferralDownloads: function(data) {
            return $http.post(SERVER_URL + 'referral/download_count', data);
        },
        getLastPromoShown:function(){
          return localStorageService.get('promoPlansShown');
        },
        setLastPromoShown:function(showedDate){
          return localStorageService.set('promoPlansShown',showedDate);
        }
    }
}
