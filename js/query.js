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
      var opts = $(target).data('query').options;

      opts.onBeforeRender && opts.onBeforeRender.call(null);
      self.initGlobalScope(target);
      self.initJqueryObject(target);
      self.initEvent(target);
      self.loadData(target);
      opts.onAfterRender && opts.onAfterRender.call(null);
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
      var $target = $(target);
      var opts = $target.data('query').options;

      if (opts.selectMode === 'native') {
        target.jq.$querySelectList.on({
          click: function () {
            var $this = $(this);

            if ($this.data('noCache') === true || $this.data('loaded') !== true) {

              self.loadSelectData(target, $this);
            }
          },
          change: function () {
            var $this = $(this);
            var $nextSelect = $target.find($this.data('next'));

            if ($nextSelect.length) self.loadSelectData(target, $nextSelect, true);
          }
        });
      }

      target.jq.$btnQuery.on({
        click: function () {
          var params = self.getParams(target);

          opts.onBeforeQuery && opts.onBeforeQuery.call(null);
          self.doQuery(target, params);
          opts.onAfterQuery && opts.onAfterQuery.call(null);
        }
      });

      target.jq.$btnReset.on({
        click: function () {

          opts.onBeforeReset && opts.onBeforeReset.call(null);
          for (var i = 0; i < target.jq.$queryAllInputList.length; i++) {
            self.resetItem($(target.jq.$queryAllInputList[i]));
          }
          opts.onAfterReset && opts.onAfterReset.call(null);
        }
      });
    },

    loadData: function (target) {
      var self = this;
      var $selectList = target.jq.$querySelectList;
      var len = $selectList.length;
      var $temp;

      for (var i = 0; i < len; i++) {
        $temp = $($selectList[i]);
        if ($temp.data('preload') === true) {
          self.loadSelectData(target, $temp);
        }
      }
    },

    loadSelectData: function (target, $select, isClearSelf) {
      var self = this;
      var url = $select.data('url');
      var opts = $(target).data('query').options;
      var queryString = self.getQueryString(target, $select);

      if (queryString === false) {
        self.clearSelect(target, $select, isClearSelf);
        return;
      }

      $.ajax({
        url: url + queryString,
        type: 'GET',
        cache: false,
        timeout: 3000,
        success: function () {
          self.clearSelect(target, $select);
          self.updateSelect(target, $select, data);
          $select.data('loaded', true);
        },
        error: function () {
          self.clearSelect(target, $select);
          self.updateSelect(target, $select, data);
          $select.data('loaded', true);
        },
        // error: opts.onSelectAjaxError && opts.onSelectAjaxError.call(null, url + queryString)
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
        if ($temp.val() === '') return false;
        list.push($temp[0].name + '=' + $temp.val());
      }

      return len ? '?' + list.join('&') : '';
    },

    clearSelect: function (target, $select, isClearSelf) {
      var self = this;
      var opts = $(target).data('query').options;
      var withAll = $select.data('withall') || opts.withAll;
      var withAllText = $select.data('withalltext') || opts.withAllText;
      var clearIdStr = $select.data('clearids');
      var clearIdList = clearIdStr && JSON.parse(clearIdStr.replace(/\'/g, '"'));
      var len = clearIdList && clearIdList.length;
      var $target = $(target);
      var $temp;

      if (isClearSelf)  $select.html(withAll ? '<option value="">' + withAllText + '</option>' : '');

      for (var i = 0; i < len; i++) {
        $temp = $target.find(clearIdList[i]);
        $temp.html(withAll ? '<option value="">' + withAllText + '</option>' : '');
        $temp.data('loaded', false);
      }
    },

    updateSelect: function (target, $select, data) {
      var self = this;
      var opts = $(target).data('query').options;
      var withAll = $select.data('withall') || opts.withAll;
      var withAllText = $select.data('withalltext') || opts.withAllText;
      var html = withAll ? '<option value="">' + withAllText + '</option>' : '';

      for (var i = 0; i < data.length; i++) {
        html += '<option value="' + data[i].code + '">' + data[i].name + '</option>';
      }

      $select.html(html);
      $select.val($select.data('value'));
    },

    resetItem: function ($item) {
      var self = this;

      if ($item.is('select')) {
        $item.data('loaded', false);
      }

      $item.val('');
    },

    getParams: function (target) {
      var self = this;
      var len = target.jq.$queryItemList.length;
      var opts = $(target).data('query').options;
      var $temp;
      var $input;
      var value;
      var result = {};

      for (var i = 0; i < len; i++) {
        $temp = $(target.jq.$queryItemList[i]);
        $input = $temp.find('.' + target.ns.cssPrefix + 'query-input');
        value = $input.val();
        if ($temp.is('.' + target.ns.cssPrefix + 'query-required') && value == '') {
          opts.onRequiredIsEmpty.call(null);
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
        url: opts.url,
        type: opts.method,
        cache: opts.cache,
        timeout: opts.timeout,
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
    selectMode: 'native',
    withAll: true,
    withAllText: '全部',
    url: '',
    method: 'POST',
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
    onAfterReset: null,
    onRequiredIsEmpty: function () {},
    onSelectAjaxError: function () {}
  };
});