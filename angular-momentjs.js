;(function(module, undefined) {
'use strict';

module.provider('$moment', function() {
  var asyncLoading = false;
  var scriptUrl = '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.3.1/moment.min.js';

  this.asyncLoading = function(config) {
    asyncLoading = config || asyncLoading;
    return this;
  };

  this.scriptUrl = function(url) {
    scriptUrl = url || scriptUrl;
    return this;
  };

  this.isPromise = function() {
    return asyncLoading;
  }

  // Create a script tag with moment as the source
  // and call our onScriptLoad callback when it
  // has been loaded
  function createScript($document, callback) {
    var scriptTag = $document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = scriptUrl;
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') {
        callback();
      }
    }
    scriptTag.onload = callback;
    var s = $document.getElementsByTagName('body')[0];
        s.appendChild(scriptTag);
  }

  this.$get = ['$timeout', '$document', '$q', '$window',
    function($timeout, $document, $q, $window) {
      var deferred = $q.defer();
      var _moment = $window.moment;

      // Load client in the browser
      function onScriptLoad(callback) {
        $timeout(function() {
          deferred.resolve($window.moment);
        });
      };

      createScript($document[0], onScriptLoad);

      return (this.asyncLoading) ? _moment : deferred.promise;
  }]
});

module.directive('moment', ['$moment', '$timeout',
  function($moment, $timeout) {
    return function (scope, element, attr) {
      var activeTimeout = null;
      var currentValue;
      var currentFormat;

      function cancelTimer() {
        if (activeTimeout) {
          $timeout.cancel(activeTimeout);
          activeTimeout = null;
        }
      }

      function updateTime(momentInstance) {
        element.text(momentInstance.fromNow());
        var howOld = $moment().diff(momentInstance, 'minute');
        var secondsUntilUpdate = 3600;
        if (howOld < 1) {
          secondsUntilUpdate = 1;
        } else if (howOld < 60) {
          secondsUntilUpdate = 30;
        } else if (howOld < 180) {
          secondsUntilUpdate = 300;
        }

        activeTimeout = $timeout(function () {
          updateTime(momentInstance);
        }, secondsUntilUpdate * 1000, false);
      }

      function updateMoment() {
        cancelTimer();
        if ($moment.isPromise()) {
          $moment.then(function(moment) {
            updateTime(moment(currentValue, currentFormat));
          };
        } else {
          updateTime($moment(currentValue, currentFormat));
        }
      }

      scope.$watch(attr.amTimeAgo, function (value) {
        if ((typeof value === 'undefined') || (value === null) || (value === '')) {
          cancelTimer();
          if (currentValue) {
            element.text('');
            currentValue = null;
          }
          return;
        }

        if (angular.isNumber(value)) {
          // Milliseconds since the epoch
          value = new Date(value);
        }
        // else assume the given value is already a date

        currentValue = value;
        updateMoment();
      });

      attr.$observe('amFormat', function (format) {
        currentFormat = format;
        if (currentValue) {
          updateMoment();
        }
      });

      scope.$on('$destroy', function () {
        cancelTimer();
      });

    };
}]);

module.filter('moment', ['$moment',
  function($moment) {

    return function(value, format) {
      if (typeof value === 'undefined' || value === null) {
        return '';
      }

      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        // Milliseconds since the epoch
        value = new Date(parseInt(value, 10));
      }

      // else assume the given value is already a date
      if ($moment.isPromise()) {
        $moment.then(function(moment) {
          return moment(value).format(format);
        };
      } else {
        return $moment(value).format(format);
      }

    };
}]);


}(angular.module('angular-momentjs', [])));
