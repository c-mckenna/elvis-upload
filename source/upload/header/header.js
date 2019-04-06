
{
	angular.module('upload.header', [])

		.controller('headerController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

			let modifyConfigSource = function (headerConfig) {
				return headerConfig;
			};

			$scope.$on('headerUpdated', function (event, args) {
				$scope.headerConfig = modifyConfigSource(args);
			});
		}])

		.directive('icsmUser', ["userService", function (userService) {
         return {
				restrict: 'EA',
            template: "<span><strong>User Name:</strong> {{username}} <strong>Jurisdiction:</strong> {{jurisdiction}}</span>",
            link: function(scope) {
               scope.username = userService.username();
               scope.jurisdiction = userService.jurisdiction();
            }
         }
      }])
      .directive('icsmHeader', [function () {
			let defaults = {
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
				link: function (scope, element, attrs) {
					let data = angular.copy(defaults);
					angular.forEach(defaults, function (value, key) {
						if (!(key in scope)) {
							scope[key] = value;
						}
					});
				}
			};
		}]);
}
