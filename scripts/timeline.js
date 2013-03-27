// Generated by CoffeeScript 1.6.2
(function() {
  var animateCircleGrowth, animateMarker, assignMomentTopValues, buildLabel, center, createAndPlaceMomentDots, createAndPlaceMomentInfo, createAndPlaceMomentStartWire, createDurationLine, createMoment, createMoments, createTimelineContainer, drawInMarkers, drawTimelineOriginCircle, drawTimelineSpine, getContainer, getNextId, getTestData, getUtils, makeCircle, makeMarker, monthNumToName, parseDate, printCurrentContainerData, processExpanded, processLayers, processTitle, produceIntervals, runTests, setContainerData, setPriority, shootMarkerByDate, sortMoments, updateMomentInfoCSS;

  setContainerData = function(container, start, end, markerLeftBuffer, structure) {
    return container.data({
      utils: {
        startDate: start,
        endDate: end,
        markerLeftBuffer: markerLeftBuffer,
        spineWidth: this.spineWidth != null ? 100 : void 0,
        structure: structure,
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
          return (100 - this.markerLeftBuffer) / (this.noOfIntervals() - 1);
        },
        toString: function() {
          return "Start : " + this.startDate + " 				\nEnd : " + this.endDate + "  				\nMarkers left buffer : " + this.markerLeftBuffer + " 				\nNo Of Intervals : " + (this.noOfIntervals()) + "  				\nPercent per Interval : " + (this.pctPerInterval().toFixed(3));
        }
      }
    });
  };

  produceIntervals = function(start, end, interval) {
    var result, _i, _len;
    start = parseDate(start);
    end = parseDate(end);
    result = [];
    while (start <= end) {
      result.push({
        date: start.getDate(),
        day: start.getDay(),
        month: start.getMonth(),
        year: 1900 + start.getYear(),
        toString: function() {
          return this.date + '/' + this.month + '/' + this.year + ' day is ' + this.day;
        }
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

  getContainer = function(spine) {
    return spine.parent();
  };

  getUtils = function(container) {
    if (container.hasClass('spine')) {
      return container.parent().data('utils');
    } else {
      return container.data('utils');
    }
  };

  getNextId = function() {
    return 'timeline_' + $('.timeline').length + 1;
  };

  parseDate = function(input) {
    var parts;
    parts = input.match(/(\d+)/g);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  assignMomentTopValues = function(moments, spine) {
    var downs, i, m, upDown, ups, utils, _fn, _i, _j, _k, _len, _len1, _len2;
    utils = getUtils(spine);
    sortMoments(moments);
    ups = [];
    downs = [];
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
      upDown(m, i, ups, downs);
    }
    spine.data('ups', ups);
    spine.data('downs', downs);
    console.log('Ups length : ' + ups.length);
    console.log('Downs length : ' + downs.length);
    _fn = function(m) {
      var _ref;
      m.spine = spine;
      m.lblWidth = function() {
        return this.lblContainer.width();
      };
      m.lblHeight = function() {
        return this._height;
      };
      m.top = function() {
        return this._top;
      };
      m.bottom = function() {
        return parseFloat(this.top() + this.lblHeight());
      };
      m.leftmost = function() {
        return this.leftPctNum - this.pctOffset() + '%';
      };
      m.rightmost = function() {
        return (parseFloat(this.leftmost()) + this.pctWidth()) + '%';
      };
      if ((_ref = m.leftPctNum) == null) {
        m.leftPctNum = parseFloat(utils.dateToMarkerLeft(this.start));
      }
      m.pctWidth = function() {
        return 100 * this.lblWidth() / (this.spine.data('widthPct') / 100 * this.spine.parent().width());
      };
      m.pctOffset = function() {
        var leftOffset, widthOfSpinePxs;
        leftOffset = parseFloat(this._marginLeft);
        widthOfSpinePxs = this.spine.data('widthPct') / 100 * this.spine.parent().width();
        return 100 * (leftOffset / widthOfSpinePxs);
      };
      m.inVerticalRange = function(m) {
        var _ref1, _ref2;
        return (this._top <= (_ref1 = m._top) && _ref1 <= this._bottom) || (this._top <= (_ref2 = m._bottom) && _ref2 <= this._bottom);
      };
      m.inHorizontalRange = function(m) {
        var _ref1, _ref2;
        return (this.leftmost() <= (_ref1 = m.leftmost()) && _ref1 <= this.rightmost()) || (this.leftmost() <= (_ref2 = m.rightmost()) && _ref2 <= this.rightmost());
      };
      return m.clash = function(m) {
        return this.inVerticalRange(m) && this.inHorizontalRange(m);
      };
    };
    for (_k = 0, _len2 = moments.length; _k < _len2; _k++) {
      m = moments[_k];
      _fn(m);
    }
    return processLayers(moments);
  };

  processLayers = function(moments, ups, downs) {
    var adjustForClash, m, spine, utils, _fn, _fn1, _i, _j, _k, _l, _len, _len1, _len2, _len3;
    spine = moments[0].spine;
    utils = getUtils(spine);
    ups = spine.data('ups');
    downs = spine.data('downs');
    for (_i = 0, _len = moments.length; _i < _len; _i++) {
      m = moments[_i];
      if (m.isExpanded) {
        m._marginLeft = m.expanded.marginLeft;
        m._width = m.expanded.width;
        m.height = m.expanded.height;
      } else {
        m._marginLeft = m.collapsed.marginLeft;
        m._width = m.collapsed.width;
        m._height = m.collapsed.height;
      }
    }
    _fn = function(m) {
      var dates, leftDaySpan, lowestDate, pointDate, rightDaySpan;
      pointDate = parseDate(m.start);
      leftDaySpan = Math.floor((m.leftPctNum - parseFloat(m.leftmost())) / utils.pctPerInterval()) + 1;
      rightDaySpan = Math.floor(((parseFloat(m.rightmost())) - m.leftPctNum) / utils.pctPerInterval()) + 1;
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
    for (_j = 0, _len1 = moments.length; _j < _len1; _j++) {
      m = moments[_j];
      _fn(m);
    }
    _fn1 = function(m) {
      var _top;
      _top = 0;
      if (m.up) {
        switch (m.priority) {
          case 3:
            _top = -25;
            break;
          case 2:
            _top = -20;
            break;
          case 1:
            _top = -13;
        }
        _top = _top - m.lblHeight() + 'px';
      } else {
        switch (m.priority) {
          case 3:
            _top = '20px';
            break;
          case 2:
            _top = '16px';
            break;
          case 1:
            _top = '12px';
        }
      }
      return m._top = _top;
    };
    for (_k = 0, _len2 = moments.length; _k < _len2; _k++) {
      m = moments[_k];
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
          crrt._top = clashedWith[0]._top + 4 + crrt._height;
        } else {
          crrt._top = clashedWith[0]._top - 4 - crrt._height;
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
    for (_l = 0, _len3 = moments.length; _l < _len3; _l++) {
      m = moments[_l];
      updateMomentInfoCSS(m);
    }
    return moments;
  };

  updateMomentInfoCSS = function(m) {
    var info;
    info = m.lblContainer;
    info.animate({
      height: m._height,
      width: m._width,
      left: m._left,
      top: m._top
    });
    return m.animateStartWire();
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

  createTimelineContainer = function(userContainer) {
    var timelineContainer;
    userContainer.append(timelineContainer = $(document.createElement('div')));
    return timelineContainer.attr({
      'id': getNextId(),
      'class': 'timelineContainer'
    }).css({
      'position': 'absolute',
      'height': '150px',
      'width': '100%',
      'backgroundColor': 'white'
    });
  };

  makeCircle = function(r, c) {
    var circle;
    return center(circle = $(document.createElement('div')).css({
      background: c,
      zIndex: 10,
      height: r + 'px',
      width: r + 'px',
      '-moz-border-radius': r + 'px',
      '-webkit-border-radius': r + 'px',
      '-webkit-box-shadow': '0 0 1px black',
      '-moz-box-shadow': '0 0 1px black',
      boxShadow: '0 0 1px black',
      position: 'absolute'
    }));
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

  drawTimelineSpine = function(timelineContainer) {
    var leftBuffer, rightBuffer, tlSpine;
    leftBuffer = 7;
    rightBuffer = 3;
    tlSpine = $(document.createElement('div')).data({
      'leftBuffer': leftBuffer,
      'rightBuffer': rightBuffer
    });
    timelineContainer.append(tlSpine);
    tlSpine.data('widthPct', 100 - (rightBuffer + leftBuffer));
    return tlSpine.attr({
      'class': 'spine'
    }).css({
      'position': 'absolute',
      'width': '0%',
      'height': '1px',
      'margin-top': '50%',
      'margin-left': leftBuffer + '%',
      'margin-right': rightBuffer + '%',
      'backgroundColor': 'black'
    }).animate({
      width: 100 - (rightBuffer + leftBuffer) + '%'
    }, {
      duration: 1000,
      complete: function() {
        return tlSpine.find('.intMarker').delay(800).fadeIn(600);
      }
    });
  };

  drawTimelineOriginCircle = function(spine) {
    var container;
    container = getContainer(spine);
    container.append(makeCircle(12, 'black').addClass('originCircle').css({
      'opacity': 0,
      'top': '50%',
      'left': spine.data('leftBuffer') + '%'
    }));
    return container.find('.originCircle').animate({
      'opacity': 1
    }, {
      duration: '300',
      easing: 'easeInBounce'
    });
  };

  makeMarker = function(properties) {
    var h, w;
    h = properties['h'];
    w = properties['w'];
    return $(document.createElement('div')).css({
      position: 'absolute',
      top: 0,
      marginTop: 0,
      'margin-left': -w / 2,
      height: 0,
      width: w,
      backgroundColor: properties['c']
    }).data('finalHeight', h);
  };

  animateMarker = function(m) {
    var finalHeight;
    finalHeight = m.data('finalHeight');
    return m.delay(1200).animate({
      height: finalHeight,
      marginTop: -finalHeight / 2
    }, {
      duration: 300
    });
  };

  buildLabel = function(int) {
    var lbl, txt;
    lbl = $(document.createElement('div')).css({
      marginTop: -14,
      width: 40,
      marginLeft: -20,
      textAlign: 'center',
      height: 'auto',
      fontFamily: 'Helvetica Neue',
      fontSize: '7px',
      position: 'absolute'
    }).addClass('intMarker');
    txt = '';
    switch (int.priority) {
      case 3:
        txt = monthNumToName(int.month);
        lbl.css({
          marginTop: -20,
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

  drawInMarkers = function(spine, intervals) {
    var assignCSS, buffer, i, int, lbl, mrk, pctPerInterval, pos, today, utils, _i, _len, _results;
    today = new Date();
    assignCSS = function(int) {
      var r;
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
    utils = getUtils(getContainer(spine));
    buffer = utils.markerLeftBuffer;
    pctPerInterval = utils.pctPerInterval();
    _results = [];
    for (i = _i = 0, _len = intervals.length; _i < _len; i = ++_i) {
      int = intervals[i];
      pos = 3 + i * pctPerInterval + '%';
      (mrk = makeMarker(assignCSS(int))).css({
        left: pos
      });
      spine.append(mrk);
      animateMarker(mrk);
      lbl = buildLabel(int);
      if (lbl != null) {
        spine.append(lbl.css('left', pos));
        _results.push(lbl.hide());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  createDurationLine = function(moment, utils, color) {
    var lft, line, right, width;
    lft = utils.dateToMarkerLeft(parseDate(moment.start));
    right = utils.dateToMarkerLeft(parseDate(moment.end));
    width = (parseFloat(right) - parseFloat(lft)) + '%';
    return line = $(document.createElement('div')).css({
      height: 2,
      width: 0,
      position: 'absolute',
      left: lft,
      zIndex: 5,
      backgroundColor: color
    }).data({
      slideIn: function() {
        return line.stop().css('width', 0).animate({
          width: width
        }, {
          duration: 400,
          complete: function() {
            return moment.endDot.stop().fadeIn();
          }
        });
      },
      slideOut: function() {
        line.stop().animate({
          width: 0
        }, {
          duration: 300
        });
        return moment.endDot.stop().fadeOut();
      }
    });
  };

  createAndPlaceMomentDots = function(moment, spine) {
    var endLeft, hoverCircle, startLeft, utils;
    utils = getUtils(spine);
    startLeft = utils.dateToMarkerLeft(parseDate(moment.start));
    endLeft = utils.dateToMarkerLeft(parseDate(moment.end));
    spine.append((moment.startDot = makeCircle(7, 'blue')).delay(1400).css('left', 0).animate({
      left: startLeft
    }, {
      duration: 400
    }));
    spine.append((moment.endDot = makeCircle(7, 'red')).delay(1400).css('left', 0).animate({
      left: endLeft
    }, {
      duration: 400
    }).hide());
    spine.append((moment.duration = createDurationLine(moment, getUtils(spine), 'green')));
    spine.append((hoverCircle = makeCircle(14, 'white').css({
      opacity: 0,
      left: startLeft
    })));
    moment.hoverAnimation = {
      "in": moment.duration.data('slideIn'),
      out: moment.duration.data('slideOut')
    };
    return hoverCircle.hover(function() {
      return moment.hoverAnimation["in"]();
    }, function() {
      return moment.hoverAnimation.out();
    });
  };

  processTitle = function(m, infoDiv, structure, utils) {
    var i, key, textLine, _i, _ref;
    textLine = "";
    for (i = _i = 0, _ref = structure.title.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      key = structure.title[i];
      if (m[key] != null) {
        textLine += m[key] + ':';
      }
    }
    textLine += m[structure.title[structure.title.length - 1]];
    infoDiv.text(textLine);
    m.collapsed = {
      height: infoDiv.height(),
      width: infoDiv.width() + 4,
      marginLeft: (infoDiv.width() + 4) / 2
    };
    infoDiv;
    return processExpanded(m, textLine, infoDiv, structure, utils);
  };

  processExpanded = function(m, textLine, infoDiv, structure, utils) {
    var i, key, marginLeft, _i, _j, _ref, _ref1;
    textLine += ' - ';
    for (i = _i = 0, _ref = structure.extendedTitle.length - 2; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      key = structure.extendedTitle[i];
      if (m.key != null) {
        textLine += m[key] + ', ';
      }
    }
    textLine += m[structure.extendedTitle[structure.extendedTitle.length - 1]];
    textLine += "\n";
    for (i = _j = 0, _ref1 = structure.content.length - 2; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      key = structure.content[i];
      if (m.key != null) {
        textLine += m[key] + ' / ';
      }
    }
    textLine += m[structure.content[structure.content.length - 1]];
    infoDiv.text(textLine);
    infoDiv.html(infoDiv.html().replace(/\n/g, '<br>'));
    marginLeft = (parseFloat(utils.dateToMarkerLeft(m.start) + parseFloat(utils.dateToMarkerLeft(m.end)))) / 2 - infoDiv.width() / 2;
    m.expanded = {
      height: infoDiv.height(),
      width: infoDiv.width() + 4,
      marginLeft: marginLeft
    };
    return infoDiv.css({
      height: m.collapsed.height,
      width: m.collapsed.width,
      marginLeft: m.collapsed.marginLeft
    });
  };

  createAndPlaceMomentInfo = function(moment, spine) {
    var container, left;
    left = getUtils(spine).dateToMarkerLeft(moment.start);
    spine.append((container = $(document.createElement('div'))));
    container.addClass('momentInfo').css({
      position: 'absolute',
      textAlign: 'left',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px',
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
      borderColor: '#636363',
      fontSize: '10px',
      borderWidth: '1',
      borderStyle: 'solid',
      zIndex: 30,
      overflow: 'hidden',
      textIndent: '4px',
      backgroundColor: 'rgb(221,221,221)',
      left: left
    });
    processTitle(moment, container, getUtils(spine).structure, getUtils(spine)).hide();
    container.css('margin-left', -container.width() / 2).data('defaultLeft', left);
    moment.leftPctNum = parseFloat(left);
    createAndPlaceMomentStartWire(moment, spine, left);
    return moment.lblContainer = container;
  };

  createAndPlaceMomentStartWire = function(moment, spine, left) {
    var startWire;
    spine.append((startWire = $(document.createElement('div'))));
    startWire.addClass('wire').css({
      position: 'absolute',
      width: '1',
      backgroundColor: 'black',
      height: 0,
      left: left,
      top: 0,
      '-webkit-box-shadow': '0 0 1px blue',
      '-moz-box-shadow': '0 0 1px blue',
      boxShadow: '0 0 1px blue'
    });
    moment.startWire = startWire;
    return moment.animateStartWire = function() {
      console.log('My bottom = ' + this.bottom());
      if (this.up) {
        return this.startWire.animate({
          height: Math.abs(this.bottom()),
          top: this.bottom()
        }, {
          duration: 200
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

  createMoment = function(m, spine) {
    var utils;
    utils = getUtils(spine);
    createAndPlaceMomentDots(m, spine);
    return createAndPlaceMomentInfo(m, spine);
  };

  createMoments = function(moments, spine) {
    var m, _i, _j, _len, _len1, _ref;
    for (_i = 0, _len = moments.length; _i < _len; _i++) {
      m = moments[_i];
      createMoment(m, spine);
    }
    _ref = assignMomentTopValues(moments, spine);
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      m = _ref[_j];
      m.lblContainer.delay(1700).fadeIn({
        duration: 600
      });
    }
    return moments;
  };

  runTests = function(container, spine) {
    var moments, utils;
    utils = getUtils(container);
    console.log('Printing current container information...\n');
    printCurrentContainerData(container);
    return moments = createMoments(getTestData(), spine, utils);
  };

  printCurrentContainerData = function(container) {
    return console.log(getUtils(container).toString());
  };

  shootMarkerByDate = function(d, container, utils) {
    var spine;
    spine = container.find('.spine').eq(0);
    return $(document.createElement('div')).css({
      left: utils.dateToMarkerLeft(parseDate(d)),
      position: 'absolute',
      backgroundColor: 'black',
      height: 30,
      width: 1,
      marginTop: -15
    }).appendTo(spine);
  };

  getTestData = function() {
    return [
      {
        id: '2',
        type: 'TUT',
        name: 'Tutorial sheet 1 - recap and basic objects',
        start: '2013-01-14',
        end: '2013-01-21',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }, {
        id: '4',
        type: 'TUT',
        name: 'Tutorial sheet 3 - abstract classes and interfaces',
        start: '2013-01-28',
        end: '2013-02-12',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }, {
        id: '6',
        type: 'TUT',
        name: 'Tutorial sheet 5 - exceptions and miscellaneous',
        start: '2013-02-11',
        end: '2013-02-18',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }, {
        id: '8',
        type: 'TUT',
        name: 'Live demo code from Part 1 of the course ',
        start: '2013-02-22',
        end: '2013-03-06',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }, {
        id: '18',
        type: 'TUT',
        name: 'Heaps and AVL trees',
        start: '2013-03-10',
        end: '2013-03-17',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }, {
        id: '17',
        type: 'TUT',
        name: 'Tutorial 3 - Trees and BSTs',
        start: '2013-03-03',
        end: '2013-03-10',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }, {
        id: '19',
        type: 'OT',
        name: 'Exercise 19',
        start: '2013-03-12',
        end: '2013-03-17',
        spec: 'SPEC',
        givens: 'GIVENS',
        notes: 'NOTES'
      }
    ];
  };

  $(function() {
    var container, intervals, spine, structure, testEnd, testStart, tmp, _ref;
    _ref = ['2013-01-07', '2013-03-27'], testStart = _ref[0], testEnd = _ref[1];
    structure = {
      title: ['id', 'type'],
      extendedTitle: [],
      content: ['spec', 'givens', 'notes']
    };
    container = createTimelineContainer($('#container'));
    setContainerData(container, parseDate(testStart), parseDate(testEnd), 3, structure);
    intervals = produceIntervals(testStart, testEnd, 'day');
    drawInMarkers((spine = drawTimelineSpine(container)), intervals);
    drawTimelineOriginCircle(spine);
    tmp = function() {
      return runTests(container, spine);
    };
    return tmp();
  });

}).call(this);
