angular.module('puraApp').component('login', {
    templateUrl: './src/auth/loginform.html',
    controller: loginController,
    bindings: {}
});


function loginController($state, $scope) {
    var self = this;


    this.login = function() {
        self.loading = true;
        firebase.auth()
            .signInWithEmailAndPassword(self.email, self.password)
            .then(function(authData) {
                console.log("authData" + authData);
                self.loading = false;
                $state.go('index');
            })
            .catch(function(error) {
                self.loading = false;
                var errorCode = error.code;
                var errorMessage = error.message;
                self.errorMessage = errorMessage;
                $scope.$apply();
                console.log("error" + error);
            });



    }

}
