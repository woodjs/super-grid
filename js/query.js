;(function (fn) {
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

  var query = {

    init: function (target) {
      var self = this;

      self.initGlobalScope(target);
      self.initJqueryObject(target);
      self.initEvent(target);
    },

    initGlobalScope: function (target) {
      var self = this;
      var $target = $(target);
      var opts = $target.data('query').options;

      target.ns = {};

      target.ns.cssPrefix = opts.cssPrefix;
    },

    initJqueryObject: function (target) {
      var self = this;
      var $target = $(target);

      target.jq = {};

      target.jq.$queryItemList = $target.find('.' + target.ns.cssPrefix + 'query-item');
      target.jq.$queryInputList = $target.find('.' + target.ns.cssPrefix + 'query-input');
      target.jq.$btnQuery = $target.find('.' + target.ns.cssPrefix + 'query-action');
      target.jq.$btnReset = $target.find('.' + target.ns.cssPrefix + 'query-reset');
    },

    initEvent: function (target) {
      var self = this;

      target.jq.$queryInputList.on({
        change: function () {

        }
      });

      target.jq.$btnQuery.on({
        click: function () {
          self.getParams(target);
        }
      });

      target.jq.$btnReset.on({
        click: function () {
          for (var i = 0; i < target.jq.$queryInputList.length; i++) {
            self.resetItem($(target.jq.$queryInputList[i]));
          }
        }
      });
    },

    resetItem: function ($item) {
      var self = this;

      $item.val('');
    },

    getParams: function (target) {
      var self = this;
      var len = target.jq.$queryItemList.length;
      var $temp;
      var $input;
      var value;
      var result = {};

      for (var i = 0; i < len; i++) {
        $temp = $(target.jq.$queryItemList[i]);
        $input = $temp.find('.' + target.ns.cssPrefix + 'query-input');
        value = $input.val();
        if ($temp.is('.' + target.ns.cssPrefix + 'query-required') && value == '') {
          alert('有必填项未填！');
          return;
        }
        if (value != '') {
          result[$input[0].name] = value;
        }
      }

      return result;
    }
  };

  $.fn.query = function (options, params) {
    if (typeof options == 'string') {
      return $.fn.query.methods[options]($(this), params);
    }

    options = options || {};

    return this.each(function () {

      $.data(this, 'query', {
        options: $.extend(true, {}, $.fn.query.defaults, options)
      });

      query.init($(this));
    });
  };

  $.fn.query.methods = {};

  $.fn.query.defaults = {
    cssPrefix: 's-',
    url: '',
    method: 'GET',
    cache: false,
    timeout: 3000,
    params: null,
    onAjaxBeforeSend: null,
    onAjaxComplete: null,
    onAjaxError: null,
    onAjaxSuccess: null,
    onBeforeRender: null,
    onAfterRender: null,
    onBeforeQuery: null,
    onAfterQuery: null,
    onBeforeReset: null,
    onAfterReset: null
  };
});