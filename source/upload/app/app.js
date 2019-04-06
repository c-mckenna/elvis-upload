{
   class RootCtrl {
      constructor(configService) {
         configService.getConfig().then((data) => {
            this.data = data;
            this.state = new State();
         });
      }
   }

   RootCtrl.$invoke = ['configService'];

   angular.module("UploadApp", [
      'ngCookies',
      'common.navigation',
      'common.storage',
      'common.templates',
      'common.toolbar',

      'explorer.confirm',
      'explorer.drag',
      'explorer.enter',
      'explorer.flasher',
      'explorer.httpdata',
      'explorer.info',
      'explorer.legend',
      'explorer.message',
      'explorer.modal',
		'explorer.persist',
      'explorer.projects',
      'explorer.tabs',
      'explorer.version',
      'exp.ui.templates',

      'upload.config',
      'upload.file',
      'upload.filedrop',
      'upload.header',
      'upload.templates',

      'ui.bootstrap',
      'ui.bootstrap-slider',
      'page.footer'
   ])

      // Set up all the service providers here.
      .config(['projectsServiceProvider', 'versionServiceProvider', 'persistServiceProvider',
         function (projectsServiceProvider, versionServiceProvider, persistServiceProvider) {
            versionServiceProvider.url("upload/assets/package.json");
            projectsServiceProvider.setProject("upload");
				persistServiceProvider.handler("local");
         }])

      .factory("userService", ["$cookies", function ($cookies) {
         // console.log("Cookie:" + $cookies.get("placenamesUpload"))
         let cookie = $cookies.get("placenamesUpload");
         let parts = cookie.split(";").reduce((acc, part) => {
            let pair = part.split("=");
            acc[pair[0]] = pair[1];
            return acc;
         }, {});

         // console.log(parts);

         return {
            username: function () {
               return parts.username;
            },
            expires: function() {
               return new Date(parts.expires * 1000);
            },
            jurisdiction: function() {
               return parts.jurisdiction;
            },
            token: function() {
               return parts.token;
            }
         };
      }])

      .run(["userService", "$timeout", "$window", function (userService, $timeout, $window) {
         try {
            let delay = userService.expires().getTime() - Date.now();
            // console.log("Delay = " + delay)
               $timeout(() => {
               $window.location = "/";
            }, delay);
         } catch(e) {
            $window.location = "/";
         }
      }])

      .controller("RootCtrl", RootCtrl)

      .filter('bytes', function () {
         return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 0;
            let units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
               number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
         }
      });
}