{
   let _config = {
      version: '0.0.1',
      user: 'anon',
      maxFileSize: 1024 * 1024 * 64,  // 64MB
      submit: {
         uploadUrl: "upload"
      }
   };

   angular.module("upload.config", [])

      .service("configService", ['$q', function ($q) {
         let service = {
            getConfig(name) {
               let response = this.config;
               if (name) {
                  response = response[name];
               }
               return $q.when(response);
            },

            get config() {
               return _config;
            }
         };

         return service;
      }]);
}