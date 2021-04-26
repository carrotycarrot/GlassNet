var flag = 1; // flag to not multiply events
var analyserNode, frequencyData, audioAPI, audioContext;

function initAudioContext(){
  if (audioContext)
    return;
  audioContext = window.AudioContext || window.webkitAudioContext;
  analyserNode, frequencyData = new Uint8Array(128);

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
    this.numPoints = 150;
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

  frequencyPercent(f){
    return Math.min(100, f * 100);
  }

  niceShape(position, size, freq){
    var peak = size / 2;
    var peak2 = size / 100;
    var multiplier = position / (1 + Math.abs(peak - position))
    var multiplier2 = position / (1 + Math.abs(peak2 - position))
    return Math.min(100, freq * multiplier * multiplier2  * 10)
  }
  
  updatePath(time) {
    if(this.points == undefined)
      this.points = []
    for (var i = 0; i < this.numPoints; i++) {
      var rang = Math.floor( i / this.numPoints * frequencyData.length ); // spread frequencies along num points (from svg)
      var FREQ = frequencyData[ rang ] / 255;
      var freqPercent = this.frequencyPercent(FREQ)
      //var min = this.points[i] == undefined ? 50 : Math.max(1, this.points[i] - 10 )
      //var max = this.points[i] == undefined ? 50 : Math.min(99, this.points[i] + 10 )
      var niceShapeValue = this.niceShape(i, this.numPoints, FREQ)
      var value = getRandomInt(Math.min(niceShapeValue, freqPercent), Math.max(niceShapeValue, freqPercent))
      this.points[i] = value * -1 + 100;//getRandomInt(min, max) + Math.min(100, OFFSET) * -1;
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
function setUpAudioContext() {
  if( !flag ) return; // if event is on, exit
  flag = !flag;
  initAudioContext()
  // main animation func
  function animateStuff() {
    requestAnimationFrame(animateStuff);
    analyserNode.getByteFrequencyData(frequencyData);
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
};


function clickOrTouch(){
  setUpAudioContext()
  const elmOverlay = document.querySelector('.shape-overlays');
  const overlay = new ShapeOverlays(elmOverlay);
  if (overlay.isAnimating) {
      return false;
    }
  overlay.toggle()
}

window.addEventListener('touchstart', function() {
  clickOrTouch()
})
window.addEventListener('click', function() {
  clickOrTouch()
})








