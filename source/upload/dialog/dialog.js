{
   angular.module("upload.dialog",
         ["upload.filename", "upload.submit"])

      .directive("acceptProjection", [
         function () {
            return {
               scope: {
                  state: "="
               },
               templateUrl: "upload/dialog/isprojection.html"
            };
         }
      ])

      .directive("transformationTarget", ['configService',
         function (configService) {
            return {
               scope: {
                  state: "="
               },
               templateUrl: "upload/dialog/transformationtarget.html",
               link: function(scope) {
                  configService.getConfig("transformation").then(data => {
                     scope.transformations = data;
                  });
               }
            };
         }
      ])

      .directive("uploadDialog", ["submitService", "userService",
         function (submitService, userService) {
            return {
               scope: {
                  state: "=",
                  settings: "="
               },
               templateUrl: "upload/dialog/dialog.html",
               link: function (scope) {
                  scope.cancel = () => {
                     scope.state = new State();
                  }
                  scope.upload = () => {
                     submitService.upload(scope.state.file, userService.token());
                  }
               }
            };
         }
      ]);
}