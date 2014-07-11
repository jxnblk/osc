// OSC
// Web audio visualizer

console.log('O S C');
// D3
var input = d3.select('#d3-input')[0],
    submit = d3.select('#d3-submit'),
    soundUrl,
    waveform = d3.select('#d3-waveform');

// Web Audio
var context = new (window.AudioContext || window.webkitAudioContext)(),
    source = context.createBufferSource(),
    buffer,
    analyser = context.createAnalyser();

// Analyze audio and return array
var getPeaks = function (buffer, length) {
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
};


// XHR for audio file
var loadSound = function(url) {
  //d3.xhr.responseType('arraybuffer').get(url, 
  d3.xhr(url, function(response) {
    console.log(response);
    buffer = context.createBuffer(response, true);
    getPeaks(buffer, 256, function(d){
      console.log(d);
    });
  }).responseType('arraybuffer');
  //$http.get(url, {responseType: "arraybuffer"}).success(function(response) {
  //  buffer = context.createBuffer(response, true);
  //  duration = parseInt(buffer.duration, 10);
  //  getPeaks(buffer, 256);
  //});
};

submit.on('click', function(d) {

  var url = input[0].value;
  console.log(input[0].value);
  console.log(url);
  loadSound(url);
});

