// Example
// Rename this 'example' then use it like so:
//
// <svg example viewBox="0 0 512 256"></svg>

app.directive('example', function() {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {
      var svg = d3.select(elem[0]);
      // Put static code here

      scope.$watch('peaks', function() {
        if (!scope.peaks) return false;
        console.log('example directive');
        // Put code to update once data is recieved here
        
      });

    }
  }
});


