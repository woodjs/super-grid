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
      target.jq.$querySelectList = $target.find('select.' + target.ns.cssPrefix + 'query-input');
      target.jq.$queryInputList = $target.find('input.' + target.ns.cssPrefix + 'query-input');
      target.jq.$queryAllInputList = $target.find('.' + target.ns.cssPrefix + 'query-input');
      target.jq.$btnQuery = $target.find('.' + target.ns.cssPrefix + 'query-action');
      target.jq.$btnReset = $target.find('.' + target.ns.cssPrefix + 'query-reset');
    },

    initEvent: function (target) {
      var self = this;

      target.jq.$querySelectList.on({
        click: function (e) {
          var $this = $(this);

          if ($this.data('loaded') != 'true') {
            self.loadSelectData(target, $this);
          }
        },
        change: function () {
          var $this = $(this);

          self.clearSelect(target, $this);
        }
      });

      target.jq.$btnQuery.on({
        click: function () {
          var params = self.getParams(target);

          self.doQuery(target, params);
        }
      });

      target.jq.$btnReset.on({
        click: function () {
          for (var i = 0; i < target.jq.$queryAllInputList.length; i++) {
            self.resetItem($(target.jq.$queryAllInputList[i]));
          }
        }
      });
    },

    loadSelectData: function (target, $select) {
      var self = this;
      var url = $select.data('url');
      var queryString = self.getQueryString(target, $select);

      var data = [{
        id: 1,
        code: 'temp1',
        name: '哈哈' + Math.random()
      }, {
        id: 2,
        code: 'temp2',
        name: '呵呵' + Math.random()
      }, {
        id: 3,
        code: 'temp3',
        name: '嘻嘻' + Math.random()
      }, {
        id: 4,
        code: 'temp4',
        name: '嘿嘿' + Math.random()
      }];

      $.ajax({
        url: url + queryString,
        type: 'GET',
        cache: false,
        timeout: 3000,
        success: function () {
          self.clearSelect(target, $select);
          self.updateSelect($select, data);
          $select.data('loaded', 'true');
        },
        error: function () {
          self.clearSelect(target, $select);
          self.updateSelect($select, data);
          $select.data('loaded', 'true');
        }
      });
    },

    getQueryString: function (target, $select) {
      var self = this;
      var dependenciesIdStr = $select.data('dependenciesids');
      var dependenciesIdList = dependenciesIdStr && JSON.parse(dependenciesIdStr.replace(/\'/g, '"'));
      var len = dependenciesIdList && dependenciesIdList.length;
      var $target = $(target);
      var $temp;
      var list = [];

      for (var i = 0; i < len; i++) {
        $temp = $target.find(dependenciesIdList[i]);
        list.push($temp[0].name + '=' + $temp.val());
      }

      return len ? '?' + list.join('&') : '';
    },

    clearSelect: function (target, $select) {
      var self = this;
      var clearIdStr = $select.data('clearids');
      var clearIdList = clearIdStr && JSON.parse(clearIdStr.replace(/\'/g, '"'));
      var len = clearIdList && clearIdList.length;
      var $target = $(target);
      var $temp;

      for (var i = 0; i < len; i++) {
        $temp = $target.find(clearIdList[i]);
        $temp.val('');
        $temp.html('<option value="">全部</option>');
        $temp.data('loaded', 'false');
      }
    },

    updateSelect: function ($select, data) {
      var self = this;
      var html = '<option value="">全部</option>';

      for (var i = 0; i < data.length; i++) {
        html += '<option value="'+ data[i].code +'">'+ data[i].name +'</option>';
      }

      $select.html(html);
    },

    resetItem: function ($item) {
      var self = this;

      if ($item.is('select')) {
        $item.data('loaded', 'false');
      }

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
    },
    doQuery: function (target, params) {
      var self = this;
      var opts = $(target).data('query').options;

      target.ns.params = params;

      $.ajax({
        url: '/',
        type: 'POST',
        cache: false,
        timeout: 3000,
        data: target.ns.params,
        dataType: 'json',
        beforeSend: opts.onAjaxBeforeSend,
        complete: opts.onAjaxComplete,
        error: function () {

          opts.onAjaxError && opts.onAjaxError.apply(null, Array.prototype.slice.apply(null, arguments));
        },
        success: function (result) {

          opts.onAjaxSuccess && opts.onAjaxSuccess.apply(null, [result]);
        }
      });
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