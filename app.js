
var app = angular.module('app', []);

app.service('webaudio', function() {

  var context = new (window.AudioContext || window.webkitAudioContext)(),
      source = context.createBufferSource(),
      //buffer,
      analyser = context.createAnalyser();

  return {
    context: context,
    source: source,
    buffer: function(data, callback) {
      var buffer = context.createBuffer(data, true);
      return callback(buffer);
    },
    peaks: function(buffer, length, callback) {
      var sampleSize = buffer.length / length;
      var sampleStep = ~~(sampleSize / 10) || 1;
      var channels = buffer.numberOfChannels;
      var peaks = new Float32Array(length);

      for (var c = 0; c < channels; c++) {
        var chan = buffer.getChannelData(c);
        for (var i = 0; i < length; i++) {
          var start = ~~(i * sampleSize);
          var end = ~~(start + sampleSize);
          var max = 0;
          for (var j = start; j < end; j += sampleStep) {
            var value = chan[j];
            if (value > max) {
              max = value;
              // faster than Math.abs
            } else if (-value > max) {
              max = -value;
            }
          }
          if (c == 0 || max > peaks[i]) {
            peaks[i] = max;
          }
        }
      }
      return callback(peaks);
    }
  }

});


app.factory('svg', function() {
  return {
    waveform: function(array, callback) {
      if(typeof array == 'string') {
        var a = array.split(' ');
        for (var i = 0; i < a.length; i++) {
          a[i] = parseFloat(a[i]);
          if(isNaN(a[i])) a.splice(i, 1);
        };
        array = a;
      };
      var d = 'M0 64 ';
      for(var i = 0; i < array.length; i++){
        var amp = Math.round(128 * (array[i]));
        var step = 'V' + (63 - amp / 2) + ' h2 V' + (amp / 2 + 64) + ' h-2 V64 m4 0 ';
        var d = d + step;
      };
      var d = d + ' V128 z';
      return callback(d);
    }
  }
});

app.controller('MainCtrl', ['$scope', '$http', '$location', 'webaudio', 'svg', function($scope, $http, $location, webaudio, svg) {
  $scope.title = 'OSC';
  $scope.peaks = null;
  if (!$location.search().buffer) {
    $scope.bufferLength = 256;
  } else {
    $scope.bufferLength = parseInt($location.search().buffer, 10);
  };
  $scope.load = function() {
    $location.search({ file: $scope.fileUrl, buffer: $scope.bufferLength });
    $http.get($scope.fileUrl, { responseType: 'arraybuffer' }).success(function(response) {
      webaudio.buffer(response, function(buffer) {
        webaudio.peaks(buffer, $scope.bufferLength, function(data) {
          $scope.peaks = data;
          svg.waveform(data, function(d) {
            $scope.d = d;
          });
        });
      });
    });
  };
  if ($location.search().file) {
    $scope.fileUrl = $location.search().file;
    $scope.load();
  };
}]);



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


