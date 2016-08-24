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
    init: function () {
      var self = this;

      self.initGlobalScope();
      self.initJqueryObject();
      self.initEvents();
    },

    initGlobalScope: function () {
      var self = this;

      self.globalScope = {};

      self.globalScope.divDragMask = null;
      self.globalScope.divDragLine = null;

      self.globalScope.originPointX = 0;
    },

    initJqueryObject: function () {
      var self = this;

      self.jqueryObject = {};

      self.jqueryObject.$curDragTarget = null;
      self.jqueryObject.$cols = $('#grid-wrapper-1 colgroup');
    },

    initEvents: function () {
      var self = this;

      $('.sc-table-wrapper').on('mousewheel scroll', function (e) {
        var $this = $(this);
        var $closestGridTable = $this.closest('.sc-grid-table');

        $closestGridTable
          .find('.sc-table-header-wrapper')
          .scrollLeft($this.scrollLeft());

        $closestGridTable
          .siblings('.sc-grid-table')
          .find('.sc-table-wrapper')
          .scrollTop($this.scrollTop());
      });

      $('.sc-table-column').on({
        'mousedown': function (e) {
          var $this = $(this);
          var offsetLeft = $this.offset().left;
          var width = $this.outerWidth();

          if ((offsetLeft + width - e.pageX) >= 0 && (offsetLeft + width - e.pageX) < 5) {
            self.jqueryObject.$curDragTarget = $this;

            self.createTableDragMask(e);
            self.globalScope.originPointX = e.pageX;
          }
        },
        'mouseenter mousemove': function (e) {
          var $this = $(this);
          var offsetLeft = $this.offset().left;
          var width = $this.outerWidth();

          if ((offsetLeft + width - e.pageX) >= 0 && (offsetLeft + width - e.pageX) < 5) {
            $this.css({
              'cursor': 'col-resize'
            });
          } else {
            $this.css({
              'cursor': 'default'
            });
          }
        }
      });

      $(document).on({
        'mouseup': function (e) {
          self.jqueryObject.$curDragTarget = null;
        },
        'mousemove': function (e) {
          util.clearDocumentSelection();
        }
      });
    },

    createTableDragMask: function (e) {
      var self = this;
      var maskW = '300';
      var maskH = '300';
      var mousePosition = util.getEventPosition(e);
      var maskLeft = mousePosition.x - maskW / 2;
      var maskTop = mousePosition.y - maskH / 2;
      var gridWrapperH = self.jqueryObject.$curDragTarget.closest('.sc-grid-wrapper').outerHeight();

      self.globalScope.divDragMask = document.createElement('div');
      self.globalScope.divDragMask.style.cssText = 'width:' + maskW + 'px;height:' + maskH + 'px;left:' + maskLeft + 'px;top:' + maskTop + 'px;position:absolute;background:transparent;z-index:999999;';

      document.body.appendChild(self.globalScope.divDragMask);

      self.globalScope.divDragLine = document.createElement('div');
      self.globalScope.divDragLine.style.cssText = 'width:1px;height:' + gridWrapperH + 'px;left:' + mousePosition.x + 'px;top:' + self.jqueryObject.$curDragTarget.offset().top + 'px;position:absolute;background:black;z-index:999990;';

      document.body.appendChild(self.globalScope.divDragLine);

      $(self.globalScope.divDragMask).on({
        'mousemove': dragAndCalculate,
        'mouseup': finishResizeColumn
      });

      function dragAndCalculate(e) {
        var minColumnW = 20;
        var minTableW = 40;
        var curDragTargetW = self.jqueryObject.$curDragTarget.outerWidth();
        var mousePosition = util.getEventPosition(e);
        var $curGridTable = self.jqueryObject.$curDragTarget.closest('.sc-grid-table');
        var $gridWrapper = self.jqueryObject.$curDragTarget.closest('.sc-grid-wrapper');
        var gridWrapperW = $gridWrapper.outerWidth();
        var curGridTableW = $curGridTable.outerWidth();

        self.globalScope.divDragMask.style.left = mousePosition.x - maskW / 2 + 'px';

        if (curDragTargetW + mousePosition.x - self.globalScope.originPointX >= minColumnW
          && (mousePosition.x - self.globalScope.originPointX) <= (gridWrapperW - curGridTableW - minTableW)) {
          self.globalScope.divDragLine.style.left = mousePosition.x + 'px';
        }
      }

      function finishResizeColumn() {

        resizeColumn();
        self.globalScope.divDragMask && document.body.removeChild(self.globalScope.divDragMask);
        self.globalScope.divDragLine && document.body.removeChild(self.globalScope.divDragLine);
      }

      function resizeColumn() {
        var colIndex = self.jqueryObject.$curDragTarget.data('col-index');
        var deltaX = parseInt(self.globalScope.divDragLine.style.left) - self.globalScope.originPointX;
        var $curCol = $(self.jqueryObject.$cols[colIndex]).find('col');
        var $curTable = $curCol.closest('table');
        var $curTableHeader = self.jqueryObject.$curDragTarget.closest('.sc-table-header');
        var $curGridTable = self.jqueryObject.$curDragTarget.closest('.sc-grid-table');
        var $gridWrapper = self.jqueryObject.$curDragTarget.closest('.sc-grid-wrapper');
        var gridWrapperW = $gridWrapper.outerWidth();
        var curColumnW = $curCol.outerWidth() + deltaX;


        self.jqueryObject.$curDragTarget[0].style.width = $curCol[0].style.width = curColumnW + 'px';

        $curTableHeader[0].style.width = $curTableHeader.outerWidth() + deltaX + 'px';

        if (self.jqueryObject.$curDragTarget.data('frozen') === true) {  // 移动冻结列
          $curTable[0].style.width = $curTableHeader.outerWidth() + 'px';
          $curGridTable.css({
            width: $curGridTable.outerWidth() + deltaX + 'px'
          }).siblings('.sc-grid-table').css({
            width: gridWrapperW - $curGridTable.outerWidth() + 'px'
          });
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

      grid.init();
    });
  };

  $.fn.grid.methods = function () {

  };

  $.fn.grid.defaults = function () {

  };
});