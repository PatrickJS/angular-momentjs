'use strict';
angular.module('gdi2290.amTimeAgo')
.directive('amTimeAgo', ['$moment', '$timeout', function($moment, $timeout) {
    function isUndefined(value) {
      return (typeof value === 'undefined') || (value === null) || (value === '');
    }

    return function(scope, element, attrs) {
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

        if ($moment.then) {
          $moment().then(function(moment) {
            howOld = moment().diff(momentInstance, 'minute');
          });
        } else {
          howOld = $moment().diff(momentInstance, 'minute');
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
        if ($moment().then) {
          $moment.then(function(moment) {
            updateTime(moment(currentValue, currentFormat));
          });
        } else {
          updateTime($moment(currentValue, currentFormat));
        }
      }



      scope.$watch(attrs.amTimeAgo, function (value) {
        if (isUndefined(value)) {
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

      attrs.$observe('amFormat', function (format) {
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
