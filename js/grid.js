!(function (wrapper) {
  "use strict";

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(wrapper);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = wrapper();
  } else {
    wrapper();
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
    },

    render: function ($target) {
      var self = this;

      return $target.html($('#template1').html());
    },

    initGlobalScope: function ($target) {
      var self = this;

      $target.ns = {};

      $target.ns.divDragMask = null;
      $target.ns.divDragLine = null;

      $target.ns.originPointX = 0;
    },

    initJqueryObject: function ($target) {
      var self = this;

      $target.jq = {};

      $target.jq.$curDragTarget = null;
      $target.jq.$cols = $target.find('colgroup');
    },

    initEvents: function ($target) {
      var self = this;

      $target.find('.s-table-wrapper').on({
        'mousewheel': function (e) {
          var $this = $(this);
          var $closestGridTable = $this.closest('.s-grid-table');

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

      $target.find('.s-table-column').on({
        'mousedown': function (e) {
          var $this = $(this);
          var offsetLeft = $this.offset().left;
          var width = $this.outerWidth();

          if ((offsetLeft + width - e.pageX) >= 0 && (offsetLeft + width - e.pageX) < 5) {
            $target.jq.$curDragTarget = $this;
            $target.ns.originPointX = e.pageX;
            self.createTableDragMask($target, e);
            $(document).on({
              'mousemove': util.clearDocumentSelection
            });
          }
        },
        'mouseenter mousemove': function (e) {
          var $this = $(this);
          var offsetLeft = $this.offset().left;
          var width = $this.outerWidth();

          if ((offsetLeft + width - e.pageX) >= 0 && (offsetLeft + width - e.pageX) < 5) {
            $this.css({'cursor': 'col-resize'});
          } else {
            $this.css({'cursor': 'default'});
          }
        }
      });
    },

    createTableDragMask: function ($target, e) {
      var self = this;
      var maskW = '300';
      var maskH = '300';
      var mousePosition = util.getEventPosition(e);
      var maskLeft = mousePosition.x - maskW / 2;
      var maskTop = mousePosition.y - maskH / 2;
      var gridWrapperH = $target.jq.$curDragTarget.closest('.s-grid-wrapper').outerHeight();

      $target.ns.divDragMask = document.createElement('div');
      $target.ns.divDragMask.style.cssText = 'width:' + maskW + 'px;height:' + maskH + 'px;left:' + maskLeft + 'px;top:' + maskTop + 'px;position:absolute;background:transparent;z-index:999999;';

      document.body.appendChild($target.ns.divDragMask);

      $target.ns.divDragLine = document.createElement('div');
      $target.ns.divDragLine.className = 's-grid-drag-line';
      $target.ns.divDragLine.style.cssText = 'width:1px;height:' + gridWrapperH + 'px;left:' + mousePosition.x + 'px;top:' + $target.jq.$curDragTarget.offset().top + 'px;position:absolute;background:black;z-index:999990;';

      document.body.appendChild($target.ns.divDragLine);

      $($target.ns.divDragMask).on({
        'mousemove': dragAndCalculate,
        'mouseup': finishResizeColumn
      });

      function dragAndCalculate(e) {
        var minColumnW = 20;
        var minTableW = 40;
        var curDragTargetW = $target.jq.$curDragTarget.outerWidth();
        var mousePosition = util.getEventPosition(e);
        var $curGridTable = $target.jq.$curDragTarget.closest('.s-grid-table');
        var $gridWrapper = $target.jq.$curDragTarget.closest('.s-grid-wrapper');
        var gridWrapperW = $gridWrapper.outerWidth();
        var curGridTableW = $curGridTable.outerWidth();

        util.clearDocumentSelection();

        $target.ns.divDragMask.style.left = mousePosition.x - maskW / 2 + 'px';

        if (curDragTargetW + mousePosition.x - $target.ns.originPointX >= minColumnW
          && (mousePosition.x - $target.ns.originPointX) <= (gridWrapperW - curGridTableW - minTableW)) {
          $target.ns.divDragLine.style.left = mousePosition.x + 'px';
        }
      }

      function finishResizeColumn() {

        resizeColumn();

        $(document).off({
          'mousemove': util.clearDocumentSelection
        });

        $target.ns.divDragMask && document.body.removeChild($target.ns.divDragMask);
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

        if ($target.jq.$curDragTarget.data('frozen') === true) {  // 移动冻结列
          $curTable[0].style.width = $curTableHeader.outerWidth() + 'px';
          $curGridTable
            .css({width: $curGridTable.outerWidth() + deltaX + 'px'})
            .siblings('.s-grid-table')
            .css({width: gridWrapperW - $curGridTable.outerWidth() + 'px'});
        } else {
          $curTable[0].style.width = $curTableHeader.outerWidth() - 17 + 'px';
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

    getObjectPosition: function ($obj) {
      return {
        x: $obj.offset().left,
        y: $obj.offset().top
      };
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
    }
  };


  $.fn.grid = function () {

    return this.each(function () {
      grid.init($(this));
    });
  };

  $.fn.grid.methods = function () {

  };

  $.fn.grid.defaults = function () {

  };
});