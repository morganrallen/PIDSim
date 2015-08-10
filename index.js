"use strict";

var TAU = 2 * Math.PI;
var raf = window.requestAnimationFrame;
var RActive = require("ractive");
var Sparklines = require("sparklines");
var dat = require("dat-gui");
var RCar = require("./car");

var data = {
  car: {
    a: 0,
    x: 0,
    y: 25,
    steeringAngle: 0,
    speed: 1
  },
  road: {
    y: 300
  },
  circles: [],
  stop: {
    action: "Stop"
  },
  terms: {
    timeChange: "0",
    err: "0",
    dErr: "0",
    errSum: "0",
    output: "0",
    pTerm: "0",
    iTerm: "0",
    dTerm: "0"
  }
};

window.data = data;

var datGui = new dat.GUI();
datGui.add(data.car, "x").listen();
datGui.add(data.car, "y").listen();
datGui.add(data.car, "steeringAngle").listen();
datGui.add(data.car, "a").listen();
datGui.add(data.car, "speed", 0, 50);
datGui.add(data.road, "y", 0, 500);
datGui.add(data.terms, "timeChange").listen();
datGui.add(data.terms, "err").listen();
datGui.add(data.terms, "dErr").listen();
datGui.add(data.terms, "errSum").listen();
datGui.add(data.terms, "pTerm").listen();
datGui.add(data.terms, "iTerm").listen();
datGui.add(data.terms, "dTerm").listen();
datGui.add(data.terms, "output").listen();

var elRoad = new RActive({
  append: true,
  el: document.body,
  template: '<div id="road" style="top: {{ road.y }}px"></div>',
  data: data
});

var elCar = new RCar({
  append: true,
  el: document.body,
  data: data.car
});

var elRoadDistance = new RActive({
  append: true,
  el: document.body,
  template: '<div id="road-indicator" style="left: {{ car.x }}px; top: {{ car.y + ((road.y - car.y ) / 2) }}px;">{{ Math.round(road.y - car.y) }}</div>',
  data: data
});

var stop = false;

var elStop = new RActive({
  append: true,
  el: document.body,
  template: '<div on-click="startstop">{{ action }}</div><div on-click="set">Reset</div>',
  data: data.stop
});

elStop.on("set", function() {
  data.car.x = data.car.a = 0;
  data.car.y = 50;
});

elStop.on("startstop", function() {
  stop = !stop;

  data.stop.action = stop ? "Start" : "Stop";
  elStop.update("action");

  if(!stop) {
    animate();
  }
});

var elHighlighter = new RActive({
  append: true,
  el: document.body,
  template: '<svg id="highlight" style="left: {{ car.x - 40 }}px; top: {{ car.y - 40}}px;">\
    {{#circles}}<circle cx="{{ x }}" cy="{{ y }}" r="1" />{{/}}\
  </svg>',
  data: data
});

var step = 0.1;
var angle = 0;
while(angle < TAU) {
  var x = 90 + (60 * Math.cos(angle));
  var y = 68 + (60 * Math.sin(angle));

  data.circles.push({
    x: x,
    y: y
  });

  angle += step;
}

elHighlighter.update("circles");

var elIndicatorAngle = new RActive({
  append: true,
  el: document.body,
  template: '<img id="arrow_angle" src="arrow.svg" style="transform: rotate({{ (car.a + car.steeringAngle) - 90 }}deg) translate(0px, 30px); left: {{ car.x + 80 }}px; top: {{ car.y - 11 }}px;" />',
  data: data
});

var ta = document.querySelector("textarea");

var updatePIDFunction = true;
document.querySelector("textarea").addEventListener("keyup", function(e) {
  console.log(e.keyCode);
  if(e.keyCode >= 32) {
    updatePIDFunction = true;
  }
}, false);

var fnPID = function(){};

var sparkErr = new Sparklines(document.querySelector(".charts.err"), {
  lineColor: "blue",
  height: 100,
  maxColor: "green",
  minColor: "red",
  width: 500
});

var sparkSet = new Sparklines(document.querySelector(".charts.set"), {
  lineColor: "red",
  height: 100,
  maxColor: "green",
  minColor: "red",
  width: 500
});

var sparkErrData = [];
var sparkSetData = [];

function animate() {
  var vX = (data.car.speed * 6) * Math.cos(data.car.a * (Math.PI / 180));
  var vY = (data.car.speed * 6) * Math.sin(data.car.a * (Math.PI / 180));

  data.car.x += vX;
  data.car.y += vY;
  data.car.a += data.car.steeringAngle * 0.1;

  if(data.car.x > 650) {
    data.car.x = 0;
  }

  var syntaxOK = true;

  if(updatePIDFunction) {
    try {
      fnPID = eval("(function() { " + ta.value.trim() + "})()");
      updatePIDFunction = false;
    } catch(e) {
      syntaxOK = false;
    }
  }

  sparkErrData.push(data.road.y - data.car.y);
  sparkSetData.push(data.road.y);

  sparkErr.draw(sparkErrData);
  sparkSet.draw(sparkSetData);

  if(syntaxOK) {
    try {
      data.car.steeringAngle = fnPID((data.road.y - data.car.y), data.car.steeringAngle);
    } catch(e) {
    }
  }

  elCar.update();
  elRoadDistance.update();
  elIndicatorAngle.update("car");
  elHighlighter.update("car");

  if(stop !== true) {
    raf(animate);
  }
}

animate();
