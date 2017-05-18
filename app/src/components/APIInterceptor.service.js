angular.module('puraApp')
    .service('APIInterceptor', function($rootScope, $injector) {
        var service = this;

        service.request = function(config) {
            var Auth =$injector.get('Auth');
            var authData = Auth.$getAuth();

            var access_token = authData ? authData.token : null;

            if (access_token) {
                config.headers.authorization = access_token;
            }
            return config;
        };

        service.responseError = function(response) {
            if (response.status === 401) {
                //$rootScope.$broadcast('unauthorized');
            }
            return response;
        };
    })
