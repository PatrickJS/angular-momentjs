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
  }])
  .directive('amTimeAgo', ['$moment', '$timeout', function ($moment, $timeout) {

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
        updateTime($moment(currentValue, currentFormat));
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
  }])
  .filter('amDateFormat', ['$moment', function ($moment) {

    return function (value, format) {
      if (typeof value === 'undefined' || value === null) {
        return '';
      }

      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        // Milliseconds since the epoch
        value = new Date(parseInt(value, 10));
      }
      // else assume the given value is already a date

      return $moment(value).format(format);
    };
  }]);
  

}());
