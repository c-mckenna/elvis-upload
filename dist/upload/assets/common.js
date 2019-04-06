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

"use strict";

{
   angular.module("common.storage", ['explorer.projects']).factory("storageService", ['$log', '$q', 'projectsService', function ($log, $q, projectsService) {
      return {
         setGlobalItem: function setGlobalItem(key, value) {
            this._setItem("_system", key, value);
         },

         setItem: function setItem(key, value) {
            projectsService.getCurrentProject().then(function (project) {
               this._setItem(project, key, value);
            }.bind(this));
         },

         _setItem: function _setItem(project, key, value) {
            $log.debug("Fetching state for key locally" + key);
            localStorage.setItem("mars.anon." + project + "." + key, JSON.stringify(value));
         },

         getGlobalItem: function getGlobalItem(key) {
            return this._getItem("_system", key);
         },

         getItem: function getItem(key) {
            var deferred = $q.defer();
            projectsService.getCurrentProject().then(function (project) {
               this._getItem(project, key).then(function (response) {
                  deferred.resolve(response);
               });
            }.bind(this));
            return deferred.promise;
         },

         _getItem: function _getItem(project, key) {
            $log.debug("Fetching state locally for key " + key);
            var item = localStorage.getItem("mars.anon." + project + "." + key);
            if (item) {
               try {
                  item = JSON.parse(item);
               } catch (e) {
                  // Do nothing as it will be a string
               }
            }
            return $q.when(item);
         }
      };
   }]);
}
"use strict";

{
   angular.module("common.toolbar", []).directive("icsmToolbar", [function () {
      return {
         controller: 'toolbarLinksCtrl'
      };
   }])

   /**
    * Override the default mars tool bar row so that a different implementation of the toolbar can be used.
    */
   .directive('icsmToolbarRow', [function () {
      var DEFAULT_TITLE = "Satellite to Topography bias on base map.";

      return {
         scope: {
            map: "=",
            overlaytitle: "=?"
         },
         restrict: 'AE',
         templateUrl: 'common/toolbar/toolbar.html',
         link: function link(scope) {
            scope.overlaytitle = scope.overlaytitle ? scope.overlaytitle : DEFAULT_TITLE;
         }
      };
   }]).controller("toolbarLinksCtrl", ["$scope", "configService", function ($scope, configService) {

      var self = this;
      configService.getConfig().then(function (config) {
         self.links = config.toolbarLinks;
      });

      $scope.item = "";
      $scope.toggleItem = function (item) {
         $scope.item = $scope.item == item ? "" : item;
      };
   }]);
}
'use strict';

{
	angular.module('common.altthemes', [])

	/**
 	*
 	* Override the original mars user.
 	*
 	  */
	.directive('altThemes', ['altthemesService', function (themesService) {
		return {
			restrict: 'AE',
			templateUrl: 'common/navigation/altthemes.html',
			scope: {
				current: "="
			},
			link: function link(scope) {
				themesService.getThemes().then(function (themes) {
					scope.themes = themes;
				});

				themesService.getCurrentTheme().then(function (theme) {
					scope.theme = theme;
				});

				scope.changeTheme = function (theme) {
					scope.theme = theme;
					themesService.setTheme(theme.key);
				};
			}
		};
	}]).controller('altthemesCtrl', ['altthemesService', function (altthemesService) {
		this.service = altthemesService;
	}]).filter('altthemesFilter', function () {
		return function (features, theme) {
			var response = [];
			// Give 'em all if they haven't set a theme.
			if (!theme) {
				return features;
			}

			if (features) {
				features.forEach(function (feature) {
					if (feature.themes) {
						if (feature.themes.some(function (name) {
							return name === theme.key;
						})) {
							response.push(feature);
						}
					}
				});
			}
			return response;
		};
	}).factory('altthemesService', ['$q', '$http', 'storageService', function ($q, $http, storageService) {
		var THEME_PERSIST_KEY = 'positioning.current.theme';
		var THEMES_LOCATION = 'positioning/resources/config/themes.json';
		var DEFAULT_THEME = "All";
		var waiting = [];
		var self = this;

		this.themes = [];
		this.theme = null;

		storageService.getItem(THEME_PERSIST_KEY).then(function (value) {
			if (!value) {
				value = DEFAULT_THEME;
			}
			$http.get(THEMES_LOCATION, { cache: true }).then(function (response) {
				var themes = response.data.themes;

				self.themes = themes;
				self.theme = themes[value];
				// Decorate the key
				angular.forEach(themes, function (theme, key) {
					theme.key = key;
				});
				waiting.forEach(function (wait) {
					wait.resolve(self.theme);
				});
			});
		});

		this.getCurrentTheme = function () {
			if (this.theme) {
				return $q.when(self.theme);
			} else {
				var waiter = $q.defer();
				waiting.push(waiter);
				return waiter.promise;
			}
		};

		this.getThemes = function () {
			return $http.get(THEMES_LOCATION, { cache: true }).then(function (response) {
				return response.data.themes;
			});
		};

		this.setTheme = function (key) {
			this.theme = this.themes[key];
			storageService.setItem(THEME_PERSIST_KEY, key);
		};

		return this;
	}]).filter('altthemesEnabled', function () {
		return function (headers) {
			if (headers) {
				return headers.filter(function (value) {
					return !!value.enabled;
				});
			}
			return headers;
		};
	}).filter('altthemesMatchCurrent', function () {
		return function (headers, current) {
			if (headers) {
				return headers.filter(function (value) {
					return !!value.keys.find(function (key) {
						return key === current;
					});
				});
			}
			return headers;
		};
	});
}
'use strict';

