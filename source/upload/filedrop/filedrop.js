{
   angular.module("upload.filedrop", [])

      .directive("fileDrop", ["messageService", function (messageService) {
         return {
            templateUrl: "upload/filedrop/filedrop.html",
            scope: {
               state: "="
            },
            link: function (scope, element) {
               let fileDrop = new FileDrop(element[0], file => {
                  scope.$apply(() => {
                     let name = file.name;
                     let ext = name.substr(name.lastIndexOf(".") + 1);
                     ext = ext ? ext.toLowerCase() : "";
                     handleSingle(ext, file);
                  });
               });

               function handleSingle(ext, file) {
                  if (scope.state.file) {
                     messageService.error("If you are sure you want to replace the file \"Remove\" the previous file first.");
                  } else {
                     scope.state.file = file;
                     scope.state.type = "single";
                     scope.state.extension = ext;
                     scope.state.outputName = file.name.substr(0, file.name.lastIndexOf("."));
                  }
               }
            }
         }
      }]);
}