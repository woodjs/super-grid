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
      var a = document.createElement('div');
      var b = document.createElement('div');

      a.style.overflowY = 'hidden';
      b.style.height = '1px';
      a.appendChild(b);
      document.body.appendChild(a);
      var tempWidth = b.clientWidth;
      a.style.overflowY = 'scroll';

      return tempWidth - b.clientWidth;
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