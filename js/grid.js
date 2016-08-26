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

  var _id = 0;

  var grid = {
    init: function ($target) {
      var self = this;

      _id++;

      self.initGlobalScope($target);
      self.render($target);
      self.initJqueryObject($target);
      self.initEvents($target);

      self.scrollbarWidth = util.getScrollbarWidth();
    },

    render: function ($target) {
      var self = this;
      var data = $target.data('grid');
      var html = self.createShellHtml($target, data.options);

      return $target.html(html);
    },

    createShellHtml: function ($target, opts) {
      var self = this;
      var html = '';
      var htmlFrozenPart = '';
      var htmlUnfrozenPart = '';
      var htmlFrozenColgroup = '';
      var htmlUnFrozenColgroup = '';
      var cols = opts.columns;
      var len = opts.columns.length;
      var frozenCols = [];
      var unFrozenCols = [];
      var frozenColsW = 0;
      var unFrozenColsW = 0;
      var temp;

      html += self.templateMap.wrapper.begin.replace('{width}', opts.width);

      for (var i = 0; i < len; i++) {
        temp = opts.columns[i];
        if (temp.frozen) {
          frozenColsW += parseInt(temp.width);
          frozenCols.push(temp);
        } else {
          unFrozenCols.push(temp);
        }
      }
      unFrozenColsW = parseInt(opts.width) - frozenColsW;

      var unFrozenColsLen = unFrozenCols.length;
      var frozenColsLen = frozenCols.length;

      htmlUnfrozenPart += self.templateMap.gridTable.begin.replace('{isFrozen}', 'false').replace('{width}', unFrozenColsW + 'px');
      htmlUnfrozenPart += self.templateMap.tableHeader.begin;
      for (var j = 0; j < unFrozenColsLen; j++) {
        temp = unFrozenCols[j];
        htmlUnFrozenColgroup += self.templateMap.colgroup.replace('{width}', temp.width);
        htmlUnfrozenPart += self.templateMap.tableColumn.begin.replace('{classList}', self.createColumnClass(temp)).replace('{colIndex}', j).replace('{index}', temp.index).replace('{width}', temp.width);
        htmlUnfrozenPart += self.templateMap.gridText.replace('{title}', temp.title);
        if (temp.resizeable) {
          htmlUnfrozenPart += self.templateMap.dragQuarantine;
        }
        htmlUnfrozenPart += self.templateMap.tableColumn.end;
      }
      htmlUnfrozenPart += self.templateMap.tableWrapper.begin;
      htmlUnfrozenPart += htmlUnFrozenColgroup;
      htmlUnfrozenPart += self.templateMap.tbody.begin.replace('{id}', $target.ns.id);
      htmlUnfrozenPart += self.templateMap.tbody.end;
      htmlUnfrozenPart += self.templateMap.tableWrapper.end;
      htmlUnfrozenPart += self.templateMap.tableHeader.end;
      htmlUnfrozenPart += self.templateMap.gridTable.end;

      if (frozenColsLen) {
        for (var k = 0; k < frozenColsLen; k++) {

        }
      }
      html = htmlFrozenPart + htmlUnfrozenPart;

      return html;
    },

    createColumnClass: function (opt) {
      var classList = ['s-table-column'];

      if (opt.isCheckbox) classList.push('s-grid-checkbox');
      if (opt.isRowNumber) classList.push('s-grid-rownumber');
      if (!opt.resizeable) classList.push('s-grid-disable-resize');
      if (!opt.sortable) classList.push('s-grid-disable-sort');

      return classList.join(' ');
    },

    initGlobalScope: function ($target) {
      var self = this;

      $target.ns = {};

      $target.ns.id = _id;
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

      $target.find('.s-table-column:not(.s-grid-disable-resize)').on({
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
          var len = $target.jq.$rows.length;

          for (var i = 0; i < len; i++) {
            var $temp = $($target.jq.$rows[i]);

            $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass('s-grid-row-hover') : $temp.removeClass('s-grid-row-hover');
          }
        },
        'click': function (e) {
          var $this = $(this);
          var rowIndex = $this.data('row-index');
          var len = $target.jq.$rows.length;
          var $temp;

          if ($this.is('.s-grid-row-selected')) {
            $target.jq.$btnSelectAll.removeClass('s-grid-row-selected');

            for (var i = 0; i < len; i++) {
              $temp = $($target.jq.$rows[i]);
              if ($temp.is('tr[data-row-index="' + rowIndex + '"]')) $temp.removeClass('s-grid-row-selected');
            }
            return;
          }

          for (var j = 0; j < len; j++) {
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
          var len = $target.jq.$rows.length;

          for (var i = 0; i < len; i++) {
            var $temp = $($target.jq.$rows[i]);

            $temp.removeClass('s-grid-row-hover');
          }
        }
      });

      $target.jq.$headerCols.on({
        'click': function () {
          var $this = $(this);
          var len = $target.jq.$headerCols.length;
          var $temp = null;

          for (var i = 0; i < len; i++) {

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
            if ($this.is(':not(.s-grid-disable-sort)')) {
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
    },
    templateMap: {
      wrapper: {
        begin: '<div class="s-grid-wrapper-outer"><div class="s-grid-wrapper" style="{width}">',
        end: '</div></div>'
      },
      gridTable: {
        begin: '<div class="s-grid-table" data-frozen="{isFrozen}"  style="{width}">',
        end: '</div>'
      },
      tableHeader: {
        begin: '<div class="s-table-header-wrapper" style="overflow: hidden"><div class="s-table-header">',
        end: '</div></div>'
      },
      tableColumn: {
        begin: '<div class="{classList}" data-col-index="{colIndex}" data-index="{index}" style="{width}"><div class="s-grid-text-wrapper">',
        end: '</div></div>'
      },
      checkbox: '<span class="s-grid-check-wrapper"><span class="s-grid-check"></span></span>',
      gridText: '<span class="s-grid-text">{title}</span>',
      dragQuarantine: '<span class="sc-grid-drag-quarantine"></span>',
      tableWrapper: {
        begin: '<div class="s-table-wrapper" style="height:{height};overflow:hidden;"><div style="width: {width};height: {height};"><table style="width: {width};" cellspacing="0" cellpadding="0" border="0">',
        end: '</table></div></div>'
      },
      colgroup: '<colgroup><col style="{width}"/></colgroup>',
      tbody: {
        begin: '<tbody id="s-grid-tbody-{id}">',
        end: '</tbody>'
      },
      total: '\
      <div class="s-grid-wrapper-outer">\
        <div class="s-grid-wrapper" style="width:670px;">\
          <div class="s-grid-table" data-frozen="true"  style="width:370px;">\
            <div class="s-table-header-wrapper" style="overflow: hidden">\
              <div class="s-table-header">\
                <div class="s-table-column s-grid-checkbox s-grid-disable-resize" data-col-index="0" style="width: 26px">\
                  <span class="s-grid-check-wrapper"><span class="s-grid-check"></span></span>\
                </div>\
                <div class="s-table-column s-grid-rownumber  s-grid-disable-resize" data-col-index="1" style="width: 44px">\
                  <span class="">序号</span>\
                </div>\
                <div class="s-table-column" data-col-index="2" style="width: 100px">\
                  <div class="s-grid-text-wrapper"><span class="s-grid-text">测试1</span></div><span class="sc-grid-drag-quarantine"></span>\
                </div>\
                <div class="s-table-column" data-col-index="3" style="width: 100px">\
                  <div class="s-grid-text-wrapper"><span class="s-grid-text">测试2</span></div><span class="sc-grid-drag-quarantine"></span>\
                </div>\
                <div class="s-table-column" data-col-index="4" style="width: 100px">\
                  <div class="s-grid-text-wrapper"><span class="s-grid-text">测试3</span></div><span class="sc-grid-drag-quarantine"></span>\
                </div>\
              </div>\
            </div>\
          <div class="s-table-wrapper" style="height:103px;overflow:hidden;">\
            <div style="width: 370px;height: 103px;">\
              <table style="width: 370px;" cellspacing="0" cellpadding="0" border="0">\
                <colgroup>\
                <col style="width: 26px;"/>\
                </colgroup>\
                <colgroup>\
                <col style="width: 44px;"/>\
                </colgroup>\
                <colgroup>\
                <col style="width: 100px;"/>\
                </colgroup>\
                <colgroup>\
                <col style="width: 100px;"/>\
                </colgroup>\
                <colgroup>\
                <col style="width: 100px;"/>\
                </colgroup>\
                <tbody>\
                </tbody>\
            </table>\
            </div>\
          </div>\
        </div>\
      </div>\
    </div>'
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

  $.fn.grid.methods = {};

  $.fn.grid.defaults = {};
});