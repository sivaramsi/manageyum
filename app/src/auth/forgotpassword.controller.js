angular.module('puraApp').component('forgotpassword', {
    templateUrl: './src/auth/forgotpassword.html',
    controller: forgotpasswordController,
    bindings: {}
});


function forgotpasswordController($state, $scope, firebase) {
    var self = this;


    this.forgotpassword = function() {

        firebase
            .auth()
            .sendPasswordResetEmail(self.email)
            .then(function(data) {
                console.log("passwrod reset mail sent");
                self.sucessMessage = "password reset mail sent, please check your mailbox.";
                $scope.$apply();
            })
            .catch(function(error) {
                console.log("passwrod reset mail error" + error);
                self.errorMessage = error.message;
                $scope.$apply();
            });
    }

}
