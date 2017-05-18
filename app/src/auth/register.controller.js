angular.module('puraApp').component('register', {
    templateUrl: './src/auth/register.html',
    controller: registerController,
    bindings: {}
});


function registerController($state, $scope) {
    var self = this;



    this.register = function() {
        firebase.auth()
            .createUserWithEmailAndPassword(self.email, self.password)
            .then(function(authData) {
                console.log("authData" + authData);
                $state.go('index');
            })
            .catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                self.errorMessage = errorMessage;
                $scope.$apply();
                console.log("error" + error);
            });
    }

}
