!(function (wrapper) {
  "use strict";

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(wrapper);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = wrapper();
  } else {
    window.Grid = wrapper();
  }
})(function () {
  "use strict";

  var grid = {
    init: function () {

    },

    initEvent: function () {

    }

  };

  var util = {
    getScrollbarWidth: function () {
      var divA = document.createElement('div');
      var divB = document.createElement('div');

      divA.style.overflowY = 'hidden';
      divB.style.height = '1px';
      divA.appendChild(divB);
      document.body.appendChild(divA);
      var tempWidth = divB.clientWidth;
      divA.style.overflowY = 'scroll';

      return tempWidth - divB.clientWidth;
    }
  };

  function Grid() {

  }


  $.fn.grid = function () {

    return '';
  };

  $.fn.grid.methods = function () {

  };

  $.fn.grid.defaults = function () {

  };

  return Grid;
});