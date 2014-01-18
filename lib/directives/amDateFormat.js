'use strict';
angular.module('gdi2290.amDateFormat')
.filter('amDateFormat', function(Moment) {
    return function(value, format) {
      if (typeof value === 'undefined' || value === null) {
        return '';
      }

      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        // Milliseconds since the epoch
        value = new Date(parseInt(value, 10));
      }

      // else assume the given value is already a date
      if (Moment.then) {
        Moment().then(function(moment) {
          return moment(value).format(format);
        });
      } else {
        return Moment(value).format(format);
      }

    };
});
