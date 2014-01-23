'use strict';

angular.module('gdi2290.moment-service')
.provider('$moment', function() {
  var _asyncLoading = false;
  var _scriptUrl = '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.0/moment.min.js';

  this.asyncLoading = function(config) {
    _asyncLoading = config || _asyncLoading;
    return this;
  };

  this.scriptUrl = function(url) {
    _scriptUrl = url || _scriptUrl;
    return this;
  };

  // Create a script tag with moment as the source
  // and call our onScriptLoad callback when it
  // has been loaded
  function createScript($document, callback) {
    var scriptTag = $document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = _scriptUrl;
    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') {
        callback();
      }
    };
    scriptTag.onload = callback;
    var s = $document.getElementsByTagName('body')[0];
    s.appendChild(scriptTag);
  }

  this.$get = function($timeout, $document, $q, $window) {
      var deferred = $q.defer();
      var _moment = $window.moment;

      if (_asyncLoading) {
        // Load client in the browser
        var onScriptLoad = function(callback) {
          $timeout(function() {
            deferred.resolve($window.moment);
          });
        };
        createScript($document[0], onScriptLoad);
      }

      return (_asyncLoading) ? deferred.promise: _moment;
  };
});
