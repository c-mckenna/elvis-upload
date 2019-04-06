{
   angular.module("upload.filename", [])
   .directive("filename", [function() {
      return {
         scope: {
            state: "="
         },
         templateUrl: "upload/filename/filename.html"
      }
   }]);
}