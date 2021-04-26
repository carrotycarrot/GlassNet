// split text
Splitting(); // => letters are '<div>' wrapped!
// vars

var OBJ = 'h2 > div span',
flag = 1; // flag to not multiply events

// set up audio context on BODY CLICK!
window.addEventListener('click', function() {
  if( !flag ) return; // if event is on, exit
  flag = !flag;
  var audioContext = window.AudioContext || window.webkitAudioContext;
  // variables
  var analyserNode,
    frequencyData = new Uint8Array(128);
    const allRepeatedEls = document.querySelectorAll( OBJ ),
    totalEls = allRepeatedEls.length;

  // create audio class
  if (audioContext) {
    var audioAPI = new audioContext(); // Web Audio API is available.
  } else { /* ERROR HANDLING */ }

  // main animation func
  function animateStuff() {
    requestAnimationFrame(animateStuff);
    analyserNode.getByteFrequencyData(frequencyData);
    // loop and refreq all with nice matrix style 
    console.log("totalEls:"+totalEls.length)
    for (let i = 0; i < totalEls; i++) {
      // range is 0 - 255 * 1.2 / 100 =~ 0-3
      var rang = Math.floor( i / totalEls * frequencyData.length ) ; // find equal distance in haystack
      var FREQ = frequencyData[ rang ] / 255; 
      // set minimal opacity to 20%
      allRepeatedEls[i].style.opacity = FREQ +.2; 
      // matrix set Y only [ matrix(X, 0, 0, Y, 0, 0) ]
      allRepeatedEls[i].style.transform = "matrix(1, 0, 0, "+ (FREQ * 2 + 1) +", 0, 0)";
      // set color to:
      // allRepeatedEls[i].style.color = colorArr[ Math.floor( Math.random()*colorArr.length ) ] ;
    }
  }

  // create an audio API analyser node and connect to source
  function createAnalyserNode(audioSource) {
    analyserNode = audioAPI.createAnalyser();
    analyserNode.fftSize = 2048;
    audioSource.connect(analyserNode);
  }

  
  // getUserMedia success callback -> pipe audio stream into audio API
  var gotStream = function(stream) {
    // Create an audio input from the stream.
    var audioSource = audioAPI.createMediaStreamSource(stream);
    createAnalyserNode(audioSource);
    animateStuff();
  };

  setTimeout(function(){ console.log( frequencyData )}, 5000 );

  // pipe in analysing to getUserMedia
  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(gotStream);
});


