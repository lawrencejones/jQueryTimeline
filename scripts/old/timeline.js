// Generated by CoffeeScript 1.6.2
(function() {
  var CONTAINER, END_DATE, MOMENTS, SPINE, START_DATE, UTILS, adjustHeights, animateCircleGrowth, assignMomentTopValues, bindExpandAllToOrigin, center, createAndPlaceMomentDots, createAndPlaceMomentInfo, createEmptyTimeline, createMomentAtSPINE, createMomentsAtSPINE, createTimelineContainer, createTimelineWithMoments, drawInMarkers, drawTimelineSPINE, formatDate, getNextId, makeCircle, monthNumToName, parseDate, produceIntervals, setPriority, sortMoments, updateMomentInfoCSS;

  CONTAINER = null;

  SPINE = null;

  START_DATE = null;

  END_DATE = null;

  MOMENTS = [];

  UTILS = {
    SPINEWidth: 100,
    dateToMarkerNo: function(d) {
      return Math.floor((d - this.startDate) / (1000 * 60 * 60 * 24));
    },
    noOfIntervals: function() {
      return 1 + this.dateToMarkerNo(this.endDate);
    },
    dateToMarkerLeft: function(d) {
      if (typeof d === "string") {
        d = parseDate(d);
      }
      return (this.markerLeftBuffer + this.pctPerInterval() * (this.dateToMarkerNo(d))) + '%';
    },
    pctPerInterval: function() {
      return (100 - this.markerLeftBuffer) / (this.intervals.length - 1);
    }
  };

  window.createTimeline = function(args) {
    var _ref, _ref1, _ref2, _ref3;
    UTILS.markerLeftBuffer = (_ref = args.markerLeftBuffer) != null ? _ref : 3;
    UTILS.interval = (_ref1 = args.interval) != null ? _ref1 : 'day';
    UTILS.structure = (_ref2 = args.structure) != null ? _ref2 : {};
    UTILS.SPINELeftBuffer = (_ref3 = args.SPINELeftBuffer) != null ? _ref3 : 7;
    if (args.start == null) {
      console.log("No start date.");
    } else if (args.end == null) {
      console.log("No end date.");
    } else {
      START_DATE = parseDate(args.start);
      END_DATE = parseDate(args.end);
    }
    if (args.destination == null) {
      return console.log("No jQuery destination element.");
    } else if (args.moments == null) {
      return createEmptyTimeline(args.destination);
    } else {
      MOMENTS = args.moments.slice(0);
      return createTimelineWithMoments(args.destination);
    }
  };

  createTimelineWithMoments = function(destination) {
    createEmptyTimeline(destination);
    drawMomentsAtSPINE();
    bindExpandAllToOrigin(SPINE.parent().data('originCircle'), moments, SPINE);
    return SPINE.parent();
  };

  createEmptyTimeline = function(destination) {
    CONTAINER = createTimelineContainer(destination);
    UTILS.intervals = produceIntervals();
    SPINE = drawTimelineSPINE(UTILS.intervals);
    return drawInMarkers();
  };

  createMomentsAtSPINE = function() {
    var m, moments, _i, _j, _len, _len1, _results;
    for (_i = 0, _len = moments.length; _i < _len; _i++) {
      m = moments[_i];
      createMomentAtSPINE(m);
    }
    moments = assignMomentTopValues(moments, SPINE);
    _results = [];
    for (_j = 0, _len1 = moments.length; _j < _len1; _j++) {
      m = moments[_j];
      _results.push(m.lblContainer.delay(1700).fadeIn({
        duration: 600,
        complete: function() {
          var _k, _len2, _results1;
          _results1 = [];
          for (_k = 0, _len2 = moments.length; _k < _len2; _k++) {
            m = moments[_k];
            _results1.push(m.animateStartWire());
          }
          return _results1;
        }
      }));
    }
    return _results;
  };

  createMomentAtSPINE = function(m) {
    createAndPlaceMomentDots(m);
    return createAndPlaceMomentInfo(m);
  };

  produceIntervals = function() {
    var end, interval, result, start, _i, _len;
    start = new Date(START_DATE);
    end = new Date(END_DATE);
    result = [];
    while (start <= end) {
      result.push({
        date: start.getDate(),
        day: start.getDay(),
        month: start.getMonth(),
        year: start.getFullYear()
      });
      start.setDate(start.getDate() + 1);
    }
    for (_i = 0, _len = result.length; _i < _len; _i++) {
      interval = result[_i];
      setPriority(interval);
    }
    return result;
  };

  setPriority = function(interval) {
    var translation;
    translation = {};
    if (interval['date'] == null) {
      if (typeof interval === 'string') {
        interval = parseDate(interval);
      }
      translation.day = interval.getDay();
      translation.date = interval.getDate();
      translation.month = interval.getMonth();
      interval = translation;
    }
    if (interval.date === 1) {
      return interval.priority = 3;
    } else if (interval.day === 1) {
      return interval.priority = 2;
    } else {
      return interval.priority = 1;
    }
  };

  assignMomentTopValues = function(moments, SPINE) {
    var i, m, upDown, _fn, _i, _j, _k, _len, _len1, _len2;
    sortMoments(moments);
    UTILS.ups = [];
    UTILS.downs = [];
    for (_i = 0, _len = moments.length; _i < _len; _i++) {
      m = moments[_i];
      m.isExpanded = false;
    }
    upDown = function(m, i, ups, downs) {
      m.up = i % 2 === 0;
      if (m.up) {
        return ups.push(m);
      } else {
        return downs.push(m);
      }
    };
    for (i = _j = 0, _len1 = moments.length; _j < _len1; i = ++_j) {
      m = moments[i];
      upDown(m, i, UTILS.ups, UTILS.downs);
    }
    _fn = function(m) {
      var _ref, _ref1;
      m.lblWidth = function() {
        return parseFloat(this._width);
      };
      m.lblHeight = function() {
        return this._height;
      };
      m.top = function() {
        return parseFloat(this._top);
      };
      if ((_ref = m._marginLeft) == null) {
        m._marginLeft = 16;
      }
      m.bottom = function() {
        return parseFloat(this.top() + parseFloat(this.lblHeight()));
      };
      m.leftmost = function() {
        return this.leftPctNum - this.pctOffset() + '%';
      };
      m.rightmost = function() {
        return (parseFloat(this.leftmost()) + this.pctWidth()) + '%';
      };
      if ((_ref1 = m.leftPctNum) == null) {
        m.leftPctNum = parseFloat(UTILS.dateToMarkerLeft(this.start));
      }
      m.pctWidth = function() {
        return 100 * this.lblWidth() / (SPINE.data('widthPct') / 100 * SPINE.parent().width());
      };
      m.pctOffset = function() {
        var leftOffset, widthOfSpinePct;
        leftOffset = parseFloat(this._marginLeft);
        widthOfSpinePct = SPINE.data('widthPct') / 100 * SPINE.parent().width();
        return 100 * (leftOffset / widthOfSpinePxs);
      };
      m.inVerticalRange = function(m) {
        var _ref2, _ref3;
        return (this.top() <= (_ref2 = m.top()) && _ref2 <= this.bottom()) || (this.top() <= (_ref3 = m.bottom()) && _ref3 <= this.bottom());
      };
      m.inHorizontalRange = function(m) {
        var a, b, _ref2, _ref3;
        a = (parseFloat(this.leftmost()) <= (_ref2 = parseFloat(m.leftmost())) && _ref2 <= parseFloat(this.rightmost()));
        b = (parseFloat(this.leftmost()) <= (_ref3 = parseFloat(m.rightmost())) && _ref3 <= parseFloat(this.rightmost()));
        return a || b;
      };
      return m.clash = function(m) {
        return this.inVerticalRange(m) && this.inHorizontalRange(m);
      };
    };
    for (_k = 0, _len2 = moments.length; _k < _len2; _k++) {
      m = moments[_k];
      _fn(m);
    }
    return adjustHeights();
  };

  adjustHeights = function() {
    var adjustForClash, downs, findMaxBottom, findMaxTop, m, processLayers, ups, _fn, _fn1, _i, _j, _k, _l, _len, _len1, _len2, _len3;
    ups = UTILS.ups;
    downs = UTILS.downs;
    for (_i = 0, _len = MOMENTS.length; _i < _len; _i++) {
      m = MOMENTS[_i];
      if (m.isExpanded) {
        m._marginLeft = m.expanded.marginLeft;
        m._width = m.expanded.width;
        m._height = m.expanded.height;
      } else {
        m._marginLeft = m.collapsed.marginLeft;
        m._width = m.collapsed.width;
        m._height = m.collapsed.height;
      }
    }
    _fn = function(m) {
      var dates, leftDaySpan, lowestDate, pointDate, rightDaySpan;
      pointDate = parseDate(m.start);
      leftDaySpan = Math.floor((m.leftPctNum - parseFloat(m.leftmost())) / UTILS.pctPerInterval()) + 1;
      rightDaySpan = Math.floor(((parseFloat(m.rightmost())) - m.leftPctNum) / UTILS.pctPerInterval()) + 1;
      lowestDate = new Date(pointDate);
      lowestDate.setDate(pointDate.getDate() - leftDaySpan);
      pointDate.setDate(pointDate.getDate() + rightDaySpan);
      dates = [];
      while (lowestDate <= pointDate) {
        dates.push(setPriority(lowestDate));
        lowestDate.setDate(lowestDate.getDate() + 1);
      }
      return m.priority = Math.max.apply(Math, dates);
    };
    for (_j = 0, _len1 = MOMENTS.length; _j < _len1; _j++) {
      m = MOMENTS[_j];
      _fn(m);
    }
    _fn1 = function(m) {
      var _top;
      _top = 0;
      if (m.up) {
        switch (m.priority) {
          case 3:
            _top = -35;
            break;
          case 2:
            _top = -30;
            break;
          case 1:
            _top = -23;
        }
        _top = _top - parseFloat(m._height);
      } else {
        switch (m.priority) {
          case 3:
            _top = 20;
            break;
          case 2:
            _top = 16;
            break;
          case 1:
            _top = 12;
        }
      }
      return m._top = _top;
    };
    for (_k = 0, _len2 = MOMENTS.length; _k < _len2; _k++) {
      m = MOMENTS[_k];
      _fn1(m);
    }
    adjustForClash = function(crrt, others) {
      var clashedWith;
      clashedWith = (function() {
        var _l, _len3, _results;
        _results = [];
        for (_l = 0, _len3 = others.length; _l < _len3; _l++) {
          m = others[_l];
          if (crrt.clash(m)) {
            _results.push(m);
          }
        }
        return _results;
      })();
      if (clashedWith.length > 0) {
        if (!m.up) {
          crrt._top = clashedWith[0]._top + 8 + crrt._height;
        } else {
          crrt._top = clashedWith[0]._top - 8 - crrt._height;
        }
        return adjustForClash(crrt, others);
      }
    };
    processLayers = function(moments) {
      var i, ms, _l, _len3, _results;
      _results = [];
      for (i = _l = 0, _len3 = moments.length; _l < _len3; i = ++_l) {
        m = moments[i];
        _results.push(adjustForClash(m, (function() {
          var _len4, _m, _results1;
          _results1 = [];
          for (_m = 0, _len4 = moments.length; _m < _len4; _m++) {
            ms = moments[_m];
            if (ms !== m) {
              _results1.push(ms);
            }
          }
          return _results1;
        })()));
      }
      return _results;
    };
    processLayers(ups);
    processLayers(downs);
    for (_l = 0, _len3 = MOMENTS.length; _l < _len3; _l++) {
      m = MOMENTS[_l];
      updateMomentInfoCSS(m);
    }
    findMaxTop = function(moments) {
      var maxt, t, _len4, _m;
      maxt = 0;
      for (_m = 0, _len4 = moments.length; _m < _len4; _m++) {
        m = moments[_m];
        t = parseFloat(m._top);
        if (maxt > t) {
          maxt = t;
        }
      }
      return Math.abs(maxt);
    };
    return findMaxBottom = function(moments) {
      var b, maxb, _len4, _m;
      maxb = 0;
      for (_m = 0, _len4 = moments.length; _m < _len4; _m++) {
        m = moments[_m];
        b = parseFloat(m._top + m._height);
        if (maxb < b) {
          maxb = b;
        }
      }
      return maxb;
    };
  };

  updateMomentInfoCSS = function(m) {
    var info, top, verticalHeight, verticalTop;
    info = m.lblContainer;
    info.animate({
      height: m._height,
      width: m._width,
      marginLeft: m._marginLeft,
      top: m._top + 'px'
    }, {
      duration: 200
    });
    if (m.vertical != null) {
      top = m.top() + m.lblHeight() / 2;
      verticalHeight = Math.abs(top);
      if (m.up) {
        verticalTop = top;
      } else {
        verticalTop = 0;
      }
      m.vertical.animate({
        top: verticalTop,
        height: verticalHeight
      }, {
        duration: 200
      });
      m.horizontal.animate({
        top: top
      }, {
        duration: 200
      });
    }
    if (m.startWire.height() !== 0) {
      return m.animateStartWire();
    }
  };

  bindExpandAllToOrigin = function(originCircle, moments, SPINE) {
    return originCircle.data('clicked', true).click(function() {
      var e, m, notExpanded, _i, _j, _k, _len, _len1, _len2;
      e = originCircle.data('clicked');
      notExpanded = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = MOMENTS.length; _i < _len; _i++) {
          m = MOMENTS[_i];
          if (!m.isExpanded) {
            _results.push(m);
          }
        }
        return _results;
      })();
      for (_i = 0, _len = MOMENTS.length; _i < _len; _i++) {
        m = MOMENTS[_i];
        m.isExpanded = e;
      }
      if (e) {
        adjustHeights();
        for (_j = 0, _len1 = notExpanded.length; _j < _len1; _j++) {
          m = notExpanded[_j];
          animateEndWires(m);
        }
      } else {
        adjustHeights();
        for (_k = 0, _len2 = moments.length; _k < _len2; _k++) {
          m = moments[_k];
          m.removeEndWires();
        }
      }
      return originCircle.data('clicked', !e);
    });
  };

  monthNumToName = function(m) {
    return "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Aug,Nov,Dec".split(',')[m];
  };

  sortMoments = function(moments) {
    return moments.sort(function(a, b) {
      if (parseDate(a.start) < parseDate(b.start)) {
        return -1;
      } else {
        return 1;
      }
    });
  };

  getNextId = function() {
    return 'timeline_' + $('.timeline').length + 1;
  };

  parseDate = function(input) {
    var parts;
    if (input.getDate != null) {
      return new Date(input.getTime());
    }
    parts = input.match(/(\d+)/g);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  formatDate = function(d) {
    var pad;
    if (d.getDate != null) {
      return d;
    }
    pad = function(a, b) {
      return (1e15 + a + "").slice(-b);
    };
    return d.getFullYear() + '/' + pad(d.getMonth() + 1, 2) + '/' + pad(d.getDate(), 2);
  };

  createTimelineContainer = function(destination) {
    return $('<div/ id="#{getNextId()}" class="timelineContainer">').css({
      position: 'relative',
      minWidth: '500px',
      minHeight: '150px',
      height: 'auto',
      width: '100%',
      backgroundColor: 'white'
    }).appendTo(destination);
  };

  drawTimelineSPINE = function(intervals) {
    var markerLeftBuffer, rightBuffer, tlSPINE;
    rightBuffer = UTILS.markerLeftBuffer;
    markerLeftBuffer = UTILS.SPINELeftBuffer;
    UTILS.SPINEWidthPct = 100 - (rightBuffer + markerLeftBuffer);
    return tlSPINE = $('<div class="SPINE"/>').appendTo(CONTAINER).css({
      'margin-left': markerLeftBuffer + '%',
      'margin-right': rightBuffer + '%'
    }).animate({
      width: UTILS.SPINEWidthPct + '%'
    }, {
      duration: 1000,
      complete: function() {
        return tlSPINE.find('.intMarker').delay(800).fadeIn(600);
      }
    });
  };

  makeCircle = function(r, c, boxShadow) {
    var circle;
    if (boxShadow == null) {
      boxShadow = true;
    }
    center(circle = $(document.createElement('div')).css({
      background: c,
      zIndex: 10,
      height: r + 'px',
      width: r + 'px',
      position: 'absolute',
      '-moz-border-radius': r + 'px',
      '-webkit-border-radius': r + 'px'
    }));
    if (boxShadow) {
      circle.css({
        '-webkit-box-shadow': '0 0 1px black',
        '-moz-box-shadow': '0 0 1px black',
        boxShadow: '0 0 1px black'
      });
    }
    return circle;
  };

  center = function(c) {
    return c.css({
      'margin-top': -c.height() / 2 + 'px',
      'margin-left': -c.width() / 2 + 'px'
    });
  };

  animateCircleGrowth = function(c, rGoal, speed) {
    return c.animate({
      'height': rGoal + 'px',
      'width': rGoal + 'px',
      '-moz-border-radius': rGoal + 'px',
      '-webkit-border-radius': rGoal + 'px',
      'margin-top': -rGoal / 2 + 'px',
      'margin-left': -rGoal / 2 + 'px'
    }, {
      duration: speed
    });
  };

  drawInMarkers = function() {
    var assignCSS, buildLabel, drawOrigin, i, int, lbl, leftPos, ps, _i, _len, _ref;
    assignCSS = function(int) {
      var r, today;
      today = new Date();
      switch (int.priority) {
        case 3:
          r = {
            w: 3,
            h: 19,
            c: 'black'
          };
          break;
        case 2:
          r = {
            w: 2,
            h: 11,
            c: 'black'
          };
          break;
        case 1:
          r = {
            w: 1,
            h: 5,
            c: 'black'
          };
      }
      if ((int.date === today.getDate()) && (int.month === today.getMonth())) {
        r.c = 'blue';
        if (r.h < 15) {
          r.h = 15;
        }
      }
      return r;
    };
    buildLabel = function(int) {
      var lbl, txt;
      lbl = $('<div/>').addClass('intMarker');
      txt = '';
      switch (int.priority) {
        case 3:
          txt = monthNumToName(int.month);
          lbl.css({
            marginTop: -28,
            fontSize: 9,
            fontWeight: 'bold'
          });
          break;
        case 2:
          txt = 'Mon ' + int.date;
          break;
        case 1:
          return null;
      }
      return lbl.text(txt);
    };
    drawOrigin = function() {
      return UTILS.originCircle = makeCircle(12, 'black').addClass('originCircle').css({
        opacity: 0,
        cursor: 'pointer',
        top: '50%',
        left: SPINE.data('markerLeftBuffer') + '%'
      }).animate({
        opacity: 1
      }, {
        duration: 300
      });
    };
    _ref = UTILS.intervals;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      int = _ref[i];
      ps = assignCSS(int);
      leftPos = UTILS.markerLeftBuffer + i * UTILS.pctPerInterval() + '%';
      $('<div class="int_marker"/>').css({
        marginLeft: -ps.w / 2,
        width: ps.w,
        backgroundColor: ps.c,
        left: leftPos
      }).delay(1200).animate({
        height: ps.h,
        marginTop: -ps.h / 2
      }, {
        duration: 300
      }).appendTo(SPINE);
      lbl = buildLabel(int);
      if (lbl != null) {
        lbl.css('left', leftPos).hide().appendTo(SPINE);
      }
    }
    return drawOrigin;
  };

  createAndPlaceMomentDots = function(moment) {
    var createDurationLine, endLeft, hoverCircle, startLeft;
    createDurationLine = function(moment, color) {
      var lft, line, right, width;
      lft = UTILS.dateToMarkerLeft(moment.start);
      right = UTILS.dateToMarkerLeft(moment.end);
      width = (parseFloat(right) - parseFloat(lft)) + '%';
      return line = $('<div class="duration"/>').css({
        left: lft,
        backgroundColor: color
      }).data({
        slideIn: function() {
          if (!line.hasClass('inTransition')) {
            line.addClass('inTransition').stop().css('width', 0).animate({
              width: width
            }, {
              duration: 300,
              complete: function() {
                return line.removeClass('inTransition');
              }
            });
            return moment.endDot.fadeIn(300);
          }
        },
        slideOut: function() {
          var delay;
          if (line.hasClass('inTransition')) {
            delay = 200;
          }
          moment.endDot.delay(delay).stop().fadeOut(300);
          return line.delay(delay).stop().removeClass('inTransition').animate({
            width: 0
          }, {
            duration: 300
          });
        }
      });
    };
    startLeft = UTILS.dateToMarkerLeft(parseDate(moment.start));
    endLeft = utils.dateToMarkerLeft(parseDate(moment.end));
    (moment.startDot = makeCircle(7, '#47ACCA')).delay(1400).css({
      left: 0,
      zIndex: 10
    }.animate({
      left: startLeft
    }, {
      duration: 400
    }));
    (moment.endDot = makeCircle(7, '#E0524E')).hide().delay(1400).css({
      startLeft: 0,
      zIndex: 11
    });
    moment.duration = createDurationLine(moment, '#5BB35C');
    hoverCircle = makeCircle(14, 'white').css({
      opacity: 0,
      left: startLeft
    });
    SPINE.append(moment.startDot, moment.endDot, moment.duration, hoverCircle);
    return moment.hoverAnimation = {
      "in": moment.duration.data('slideIn'),
      out: moment.duration.data('slideOut')
    };
  };

  createAndPlaceMomentInfo = function(moment) {
    var animateEndWires, container, createAndPlaceMomentStartWire, left, processExpanded, processTitle;
    processTitle = function(m, infoDiv) {
      var i, key, mainTitle, textLine, _i, _ref;
      textLine = "";
      if (UTILS.structure.title.length !== 1) {
        for (i = _i = 0, _ref = UTILS.structure.title.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          key = UTILS.structure.title[i];
          if (m[key] != null) {
            textLine += m[key] + ':';
          }
        }
      }
      textLine += m[UTILS.structure.title[UTILS.structure.title.length - 1]];
      mainTitle = $('<span/>').css('display', 'inline').text(textLine).addClass('title').appendTo(infoDiv);
      m.collapsed = {
        height: infoDiv.height(),
        width: infoDiv.width() + 1,
        marginLeft: -(infoDiv.width()) / 2
      };
      return processExpanded(m, mainTitle, infoDiv, textLine);
    };
    processExpanded = function(m, mainTitle, infoDiv, textLine) {
      var addedContent, content, i, key, link, linkKey, links, structure, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _ref2;
      structure = UTILS.structure;
      if (structure.extendedTitle.length !== 0) {
        textLine += ' - ';
        for (i = _i = 0, _ref = structure.extendedTitle.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          key = structure.extendedTitle[i];
          if (m.key != null) {
            textLine = textLine + m[key] + ', ';
          }
        }
        textLine += m[structure.extendedTitle[structure.extendedTitle.length - 1]];
        if (/^[\s]+$/.test(textLine.split(' - ')[1])) {
          textLine = textLine.replace(' - ', '');
        }
      }
      mainTitle.text(textLine);
      textLine = '';
      infoDiv.html(infoDiv.html() + '<br>');
      content = $('<span/>').css({
        whiteSpace: 'nowrap',
        fontSize: '10px'
      }).appendTo(infoDiv);
      if (structure.content.names != null) {
        links = [];
        _ref1 = structure.content.links;
        for (i = _j = 0, _len = _ref1.length; _j < _len; i = ++_j) {
          linkKey = _ref1[i];
          if (m[linkKey] != null) {
            links.push($('<a/>').text(structure.content.names[i]).attr('href', m[linkKey]));
          }
        }
        addedContent = links.length !== 0;
        for (i = _k = 0, _len1 = links.length; _k < _len1; i = ++_k) {
          link = links[i];
          if (i !== links.length - 1) {
            link.appendTo(content);
            content.html(content.html() + ' / ');
          }
        }
        if (links[0] != null) {
          content.append(link);
        }
      } else {
        for (i = _l = 0, _ref2 = structure.content.length - 2; 0 <= _ref2 ? _l <= _ref2 : _l >= _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
          key = structure.content[i];
          if (m[key] != null) {
            textLine += m[key] + ' / ';
          }
        }
        textLine += m[structure.content[structure.content.length - 1]];
        addedContent = true;
        content.text(textLine);
      }
      m.expanded = {
        height: infoDiv.height() + (addedContent ? 4 : 0),
        width: infoDiv.width() + (addedContent ? 4 : 0),
        marginLeft: m.collapsed.marginLeft
      };
      return infoDiv.css({
        height: m.collapsed.height,
        width: m.collapsed.width,
        marginLeft: m.collapsed.marginLeft
      });
    };
    createAndPlaceMomentStartWire = function(moment, left) {
      var startWire;
      startWire = $('<div/>').appendTo(SPINE);
      startWire.addClass('wire').css({
        position: 'absolute',
        width: '2',
        backgroundColor: 'black',
        left: left,
        top: 0,
        '-webkit-box-shadow': '0 0 2px blue',
        height: 0,
        '-moz-box-shadow': '0 0 2px blue',
        boxShadow: '0 0 2px blue'
      });
      moment.startWire = startWire;
      return moment.animateStartWire = function() {
        if (this.up) {
          return this.startWire.stop().animate({
            height: Math.abs(this.bottom()),
            top: this.bottom()
          }, {
            duration: 200,
            easing: 'linear'
          });
        } else {
          return this.startWire.animate({
            height: this.top()
          }, {
            duration: 200
          });
        }
      };
    };
    animateEndWires = function(m) {
      var left, right, startWire, top, vHeight, vTop, verticalTop;
      startWire = m.startWire;
      left = UTILS.dateToMarkerLeft(m.start);
      right = parseFloat(utils.dateToMarkerLeft(m.end));
      top = m.top() + m.lblHeight() / 2;
      vHeight = Math.abs(top);
      if (m.up) {
        vTop = top;
      } else {
        verticalTop = 0;
      }
      m.vertical = $('<div class="due_wire"/>').css({
        width: '2px',
        left: right + '%',
        height: 0,
        top: top
      });
      m.horizontal = $('<div class="due_wire"/>').css({
        height: '2px',
        left: left,
        width: 0,
        top: top
      });
      SPINE.append(m.vertical, m.horizontal);
      m.horizontal.animate({
        width: (right - parseFloat(left)) + '%'
      }, {
        complete: function() {
          return m.vertical.animate({
            height: vHeight,
            top: vTop
          }, {
            duration: 200
          });
        }
      });
      return m.removeEndWires = function() {
        m.vertical.remove();
        return m.horizontal.remove();
      };
    };
    left = UTILS.dateToMarkerLeft(moment.start);
    container = $('<div/>').addClass('infoBox').css('left', left).click(function() {
      moment.isExpanded = !moment.isExpanded;
      adjustHeights();
      if (moment.isExpanded) {
        return animateEndWires(moment);
      } else {
        return moment.removeEndWires();
      }
    }).hover(moment.hoverAnimation["in"], moment.hoverAnimation.out.appendTo(SPINE));
    processTitle(moment, container).hide();
    container.css('margin-left', -container.width() / 2).data('defaultLeft', left);
    moment.leftPctNum = parseFloat(left);
    createAndPlaceMomentStartWire(moment, left);
    moment.lblContainer = container;
    return moment;
  };

}).call(this);
