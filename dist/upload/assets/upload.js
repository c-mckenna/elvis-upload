/**
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var RootCtrl = function RootCtrl(configService) {
      var _this = this;

      _classCallCheck(this, RootCtrl);

      configService.getConfig().then(function (data) {
         _this.data = data;
         _this.state = new State();
      });
   };

   RootCtrl.$invoke = ['configService'];

   angular.module("UploadApp", ['ngCookies', 'common.navigation', 'common.storage', 'common.templates', 'common.toolbar', 'explorer.confirm', 'explorer.drag', 'explorer.enter', 'explorer.flasher', 'explorer.httpdata', 'explorer.info', 'explorer.legend', 'explorer.message', 'explorer.modal', 'explorer.persist', 'explorer.projects', 'explorer.tabs', 'explorer.version', 'exp.ui.templates', 'upload.config', 'upload.file', 'upload.filedrop', 'upload.header', 'upload.templates', 'ui.bootstrap', 'ui.bootstrap-slider', 'page.footer'])

   // Set up all the service providers here.
   .config(['projectsServiceProvider', 'versionServiceProvider', 'persistServiceProvider', function (projectsServiceProvider, versionServiceProvider, persistServiceProvider) {
      versionServiceProvider.url("upload/assets/package.json");
      projectsServiceProvider.setProject("upload");
      persistServiceProvider.handler("local");
   }]).factory("userService", ["$cookies", function ($cookies) {
      // console.log("Cookie:" + $cookies.get("placenamesUpload"))
      var cookie = $cookies.get("placenamesUpload");
      var parts = cookie.split(";").reduce(function (acc, part) {
         var pair = part.split("=");
         acc[pair[0]] = pair[1];
         return acc;
      }, {});

      // console.log(parts);

      return {
         username: function username() {
            return parts.username;
         },
         expires: function expires() {
            return new Date(parts.expires * 1000);
         },
         jurisdiction: function jurisdiction() {
            return parts.jurisdiction;
         },
         token: function token() {
            return parts.token;
         }
      };
   }]).run(["userService", "$timeout", "$window", function (userService, $timeout, $window) {
      try {
         var delay = userService.expires().getTime() - Date.now();
         // console.log("Delay = " + delay)
         $timeout(function () {
            $window.location = "/";
         }, delay);
      } catch (e) {
         $window.location = "/";
      }
   }]).controller("RootCtrl", RootCtrl).filter('bytes', function () {
      return function (bytes, precision) {
         if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
         if (typeof precision === 'undefined') precision = 0;
         var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
             number = Math.floor(Math.log(bytes) / Math.log(1024));
         return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
      };
   });
}
'use strict';

{
   var _config = {
      version: '0.0.1',
      user: 'anon',
      maxFileSize: 1024 * 1024 * 64, // 64MB
      submit: {
         uploadUrl: "upload"
      }
   };

   angular.module("upload.config", []).service("configService", ['$q', function ($q) {
      var service = {
         getConfig: function getConfig(name) {
            var response = this.config;
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
"use strict";

{
   angular.module("upload.dialog", ["upload.filename", "upload.submit"]).directive("acceptProjection", [function () {
      return {
         scope: {
            state: "="
         },
         templateUrl: "upload/dialog/isprojection.html"
      };
   }]).directive("transformationTarget", ['configService', function (configService) {
      return {
         scope: {
            state: "="
         },
         templateUrl: "upload/dialog/transformationtarget.html",
         link: function link(scope) {
            configService.getConfig("transformation").then(function (data) {
               scope.transformations = data;
            });
         }
      };
   }]).directive("uploadDialog", ["messageService", "submitService", "userService", function (messageService, submitService, userService) {
      return {
         scope: {
            state: "=",
            settings: "="
         },
         templateUrl: "upload/dialog/dialog.html",
         link: function link(scope) {
            scope.cancel = function () {
               scope.state = new State();
            };
            scope.upload = function () {
               var state = scope.state;
               if (state.file.size >= 8 * 1024 * 1024) {
                  messageService.warn("File uploading. Large files may take some time.");
               } else {
                  messageService.info("Uploading file...");
               }

               scope.cancel();

               submitService.upload(state.file, userService.token()).then(function (response) {
                  messageService.clear();
                  messageService.success("File uploaded successfully an email will be sent after it is processed.");
               }).catch(function (e) {
                  messageService.clear();
                  messageService.error("File upload failed. If the file continues to fail, please report.");
               });
            };
         }
      };
   }]);
}
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var FileController = function FileController() {
      _classCallCheck(this, FileController);
   };

   angular.module("upload.file", ["upload.dialog"]).directive("file", function () {
      return {
         templateUrl: "upload/file/file.html"
      };
   }).controller("fileController", FileController);
}
"use strict";

{
   angular.module("upload.filedrop", []).directive("fileDrop", ["messageService", function (messageService) {
      return {
         templateUrl: "upload/filedrop/filedrop.html",
         scope: {
            state: "="
         },
         link: function link(scope, element) {
            var fileDrop = new FileDrop(element[0], function (file) {
               scope.$apply(function () {
                  var name = file.name;
                  var ext = name.substr(name.lastIndexOf(".") + 1);
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
      };
   }]);
}
"use strict";

{
   angular.module("upload.filename", []).directive("filename", [function () {
      return {
         scope: {
            state: "="
         },
         templateUrl: "upload/filename/filename.html"
      };
   }]);
}
'use strict';

{
	angular.module('upload.header', []).controller('headerController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

		var modifyConfigSource = function modifyConfigSource(headerConfig) {
			return headerConfig;
		};

		$scope.$on('headerUpdated', function (event, args) {
			$scope.headerConfig = modifyConfigSource(args);
		});
	}]).directive('icsmUser', ["userService", function (userService) {
		return {
			restrict: 'EA',
			template: "<span><strong>User Name:</strong> {{username}} <strong>Jurisdiction:</strong> {{jurisdiction}}</span>",
			link: function link(scope) {
				scope.username = userService.username();
				scope.jurisdiction = userService.jurisdiction();
			}
		};
	}]).directive('icsmHeader', [function () {
		var defaults = {
			heading: "ICSM",
			headingtitle: "ICSM",
			helpurl: "help.html",
			helptitle: "Get help about ICSM",
			helpalttext: "Get help about ICSM",
			skiptocontenttitle: "Skip to content",
			skiptocontent: "Skip to content",
			quicklinksurl: "/search/api/quickLinks/json?lang=en-US"
		};
		return {
			transclude: true,
			restrict: 'EA',
			templateUrl: "upload/header/header.html",
			scope: {
				breadcrumbs: "=",
				current: "=",
				heading: "=",
				headingtitle: "=",
				helpurl: "=",
				helptitle: "=",
				helpalttext: "=",
				skiptocontenttitle: "=",
				skiptocontent: "=",
				quicklinksurl: "="
			},
			link: function link(scope, element, attrs) {
				var data = angular.copy(defaults);
				angular.forEach(defaults, function (value, key) {
					if (!(key in scope)) {
						scope[key] = value;
					}
				});
			}
		};
	}]);
}
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var SubmitService = function () {
      function SubmitService($q, configService) {
         _classCallCheck(this, SubmitService);

         this.$q = $q;
         this.config = configService.config.submit;
      }

      _createClass(SubmitService, [{
         key: "upload",
         value: function upload(file, token) {
            //FILL FormData WITH FILE DETAILS.
            var postData = new FormData();
            var config = this.config;

            postData.append("file", file);

            // ADD LISTENERS.
            var objXhr = new XMLHttpRequest();
            //objXhr.addEventListener("progress", updateProgress, false);
            objXhr.addEventListener("load", transferComplete, false);

            // SEND FILE DETAILS TO THE API.
            objXhr.open("POST", config.uploadUrl + "?token=" + token);
            objXhr.send(postData);

            var promise = this.$q.defer();
            return promise.promise;

            // CONFIRMATION.
            function transferComplete(e) {
               console.log("Completed upload");
               if (e.target.status === 200) {
                  promise.resolve(e.target.response);
               } else {
                  promise.reject(e.target.response);
               }
            }
         }
      }]);

      return SubmitService;
   }();

   SubmitService.$inject = ["$q", "configService"];

   angular.module("upload.submit", []).service("submitService", SubmitService);
}
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileDrop = function FileDrop(element, handler) {
   _classCallCheck(this, FileDrop);

   if (!handler || typeof handler !== "function") {
      throw Error("No file handler provided");
   }

   if (!element) {
      throw Error("No element provided");
   }

   element.addEventListener("dragenter", dragenter, false);
   element.addEventListener("dragover", dragover, false);
   element.addEventListener("drop", drop, false);

   function dragenter(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log("dragenter");
   }

   function dragover(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log("dragover");
   }

   function drop(e) {
      e.stopPropagation();
      e.preventDefault();

      var dt = e.dataTransfer;
      var files = dt.files;
      handleFiles(files);
   }

   function handleFiles(files) {
      if (files) {
         for (var i = 0; i < files.length; i++) {
            handler(files.item(i));
         }
      }
   }
};
"use strict";

if (!String.prototype.endsWith) {
   String.prototype.endsWith = function (searchStr, Position) {
      // This works much better than >= because
      // it compensates for NaN:
      if (!(Position < this.length)) Position = this.length;else Position |= 0; // round position
      return this.substr(Position - searchStr.length, searchStr.length) === searchStr;
   };
}

if (!Object.values) {
   Object.values = function values(O) {
      return Object.keys(O).map(function (key) {
         return O[key];
      });
   };
}
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = function State() {
  _classCallCheck(this, State);
};
"use strict";

{
   angular.module("upload.mandatory", []).directive("mandatory", function () {
      return {
         template: '<span class="mandatory" title="You must provide a value">*</span>'
      };
   });
}
angular.module("upload.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("upload/dialog/dialog.html","<div class=\"upload-dialog\">\r\n   <div class=\"ud-info\" ng-if=\"!state.file\">\r\n      <div style=\"font-weight: bold\">\r\n         <i class=\"fa fa-hand-o-left point-at-box fa-2x\" aria-hidden=\"true\" style=\"padding-right:12px;\"></i>\r\n         Select and drop file for processing\r\n      </div>\r\n      <br/>\r\n      <div>\r\n         <span style=\"font-weight: bold\">Placenames -</span>\r\n         Drop a single file for adding placenames features to the <a href=\"http://placenames.fsdf.org.au\" target=\"_blank\">Placenames Application</a>.\r\n      </div>\r\n\r\n   </div>\r\n\r\n   <div ng-if=\"state.file\">\r\n      <h3>Selected {{state.file.name}} ({{state.file.size | bytes}})</h3>\r\n   </div>\r\n   <div ng-if=\"state.file.size > settings.maxFileSize\">\r\n      The size of the file to be uploaded must not exceed {{settings.maxFileSize | bytes}}. Please select a smaller file.\r\n      <br/><br/>\r\n      <button type=\"button\" class=\"btn btn-primary\" ng-click=\"cancel()\">OK</button>\r\n   </div>\r\n   <div ng-if=\"state.file.size <= settings.maxFileSize\">\r\n      Are you sure you want to upload this file? If this data validates successfully it will overwrite the existing data\r\n      in the <a href=\"http://placenames.fsdf.org.au\" target=\"_blank\"></a>Placenames application</a>.\r\n      <br/>\r\n      <br/>\r\n      <button type=\"button\" class=\"btn btn-primary\" ng-click=\"upload()\">Upload Now</button>\r\n      <button type=\"button\" class=\"btn btn-primary\" ng-click=\"cancel()\">Cancel</button>\r\n   </div>\r\n</div>");
$templateCache.put("upload/file/file.html","<div class=\"container-fluid file-container\" ng-controller=\"RootCtrl as root\">\r\n   <div class=\"row\">\r\n      <div class=\"col-md-7\" style=\"border-right: 2px solid lightgray\">\r\n         <div>\r\n            <h3 style=\"margin-top:10px\">File Drop Directions</h3>\r\n            As a registered submitter of placenames features it is your responsibility to ensure your data is in the approved format. While any file is able to be submitted this page only submits the file for processing. The only message you will receive at this point is that the file has been queued for processing. Later, once the file has been processed you will receive an email describing the success or otherwise of the job.\r\n            <div>\r\n               <div style=\"padding-bottom:5px\">\r\n                  <file-drop state=\"root.state\" />\r\n               </div>\r\n               <input-format list=\"root.data.fileUploadFormats\" />\r\n            </div>\r\n         </div>\r\n\r\n      </div>\r\n      <div class=\"col-md-5\" >\r\n         <upload-dialog state=\"root.state\" settings=\"root.data\"/>\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("upload/filedrop/filedrop.html","<div id=\"fileDrop\" title=\"Drop a file with Placenames Features here\">\r\n   <br/> Drop <br/> File <br/> Here\r\n</div>");
$templateCache.put("upload/filename/filename.html","<div class=\"input-group\">\r\n   <span class=\"input-group-addon\" id=\"nedf-filename\">Filename</span>\r\n   <input type=\"text\" ng-maxlength=\"30\" ng-trim=\"true\" ng-keypress=\"restrict($event)\"\r\n         ng-model=\"state.outputName\" class=\"form-control\"\r\n         placeholder=\"Filename\" aria-describedby=\"pos-filename\" />\r\n   <span class=\"input-group-addon\" id=\"basic-addon2\">.zip</span>\r\n</div>");
$templateCache.put("upload/header/header.html","<div class=\"container-full common-header\" style=\"padding-right:10px; padding-left:10px\">\r\n    <div class=\"navbar-header\">\r\n\r\n        <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".ga-header-collapse\">\r\n            <span class=\"sr-only\">Toggle navigation</span>\r\n            <span class=\"icon-bar\"></span>\r\n            <span class=\"icon-bar\"></span>\r\n            <span class=\"icon-bar\"></span>\r\n        </button>\r\n        <a href=\"/\" class=\"appTitle visible-xs\">\r\n            <h1 style=\"font-size:120%\">{{heading}}</h1>\r\n        </a>\r\n    </div>\r\n    <div class=\"navbar-collapse collapse ga-header-collapse\">\r\n        <ul class=\"nav navbar-nav\">\r\n            <li class=\"hidden-xs\"><a href=\"/\"><h1 class=\"applicationTitle\">{{heading}}</h1></a></li>\r\n        </ul>\r\n        <ul class=\"nav navbar-nav navbar-right nav-icons\">\r\n        	<li common-navigation current=\"current\" role=\"menuitem\" style=\"padding-right:10px\"></li>\r\n			<li mars-version-display role=\"menuitem\"></li>\r\n			<li style=\"width:10px\"></li>\r\n        </ul>\r\n    </div><!--/.nav-collapse -->\r\n    <div style=\"position:absolute; bottom:25px; right:15px\">\r\n      <icsm-user></icsm-user>\r\n   </div>\r\n</div>\r\n\r\n<!-- Strap -->\r\n<div class=\"row\">\r\n    <div class=\"col-md-12\">\r\n        <div class=\"strap-blue\">\r\n        </div>\r\n        <div class=\"strap-white\">\r\n        </div>\r\n        <div class=\"strap-red\">\r\n        </div>\r\n    </div>\r\n</div>");}]);