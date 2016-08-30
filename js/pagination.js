!(function (fn) {
  "use strict";

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(function () {
      fn(jQuery);
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = fn(jQuery);
  } else {
    fn(jQuery);
  }
})(function ($) {
  "use strict";

  var pagination = {

    init: function ($target) {
      var self = this;

      self.initGlobalScope($target);
      self.render($target);
      self.initJqueryObject($target);
      self.initEvent($target);
    },

    initGlobalScope: function ($target) {
      var self = this;

      $target.ns = {};

    },

    render: function ($target) {
      var self = this;

    },

    initJqueryObject: function ($target) {
      var self = this;

      $target.jq = {};

    },

    initEvent: function ($target) {
      var self = this;

    },

    templateMap: {

    }
  };

  $.fn.pagination = function (options, param) {
    if (typeof options == 'string') {
      return $.fn.pagination.methods[options](this, param);
    }

    options = options || {};

    return this.each(function () {

      $.data(this, 'pagination', {
        options: $.extend({}, $.fn.pagination.defaults, options)
      });

      pagination.init($(this));
    });
  };

  $.fn.pagination.methods = {};

  $.fn.pagination.defaults = {

  };
});