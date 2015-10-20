'use strict';

angular.module('gdi2290.moment-service')
.provider('$moment', function() {
  var _asyncLoading = false;
  var _scriptUrl = '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment.js';
  var _localeConfig = {};
  var _locale;

  this.asyncLoading = function(config) {
    _asyncLoading = config || _asyncLoading;
    return this;
  };

  this.scriptUrl = function(url) {
    _scriptUrl = url || _scriptUrl;
    return this;
  };

  this.locale = function(locale, config) {
    _locale = locale || _locale;
    _localeConfig = config || _localeConfig;
    return this;
  };

  // Create a script tag with moment as the source
  // and call our onScriptLoad callback when it
  // has been loaded
  function createScript(callback) {
    if (!document) { return; }
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = _scriptUrl;
    scriptTag.onreadystatechange = function() {
      if (this.readyState === 'complete') {
        callback();
      }
    };
    scriptTag.onload = callback;
    var s = document.getElementsByTagName('head')[0];
    s.appendChild(scriptTag);
  }

  this.$get = ['$timeout', '$q', '$window', function($timeout, $q, $window) {
      var deferred = $q.defer();
      var _moment = $window.moment;

      if (_asyncLoading) {
        // Load client in the browser
        var onScriptLoad = function(callback) {
          $timeout(function() {
            if (_locale) {
              if ($window.moment.locale) {
                $window.moment.locale(_locale, _localeConfig);
              } else {
                $window.moment.locale(_locale, _localeConfig);
              }
            }
            deferred.resolve($window.moment);
          });
        };
        createScript(onScriptLoad);
      } else {
        if (_locale) {
          if ($window.moment.locale) {
            $window.moment.locale(_locale, _localeConfig);
          } else {
            $window.moment.lang(_locale, _localeConfig);
          }
        }
      }

      return (_asyncLoading) ? deferred.promise: _moment;
  }];
});
