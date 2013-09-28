# angular-momentjs [![Build Status](https://travis-ci.org/gdi2290/angular-momentjs.png?branch=master)](https://travis-ci.org/gdi2290/angular-momentjs)

Moment.js with Angular.js

#How do I add this to my project?

You can download angular-momentjs by:

* (prefered) Using bower and running `bower install angular-momentjs --save`
* Using npm and running `npm install angular-momentjs --save`
* Downloading it manually by clicking [here to download development unminified version](https://raw.github.com/gdi2290/angular-momentjs/master/angular-momentjs.js)


````html
<body ng-app="YOUR_APP" ng-controller="MainCtrl">
 {{ time }}
  or
 {{ anotherTime }}
</body>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.2.1/moment.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.2/angular.min.js"></script>
<script src="app/bower_components/angular-momentjs/angular-momentjs.js"></script>
<script>
  angular.module('YOUR_APP', [
    'angular-momentjs',
    'controllers'
  ]);
  
  angular.module('controllers', ['angular-moment'])
    .controller('MainCtrl', ['$scope', '$moment', function($scope, $moment) {
      // if you include momentjs
      $scope.time = $moment("20111031", "YYYYMMDD").fromNow();
      
      // if you don't include momentjs angular-moment will inject the script
      $moment.promise.then(function(t) {
        $scope.anotherTime = t("20111031", "YYYYMMDD").fromNow();
      })
    }]);
</script>

````