{
   angular.module('common.navigation', [])
   /**
    *
    * Override the original mars user.
    *
    */
   .directive('commonNavigation', [function () {
      return {
         restrict: 'AE',
         template: "<alt-themes current='current'></alt-themes>",
         scope: {
            current: "=?"
         },
         link: function link(scope) {
            scope.username = "Anonymous";
            if (!scope.current) {
               scope.current = "none";
            }
         }
      };
   }]).factory('navigationService', [function () {
      return {};
   }]);
}
angular.module("common.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("common/toolbar/toolbar.html","<div icsm-toolbar>\r\n	<div class=\"row toolBarGroup\">\r\n		<div class=\"btn-group searchBar\" ng-show=\"root.whichSearch != \'region\'\">\r\n			<div class=\"input-group\" geo-search>\r\n				<input type=\"text\" ng-autocomplete ng-model=\"values.from.description\" options=\'{country:\"au\"}\'\r\n							size=\"32\" title=\"Select a locality to pan the map to.\" class=\"form-control\" aria-label=\"...\">\r\n				<div class=\"input-group-btn\">\r\n    				<button ng-click=\"zoom(false)\" exp-ga=\"[\'send\', \'event\', \'icsm\', \'click\', \'zoom to location\']\"\r\n						class=\"btn btn-default\"\r\n						title=\"Pan and potentially zoom to location.\"><i class=\"fa fa-search\"></i></button>\r\n				</div>\r\n			</div>\r\n		</div>\r\n\r\n		<div class=\"pull-right\">\r\n			<div class=\"btn-toolbar radCore\" role=\"toolbar\"  icsm-toolbar>\r\n				<div class=\"btn-group\">\r\n					<!-- < icsm-state-toggle></icsm-state-toggle> -->\r\n				</div>\r\n			</div>\r\n\r\n			<div class=\"btn-toolbar\" style=\"margin:right:10px;display:inline-block\">\r\n				<div class=\"btn-group\" title=\"{{overlaytitle}}\">\r\n					<span class=\"btn btn-default\" common-baselayer-control max-zoom=\"16\"></span>\r\n				</div>\r\n			</div>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("common/navigation/altthemes.html","<span class=\"altthemes-container\">\r\n	<span ng-repeat=\"item in themes | altthemesMatchCurrent : current\">\r\n       <a title=\"{{item.label}}\" ng-href=\"{{item.url}}\" class=\"altthemesItemCompact\" target=\"_blank\">\r\n         <span class=\"altthemes-icon\" ng-class=\"item.className\"></span>\r\n       </a>\r\n    </li>\r\n</span>");}]);