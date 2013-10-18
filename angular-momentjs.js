;(function(module, undefined) {
'use strict';

module.provider('Moment', function() {
  var _asyncLoading = false;
  var _scriptUrl = '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.2.1/moment.min.js';

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
      if (this.readyState == 'complete') {
        callback();
      }
    }
    scriptTag.onload = callback;
    var s = $document.getElementsByTagName('body')[0];
        s.appendChild(scriptTag);
  }

  this.$get = function($timeout, $document, $q, $window) {
      var deferred = $q.defer();
      var _moment = $window.moment;

      deferred.isPromise = true;
      _moment.isPromise = false;

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

module.directive('amTimeAgo', ['Moment', '$timeout', function(Moment, $timeout) {
    return function(scope, element, attr) {
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
        var howOld;

        if (Moment.isPromise) {
          Moment().then(function(moment) {
            howOld = moment().diff(momentInstance, 'minute');
          });
        } else {
          howOld = Moment().diff(momentInstance, 'minute');
        }

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
        if (Moment().isPromise) {
          Moment.then(function(moment) {
            updateTime(moment(currentValue, currentFormat));
          });
        } else {
          updateTime(Moment(currentValue, currentFormat));
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

module.filter('amDateFormat', ['Moment', function(Moment) {
    return function(value, format) {
      if (typeof value === 'undefined' || value === null) {
        return '';
      }

      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        // Milliseconds since the epoch
        value = new Date(parseInt(value, 10));
      }

      // else assume the given value is already a date
      if (Moment.isPromise) {
        Moment().then(function(moment) {
          return moment(value).format(format);
        });
      } else {
        return Moment(value).format(format);
      }

    };
}]);


}(angular.module('angular-momentjs', [])));
