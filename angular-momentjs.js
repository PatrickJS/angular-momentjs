(function() {
  'use strict';

angular.module('angular-momentjs', [])
  .factory('$moment', ['$rootScope', '$document', '$q', '$window',
    function($rootScope, $document, $q, $window) {
      var d = $q.defer();
      var moment = $window.moment;
      function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() {
          d.resolve($window.moment);
        });
      }
      // Create a script tag with moment as the source
      // and call our onScriptLoad callback when it
      // has been loaded
      var scriptTag = $document[0].createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      scriptTag.src = '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.2.1/moment.min.js';
      scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') onScriptLoad();
      }
      scriptTag.onload = onScriptLoad;

      var s = $document[0].getElementsByTagName('body')[0];
      s.appendChild(scriptTag);
      moment.promise = d.promise;
      return moment;
  }]);

}());
