var Ractive = require("ractive");

var tplCar = '<image class="car" xlink:href="car.svg" y="{{ y }}" x="{{ x }}" transform="rotate({{ a }} {{ x }} {{ y }})" height="40" width="100" />';

var RCar = Ractive.extend({
  template: tplCar
});

module.exports = RCar;
