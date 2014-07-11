
app.directive('waveform', function() {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {
      var svg = d3.select(elem[0]);
      var x = d3.scale.linear().range([0, 1024]);
      var y = d3.scale.linear().range([256, 0]);
      var line = d3.svg.line()
          .x(function(d, i) { return x(i) })
          .y(function(d) { return y(d) });
      var area = d3.svg.area()
          .x(function(d, i) { return x(i) })
          .y0(256) 
          .y1(function(d) { return y(d) });

      scope.$watch('peaks', function() {
        if (!scope.peaks) return false;
        console.log('waveform directive');
        x.domain([0, scope.peaks.length]);
        y.domain([0,1]);
        console.log(line);
        svg.append('path')
          //.attr('d', line(scope.peaks));
          .attr('d', area(scope.peaks));
      });

    }
  }
});


