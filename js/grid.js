!(function (fn) {
  "use strict";

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(fn);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = fn();
  } else {
    fn();
  }
})(function () {
  "use strict";

  var grid = {
    init: function ($target) {
      var self = this;

      self.render($target);
      self.initGlobalScope($target);
      self.initJqueryObject($target);
      self.initEvents($target);

      self.scrollbarWidth = util.getScrollbarWidth();
    },

    render: function ($target) {
      var self = this;
      var templateId = $target.data('');
      return $target.html($('#template1').html());
    },

    initGlobalScope: function ($target) {
      var self = this;

      $target.ns = {};

      $target.ns.divDragLine = null;
      $target.ns.originPointX = 0;
    },

    initJqueryObject: function ($target) {
      var self = this;

      $target.jq = {};

      $target.jq.$curDragTarget = null;
      $target.jq.$cols = $target.find('colgroup');
      $target.jq.$rows = $target.find('tr');
      $target.jq.$headerCols = $target.find('.s-table-column');
      $target.jq.$btnSelectAll = $target.find('.s-table-header .s-grid-check-wrapper');
    },

    initEvents: function ($target) {
      var self = this;

      $target.find('.s-table-wrapper').on({
        'mousewheel DOMMouseScroll': function (e) {
          var $this = $(this);
          var $table = $this.find('table');
          var deltaY = 20;
          var tableWrapperH = $this.height();
          var tableH = $table.outerHeight();
          var boundLength = tableH - tableWrapperH + 50;
          var $closestGridTable = $this.closest('.s-grid-table');
          var temp;

          if (util.getMousewheelDirection(e) === 'up') {  // 鼠标向上滚动
            temp = $this.scrollTop() - deltaY;
            $this.scrollTop(temp >= 0 ? temp : 0);
          } else if (util.getMousewheelDirection(e) === 'down') {
            temp = $this.scrollTop() + deltaY;
            $this.scrollTop(temp <= boundLength ? temp : boundLength);
          }

          $closestGridTable
            .siblings('.s-grid-table')
            .find('.s-table-wrapper')
            .scrollTop($this.scrollTop());
        },
        'scroll': function (e) {
          var $this = $(this);
          var $closestGridTable = $this.closest('.s-grid-table');

          $closestGridTable
            .find('.s-table-header-wrapper')
            .scrollLeft($this.scrollLeft());

          $closestGridTable
            .siblings('.s-grid-table')
            .find('.s-table-wrapper')
            .scrollTop($this.scrollTop());
        }
      });

      $target.find('.s-table-column:not(.s-grid-disable-drag)').on({
        'mousedown': function (e) {
          var $this = $(this);
          var offsetLeft = $this.offset().left;
          var width = $this.outerWidth();
          var pointX = offsetLeft + width - e.pageX;

          if (pointX >= 0 && pointX < 5) {
            $target.jq.$curDragTarget = $this;
            $target.ns.originPointX = e.pageX;
            self.createTableDragMask($target, e);
          }
        },
        'mouseenter mousemove': function (e) {
          var $this = $(this);
          var offsetLeft = $this.offset().left;
          var width = $this.outerWidth();
          var pointX = offsetLeft + width - e.pageX;

          if (pointX >= 0 && pointX < 5) {
            $this.css({'cursor': 'col-resize'});
          } else {
            $this.css({'cursor': 'default'});
          }
        }
      });

      $target.jq.$rows.on({
        'mouseenter': function (e) {
          var $this = $(this);
          var rowIndex = $this.data('row-index');

          for (var i = 0; i < $target.jq.$rows.length; i++) {
            var $temp = $($target.jq.$rows[i]);

            $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass('s-grid-row-hover') : $temp.removeClass('s-grid-row-hover');
          }
        },
        'click': function (e) {
          var $this = $(this);
          var rowIndex = $this.data('row-index');
          var $temp;

          if ($this.is('.s-grid-row-selected')) {
            $target.jq.$btnSelectAll.removeClass('s-grid-row-selected');
            for (var i = 0; i < $target.jq.$rows.length; i++) {
              $temp = $($target.jq.$rows[i]);
              if ($temp.is('tr[data-row-index="' + rowIndex + '"]')) $temp.removeClass('s-grid-row-selected');
            }
            return;
          }

          for (var j = 0; j < $target.jq.$rows.length; j++) {
            $temp = $($target.jq.$rows[j]);

            $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass('s-grid-row-selected') : $temp.removeClass('s-grid-row-selected');
          }
        }
      });

      $target.jq.$btnSelectAll.on({
        'click': function (e) {
          var $this = $(this);

          if ($this.is('.s-grid-row-selected')) {
            $this.removeClass('s-grid-row-selected');
            $target.jq.$rows.removeClass('s-grid-row-selected');
          } else {
            $this.addClass('s-grid-row-selected');
            $target.jq.$rows.addClass('s-grid-row-selected');
          }
        }
      });

      $target.find('table').on({
        'mouseleave': function () {
          for (var i = 0; i < $target.jq.$rows.length; i++) {
            var $temp = $($target.jq.$rows[i]);

            $temp.removeClass('s-grid-row-hover');
          }
        }
      });

      $target.jq.$headerCols.on({
        'click': function () {
          var $this = $(this);
          var $temp = null;

          for (var i = 0; i < $target.jq.$headerCols.length; i++) {

            if ($target.jq.$headerCols[i] !== this) {
              $temp = $($target.jq.$headerCols[i]);
              $temp.removeClass('s-grid-sort-asc').removeClass('s-grid-sort-desc');
            }
          }

          if ($this.hasClass('s-grid-sort-asc')) {
            $this.removeClass('s-grid-sort-asc').addClass('s-grid-sort-desc');
          } else if ($this.hasClass('s-grid-sort-desc')) {
            $this.removeClass('s-grid-sort-desc');
          } else {
            if ($this.is(':not(.s-grid-disable-drag)')) {
              $this.addClass('s-grid-sort-asc');
            }
          }
        }
      });
    },

    createTableDragMask: function ($target, e) {
      var self = this;
      var mousePosition = util.getEventPosition(e);
      var gridWrapperH = $target.jq.$curDragTarget.closest('.s-grid-wrapper').outerHeight();

      $target.ns.divDragLine = document.createElement('div');
      $target.ns.divDragLine.className = 's-grid-drag-line';
      $target.ns.divDragLine.style.cssText = 'width:1px;height:' + gridWrapperH + 'px;left:' + mousePosition.x + 'px;top:' + $target.jq.$curDragTarget.offset().top + 'px;position:absolute;background:black;z-index:999900;';

      document.body.appendChild($target.ns.divDragLine);

      $(document).on({
        'mousemove': dragAndCalculate,
        'mouseup': finishResizeColumn
      });

      function dragAndCalculate(e) {
        var minColumnW = 30;
        var minTableW = 40;
        var curDragTargetW = $target.jq.$curDragTarget.outerWidth();
        var mousePosition = util.getEventPosition(e);
        var $curGridTable = $target.jq.$curDragTarget.closest('.s-grid-table');
        var $gridWrapper = $target.jq.$curDragTarget.closest('.s-grid-wrapper');
        var gridWrapperW = $gridWrapper.outerWidth();
        var curGridTableW = $curGridTable.outerWidth();

        util.clearDocumentSelection();

        if (curDragTargetW + mousePosition.x - $target.ns.originPointX >= minColumnW
          && (mousePosition.x - $target.ns.originPointX) <= (gridWrapperW - curGridTableW - minTableW)
          && mousePosition.x < $gridWrapper.offset().left + gridWrapperW - self.scrollbarWidth) {
          $target.ns.divDragLine.style.left = mousePosition.x + 'px';
        }

      }

      function finishResizeColumn(e) {

        resizeColumn();

        $(document).off({
          'mousemove': dragAndCalculate,
          'mouseup': finishResizeColumn
        });

        $target.ns.divDragLine && document.body.removeChild($target.ns.divDragLine);
        $target.jq.$curDragTarget = null;
      }

      function resizeColumn() {
        var colIndex = $target.jq.$curDragTarget.data('col-index');
        var deltaX = parseInt($target.ns.divDragLine.style.left) - $target.ns.originPointX;
        var $curCol = $($target.jq.$cols[colIndex]).find('col');
        var $curTable = $curCol.closest('table');
        var $curTableHeader = $target.jq.$curDragTarget.closest('.s-table-header');
        var $curGridTable = $target.jq.$curDragTarget.closest('.s-grid-table');
        var $gridWrapper = $target.jq.$curDragTarget.closest('.s-grid-wrapper');
        var gridWrapperW = $gridWrapper.outerWidth();
        var curColumnW = $curCol.outerWidth() + deltaX;

        $target.jq.$curDragTarget[0].style.width = $curCol[0].style.width = curColumnW + 'px';

        $curTableHeader[0].style.width = $curTableHeader.outerWidth() + deltaX + 'px';

        if ($curGridTable.data('frozen') === true) {  // 移动冻结列
          $curTable[0].style.width = $curTableHeader.outerWidth() + 'px';
          $curGridTable
            .css({width: $curGridTable.outerWidth() + deltaX + 'px'})
            .siblings('.s-grid-table')
            .css({width: gridWrapperW - $curGridTable.outerWidth() + 'px'});
        } else {
          $curTable[0].style.width = $curTableHeader.outerWidth() - self.scrollbarWidth + 'px';
        }
      }
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
    },

    getEventPosition: function (e) {
      return {
        x: e.pageX,
        y: e.pageY
      };
    },

    clearDocumentSelection: function () {
      if (document.selection) {
        document.selection.empty ? document.selection.empty() : (document.selection = null);
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    },

    getMousewheelDirection: function (e) {
      if (e.originalEvent.wheelDelta) {  // 非firefox
        return e.originalEvent.wheelDelta > 0 ? 'up' : 'down';
      } else if (e.originalEvent.detail) {
        return e.originalEvent.detail > 0 ? 'down' : 'up';
      }
    }
  };

  $.fn.grid = function (options, param) {
    if (typeof options == 'string') {
      return $.fn.grid.methods[options](this, param);
    }

    options = options || {};

    return this.each(function () {

      $.data(this, 'grid', {
        options: $.extend({}, $.fn.grid.defaults, options)
      });

      grid.init($(this));
    });
  };

  $.fn.grid.methods = {

  };

  $.fn.grid.defaults = {

  };
});