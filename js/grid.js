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

  function Grid() {
    alert(1);
  }

  return Grid;
});