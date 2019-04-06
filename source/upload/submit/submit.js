{
   class SubmitService {
      constructor($q, configService) {
         this.$q = $q;
         this.config = configService.config.submit;
      }

      upload(file, token) {
         //FILL FormData WITH FILE DETAILS.
         var postData = new FormData();
         let config = this.config;

         postData.set("file", file);

         // ADD LISTENERS.
         var objXhr = new XMLHttpRequest();
         //objXhr.addEventListener("progress", updateProgress, false);
         objXhr.addEventListener("load", transferComplete, false);

         // SEND FILE DETAILS TO THE API.
         objXhr.open("POST", config.uploadUrl + "?token=" + token);
         objXhr.send(postData);

         let promise = this.$q.defer();
         return promise.promise;

         // CONFIRMATION.
         function transferComplete(e) {
            console.log("Completed upload")
            if(e.target.status === 200) {
               promise.resolve(e.target.response);
            } else {
               promise.reject(e.target.response);
            }
         }
      }
   }
   SubmitService.$inject = ["$q", "configService"];

   angular.module("upload.submit", [])
      .service("submitService", SubmitService)
}