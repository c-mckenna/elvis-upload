{
   class FileController {
      constructor() {}
   }

   angular.module("upload.file", ["upload.dialog"])

   .directive("file", function() {
      return {
         templateUrl: "upload/file/file.html"
      };
   })

   .controller("fileController", FileController);

}