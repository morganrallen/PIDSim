var Ractive = require("ractive");

var tplCar = '<img class="car" src="car.svg" style="top: {{ y }}px; left: {{ x }}px; transform: rotate({{ a }}deg)" />';

var RCar = Ractive.extend({
  template: tplCar
});

module.exports = RCar;
