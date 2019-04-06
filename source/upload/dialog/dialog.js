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

      .directive("uploadDialog", ["messageService", "submitService", "userService",
         function (messageService, submitService, userService) {
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
                     if(scope.state.file.size >= 8 * 1024 * 1024) {
                        messageService.warn("File uploading. Large files may take some time.");
                     } else {
                        messageService.info("Uploading file...");
                     }

                     scope.cancel();

                     submitService.upload(scope.state.file, userService.token()).then(response => {
                        messageService.clear();
                        messageService.success("File uploaded successfully an email will be sent after it is processed.");
                     }).catch(e => {
                        messageService.clear();
                        messageService.error("File upload failed. If the file continues to fail, please report.");
                     });
                  }
               }
            };
         }
      ]);
}