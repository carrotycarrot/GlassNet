Splitting(); 

var OBJ = 'h2 > div span',
flag = 1; // flag to not multiply events
var analyserNode, frequencyData, audioAPI, audioContext, totalEls, allRepeatedEls, totalEls;
var recognition;

function splitStuff(transcript){
  var div = document.createElement('div');
  div.innerHTML = transcript.innerText != undefined ? transcript.innerText : transcript;

  var outputStr = ""
  results = Splitting({ target: div, by: 'chars' });
  words = results[0].words
  words.forEach((currentValue) => outputStr = outputStr.concat(currentValue.outerHTML))
  return outputStr
}

function updateChars(){
  
  allRepeatedEls = document.querySelectorAll( OBJ );
  totalEls = allRepeatedEls.length;
}

function initAudioContext(){
  if (audioContext)
    return;
  audioContext = window.AudioContext || window.webkitAudioContext;
  // variables
  analyserNode,
    frequencyData = new Uint8Array(128);

  updateChars()

  // create audio class
  if (audioContext) {
    audioAPI = new audioContext(); // Web Audio API is available.
  } else { console.log("ERROR") }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class ShapeOverlays {
  constructor(elm) {
    this.elm = elm;
    this.path = elm.querySelectorAll('path');
    this.numPoints = 10;
    this.duration = 900;
    this.delayPointsArray = [];
    this.delayPointsMax = 300;
    this.delayPerPath = 250;
    this.timeStart = Date.now();
    this.isOpened = false;
    this.isAnimating = false;
    initAudioContext()
  }
  toggle() {
    this.isAnimating = true;
    for (var i = 0; i < this.numPoints; i++) {
      this.delayPointsArray[i] = Math.random() * this.delayPointsMax;
    }
    if (this.isOpened === false) {
      this.open();
    } else {
      this.close();
    }
  }
  open() {
    this.isOpened = true;
    this.elm.classList.add('is-opened');
    this.timeStart = Date.now();
    this.renderLoop();
  }
  close() {
    this.isOpened = false;
    this.elm.classList.remove('is-opened');
    this.timeStart = Date.now();
    this.renderLoop();
  }
  
  updatePath(time) {
    
    if(this.points == undefined)
      this.points = []
    for (var i = 0; i < this.numPoints; i++) {
      var rang = Math.floor( i / this.numPoints * frequencyData.length ) ; // find equal distance in haystack
      var FREQ = frequencyData[ rang ] / 255;
      var OFFSET = FREQ
      var min = this.points[i] == undefined ? OFFSET : Math.max(1, this.points[i] - 10 * OFFSET)
      var max = this.points[i] == undefined ? OFFSET : Math.min(99, this.points[i] + 10 * OFFSET)
      this.points[i] = getRandomInt(min, max);
    }

    let str = '';
    str += (this.isOpened) ? `M 0 0 V ${this.points[0]}` : `M 0 ${this.points[0]}`;
    for (var i = 0; i < this.numPoints - 1; i++) {
      const p = (i + 1) / (this.numPoints - 1) * 100;
      const cp = p - (1 / (this.numPoints - 1) * 100) / 2;
      str += `C ${cp} ${this.points[i]} ${cp} ${this.points[i + 1]} ${p} ${this.points[i + 1]} `;
    }
    str += (this.isOpened) ? `V 100 H 0` : `V 0 H 0`;
    return str;
  }
  render() {
    if (this.isOpened) {
      for (var i = 0; i < this.path.length; i++) {
        this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * i)));
      }
    } else {
      for (var i = 0; i < this.path.length; i++) {
        this.path[i].setAttribute('d', this.updatePath(Date.now() - (this.timeStart + this.delayPerPath * (this.path.length - i - 1))));
      }
    }
  }
  renderLoop() {
    this.render();
      requestAnimationFrame(() => {
        this.renderLoop();
      });
  }
}

// set up audio context on BODY CLICK!
window.addEventListener('click', function() {
  

  if( !flag ) return; // if event is on, exit
  flag = !flag;
  initAudioContext()

  // main animation func
  function animateStuff() {
    requestAnimationFrame(animateStuff);
    analyserNode.getByteFrequencyData(frequencyData);
    updateChars()
    // loop and refreq all with nice matrix style 
    for (let i = 0; i < totalEls; i++) {
      // range is 0 - 255 * 1.2 / 100 =~ 0-3
      var rang = Math.floor( i / totalEls * frequencyData.length ) ; // find equal distance in haystack
      var FREQ = frequencyData[ rang ] / 255; 
      // set minimal opacity to 20%
      allRepeatedEls[i].style.opacity = FREQ +.2; 
      allRepeatedEls[i].style.transform = "matrix(1, 0, 0, "+ (FREQ * 2 + 1) +", 0, 0)";
    }
  }

  // create an audio API analyser node and connect to source
  function createAnalyserNode(audioSource) {
    analyserNode = audioAPI.createAnalyser();
    analyserNode.fftSize = 2048;
    audioSource.connect(analyserNode);
  }

  var gotStream = function(stream) {
    // Create an audio input from the stream.
    var audioSource = audioAPI.createMediaStreamSource(stream);
    createAnalyserNode(audioSource);
    animateStuff();
  };

  setTimeout(function(){ console.log( frequencyData )}, 5000 );

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(gotStream);
});


function runSpeechRecognition() {
  if(recognition)
    return;

  // get output div reference
  var output = document.getElementById("output");
  
  // new speech recognition object
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  // This runs when the speech recognition service returns result
  recognition.onresult = function(event) {
    var last = event.results.length -1
    var transcript = event.results[last][0].transcript;
    var content = splitStuff(transcript)
    output.innerHTML = content
  };
 
  recognition.onend = function() {
    recognition.start()
  };

  // start recognition
  recognition.start();
}

window.addEventListener('click', function() {
  runSpeechRecognition()
  const elmOverlay = document.querySelector('.shape-overlays');
  const overlay = new ShapeOverlays(elmOverlay);
  if (overlay.isAnimating) {
      return false;
    }
    overlay.toggle();
})






