// Generated by CoffeeScript 1.6.2
(function() {
  var SETTINGS, animate_moments, create_interval_markers, create_moments, create_spine, default_settings, draw_end_wires, layer_moment_tooltips, make_circle, month_num_to_name, parse_date, produce_wire;

  SETTINGS = null;

  default_settings = function() {
    return SETTINGS = {
      container: null,
      spine: null,
      start_date: null,
      end_date: null,
      intervals: [],
      no_of_intervals: 0,
      structure: {},
      moments: [],
      pct_buffer_for_markers: 3,
      spine_buffer: 5,
      initial_heights: {
        up: [-14, -30, -38],
        down: [8, 10, 14]
      },
      date_to_marker_index: function(d) {
        return Math.floor((d - this.start_date) / (1000 * 60 * 60 * 24));
      },
      pct_per_interval: function() {
        return (100 - this.pct_buffer_for_markers) / (this.intervals.length - 1);
      },
      date_to_marker_left_pct: function(d) {
        return this.pct_buffer_for_markers + this.pct_per_interval() * (this.date_to_marker_index(parse_date(d)));
      }
    };
  };

  window.create_timeline = function(opt) {
    var jQuery_link, m, script;
    if (typeof $ === "undefined" || $ === null) {
      jQuery_link = 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
      script = document.createElement('script');
      script.setAttribute('src', jQuery_link);
      document.body.appendChild(script);
      console.log('Adding jQuery');
    }
    default_settings();
    if (!(opt.destination != null)) {
      console.log('You are missing either destination or timeline start/end dates.');
    } else if (!((opt.start_date != null) && (opt.end_date != null)) && (opt.moments[0] == null)) {
      console.log('Cannot determine start and end with no moments');
    } else {
      if (opt.start_date == null) {
        SETTINGS.start_date = new Date((Math.min.apply(Math, (function() {
          var _i, _len, _ref, _results;
          _ref = opt.moments;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            m = _ref[_i];
            _results.push(parse_date(m.start));
          }
          return _results;
        })())) - 3 * 1000 * 60 * 60 * 24);
      } else {
        SETTINGS.start_date = opt.start_date;
      }
      if (opt.end_date == null) {
        SETTINGS.end_date = new Date((Math.max.apply(Math, (function() {
          var _i, _len, _ref, _results;
          _ref = opt.moments;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            m = _ref[_i];
            _results.push(parse_date(m.end));
          }
          return _results;
        })())) + 3 * 1000 * 60 * 60 * 24);
      } else {
        SETTINGS.end_date = opt.end_date;
      }
      create_interval_markers((SETTINGS.spine = create_spine(opt.destination, SETTINGS)));
      SETTINGS.spine.data('settings', SETTINGS);
      if (opt.moments[0] != null) {
        if (!opt.structure) {
          console.log('Structure required for building moments');
        } else {
          SETTINGS.structure = opt.structure;
          opt.moments.map(function(m) {
            var _ref;
            return _ref = [parse_date(m.start), parse_date(m.end)], m.start = _ref[0], m.end = _ref[1], _ref;
          });
          SETTINGS.moments = opt.moments.sort(function(a, b) {
            return a.start - b.start;
          });
          create_moments(SETTINGS.spine);
        }
      }
    }
    return SETTINGS.container;
  };

  create_spine = function(destination, SETTINGS) {
    var draw_origin_circle, id, spine_left;
    draw_origin_circle = function() {
      var circle;
      circle = make_circle(15, 'black').css('left', 0).hide();
      circle.hover(function() {
        return circle.css('background-color', 'blue');
      }, function() {
        return circle.css('background-color', 'black');
      }).data('clicked', true).click(function() {
        var clicked, m, _i, _len, _ref;
        clicked = circle.data('clicked');
        _ref = $(this).parent().data('settings').moments;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          m = _ref[_i];
          m.is_expanded = clicked;
        }
        circle.data('clicked', !clicked);
        return layer_moment_tooltips($(this).parent());
      });
      return circle;
    };
    spine_left = SETTINGS.spine_buffer;
    id = "timeline" + ($('.timeline_container').length);
    SETTINGS.container = $("<div/ id='" + id + "' class='timeline_container'>").appendTo(destination);
    return SETTINGS.spine = $('<div/ class="spine">').appendTo(SETTINGS.container).css({
      left: spine_left + '%',
      width: 97 - spine_left + '%'
    }).append(draw_origin_circle().addClass('origin').delay(400).fadeIn(300).data('settings', SETTINGS));
  };

  create_interval_markers = function(spine) {
    var build_label, int_lbl, interval, intervals, left, produce_intervals, set_priority, _i, _len, _ref, _results;
    set_priority = function(interval) {
      if (interval.date === 1) {
        return interval.priority = 3;
      } else if (interval.day === 1) {
        return interval.priority = 2;
      } else {
        return interval.priority = 1;
      }
    };
    produce_intervals = function() {
      var end, interval, start, _i, _len, _ref, _ref1;
      _ref = [SETTINGS.start_date, SETTINGS.end_date].map(parse_date), start = _ref[0], end = _ref[1];
      while (start <= end) {
        SETTINGS.intervals.push({
          date: start.getDate(),
          day: start.getDay(),
          month: start.getMonth(),
          year: start.getFullYear(),
          js_date: new Date(start.getTime())
        });
        start.setDate(start.getDate() + 1);
      }
      _ref1 = SETTINGS.intervals;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        interval = _ref1[_i];
        set_priority(interval);
      }
      return SETTINGS.intervals;
    };
    build_label = function(interval) {
      return $('<div/ class="interval_label p' + interval.priority + '">').css({
        left: SETTINGS.date_to_marker_left_pct(interval.js_date) + '%'
      });
    };
    _ref = (intervals = produce_intervals());
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      interval = _ref[_i];
      left = SETTINGS.date_to_marker_left_pct(interval.js_date) + '%';
      $('<div/ class="interval_marker p' + interval.priority + '">').css('left', left).delay(800).fadeIn().appendTo(spine);
      int_lbl = build_label(interval);
      switch (interval.priority) {
        case 3:
          int_lbl.text(month_num_to_name(interval.month));
          break;
        case 2:
          int_lbl.text("Mon " + interval.date);
      }
      if (int_lbl.priority !== 1) {
        _results.push(int_lbl.appendTo(spine));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  create_moments = function(spine) {
    var create_moment_tooltips, create_start_end_markers, i, infos, last_index, m, produce_duration_wire, produce_start_wire, _i, _len, _ref;
    create_start_end_markers = function(m) {
      var cols, e_lft, s_lft, _ref;
      _ref = [SETTINGS.date_to_marker_left_pct(m.start) + '%', SETTINGS.date_to_marker_left_pct(m.end) + '%'], s_lft = _ref[0], e_lft = _ref[1];
      cols = ['#47ACCA', '#E0524E'];
      m.start_marker = make_circle(7, cols[0]).addClass('start').css('left', s_lft);
      m.end_marker = make_circle(7, cols[1]).addClass('end').css('left', e_lft).hide();
      return spine.append(m.start_marker, m.end_marker);
    };
    create_moment_tooltips = function(m) {
      var add_moment_functionality, create_info_box, css_values, produce_collapsed_elem, produce_expanded_elem;
      produce_collapsed_elem = function(m, callback) {
        var key, text, _i, _len, _ref;
        text = '';
        _ref = SETTINGS.structure.title;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          text += m[key] + ':';
        }
        m.collapsed = {};
        m.collapsed.elem = $('<div/ class="info_elem collapsed">').text(text.slice(0, -1));
        return callback(m);
      };
      produce_expanded_elem = function(m) {
        var expanded, href, i, key, keys, link, names, text, _i, _j, _len, _len1, _ref;
        expanded = $('<div/ class="info_elem expanded">');
        text = m.collapsed.elem.text();
        if (Math.max.apply(Math, ((function() {
          var _i, _len, _ref, _results;
          _ref = SETTINGS.structure.extendedTitle;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            _results.push(m[key].slice(0).replace(/\s/g, '').length);
          }
          return _results;
        })())) !== 0) {
          text += ' - ';
          _ref = SETTINGS.structure.extendedTitle;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            text += m[key] + ', ';
          }
          text = text.slice(0, -2);
        }
        m.collapsed.elem.clone().addClass('expanded').css('display', 'block').text(text).appendTo(expanded);
        text = '';
        names = SETTINGS.structure.content.names;
        keys = SETTINGS.structure.content.keys;
        for (i = _j = 0, _len1 = keys.length; _j < _len1; i = ++_j) {
          key = keys[i];
          if (m[key] != null) {
            href = m[key];
            if (typeof m[key] !== 'string') {
              href = 'javascript:void(0)';
            }
            link = $('<a/ class="content_link">').attr({
              'href': href,
              key: key
            }).text(names[i]).appendTo(expanded);
            expanded.html(expanded.html() + ' / ');
          }
        }
        if (expanded.html().slice(-3) === ' / ') {
          expanded.html(expanded.html().slice(0, -3));
        }
        expanded.find('a').each(function() {
          $(this).data('value', m[$(this).attr('key')]);
          switch (typeof $(this).data('value')) {
            case 'string':
              return $(this).bind('click', function(e) {
                return e.stopPropagation();
              });
            case 'object':
              return $(this).bind('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return $(this).data('value').trigger('click');
              });
          }
        });
        m.expanded = {};
        return m.expanded.elem = expanded;
      };
      css_values = function(elem, info_box) {
        var h, w, _ref;
        info_box.append(elem);
        _ref = [info_box.width(), info_box.height()], w = _ref[0], h = _ref[1];
        elem.hide();
        return {
          w: w,
          h: h
        };
      };
      create_info_box = function(m) {
        var c, e, hover_off, hover_on, i, _ref, _ref1;
        m.info_box = $('<div/ class="info_box">').appendTo(SETTINGS.spine);
        m.spine = SETTINGS.spine;
        _ref = [m.expanded.elem, m.collapsed.elem, m.info_box], e = _ref[0], c = _ref[1], i = _ref[2];
        _ref1 = [css_values(c, i), css_values(e, i)], m.collapsed.css = _ref1[0], m.expanded.css = _ref1[1];
        c.show();
        hover_on = function() {
          m.end_marker.fadeIn(300);
          return m.duration_wire.animate({
            width: m.duration_wire.data('w')
          }, {
            duration: 300
          });
        };
        hover_off = function() {
          m.end_marker.fadeOut(300);
          return m.duration_wire.animate({
            width: 0
          }, {
            duration: 300
          });
        };
        return i.css({
          width: i.width(),
          height: i.height(),
          marginLeft: -i.width() / 2,
          left: SETTINGS.date_to_marker_left_pct(m.start) + '%'
        }).click(function(e) {
          m.is_expanded = !m.is_expanded;
          return layer_moment_tooltips(m.spine);
        }).hover(hover_on, hover_off);
      };
      add_moment_functionality = function(m, spine) {
        m.bottom = function() {
          return this.goal_top + this.get_projected_css().ih_px;
        };
        m.get_projected_css = function() {
          var c, i, ih, iml, iw, left, leftmost, ml_pct, rightmost, spine_width, width_pct, _ref;
          i = (c = this.collapsed);
          if (this.is_expanded) {
            i = this.expanded;
          }
          _ref = [i.css.w, i.css.h, -c.css.w / 2], iw = _ref[0], ih = _ref[1], iml = _ref[2];
          spine_width = parseFloat(this.spine.width());
          ml_pct = 100 * iml / spine_width;
          leftmost = ml_pct + (left = this.spine.data('settings').date_to_marker_left_pct(this.start));
          rightmost = leftmost + (width_pct = 100 * iw / spine_width);
          return {
            l: left,
            iml: iml,
            ih_px: ih,
            ilm: leftmost,
            irm: rightmost,
            iw_pct: width_pct,
            iw_px: iw
          };
        };
        m.remove_end_wires = function() {
          var _ref;
          [m.vertical_end_wire.remove(), m.horizontal_end_wire.remove()];
          return _ref = [null, null], m.vertical_end_wire = _ref[0], m.horizontal_end_wire = _ref[1], _ref;
        };
        m.set_initial_top = function() {
          var css, hs, i, left_index, priority, right_index, top;
          css = this.get_projected_css();
          left_index = Math.floor(((css.ilm - SETTINGS.pct_buffer_for_markers) / SETTINGS.pct_per_interval()) - 1);
          right_index = Math.floor(((css.irm - SETTINGS.pct_buffer_for_markers) / SETTINGS.pct_per_interval()) + 2);
          priority = Math.max.apply(Math, (function() {
            var _i, _len, _ref, _results;
            _ref = SETTINGS.intervals.slice(left_index, +right_index + 1 || 9e9);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              i = _ref[_i];
              _results.push(i.priority);
            }
            return _results;
          })());
          top = (hs = SETTINGS.initial_heights).down[priority - 1];
          if (this.is_up) {
            top = hs.up[priority - 1] - css.ih_px;
          }
          return m.goal_top = top;
        };
        return m.clash_with = function(m) {
          var h, horizontal, them, us, v, vertical, _ref, _ref1, _ref2;
          vertical = function(us, them) {
            return !((us.t > them.b - 3) || (them.t + 3 > us.b));
          };
          horizontal = function(us, them) {
            return !((us.irm < them.ilm) || (them.irm < us.ilm));
          };
          _ref = [this.get_projected_css(), m.get_projected_css()], us = _ref[0], them = _ref[1];
          _ref1 = [this.goal_top, this.bottom(), m.goal_top, m.bottom()], us.t = _ref1[0], us.b = _ref1[1], them.t = _ref1[2], them.b = _ref1[3];
          _ref2 = [vertical(us, them), horizontal(us, them)], v = _ref2[0], h = _ref2[1];
          return v && h;
        };
      };
      produce_collapsed_elem(m, produce_expanded_elem);
      create_info_box(m);
      return add_moment_functionality(m, SETTINGS.spine);
    };
    produce_start_wire = function(m) {
      var h, t;
      h = Math.abs((m.goal_top + m.bottom()) / 2);
      t = (m.is_up ? -h : 0);
      return m.start_wire = produce_wire(m, m.start).addClass('vertical start').delay(800).animate({
        height: h,
        top: t
      }, {
        duration: 300
      });
    };
    produce_duration_wire = function(m) {
      var w;
      w = SETTINGS.date_to_marker_left_pct(m.end) - SETTINGS.date_to_marker_left_pct(m.start) + '%';
      return m.duration_wire = produce_wire(m, m.start).addClass('horizontal duration').data('w', w);
    };
    _ref = SETTINGS.moments;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      m = _ref[i];
      create_start_end_markers(m);
      m.is_up = i % 2 === 0;
      create_moment_tooltips(m);
      [m.set_initial_top(), m.info_box.css('top', m.goal_top)];
      produce_start_wire(m);
      produce_duration_wire(m);
    }
    last_index = (infos = $('.info_box')).length - 1;
    return layer_moment_tooltips(spine);
  };

  layer_moment_tooltips = function(spine) {
    var comp, downs, m, ms, place, place_moments, ups, _i, _len, _ref;
    SETTINGS = spine.data('settings');
    place = function(m, fixed, m_css) {
      var adjust_height, clashed, cm;
      adjust_height = function(m, cm) {
        m_css = m.get_projected_css();
        if (m.is_up) {
          return m.goal_top = cm.goal_top - m_css.ih_px - 10;
        } else {
          return m.goal_top = cm.bottom() + 10;
        }
      };
      clashed = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = fixed.length; _i < _len; _i++) {
          cm = fixed[_i];
          if (cm.clash_with(m)) {
            _results.push(cm);
          }
        }
        return _results;
      })();
      if (clashed.length !== 0) {
        adjust_height(m, clashed[0]);
        return place(m, fixed);
      } else {
        return m.fixed = true;
      }
    };
    place_moments = function(moments) {
      var fixed, fm, m, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = moments.length; _i < _len; _i++) {
        m = moments[_i];
        fixed = (function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = moments.length; _j < _len1; _j++) {
            fm = moments[_j];
            if (fm.fixed && m !== fm) {
              _results1.push(fm);
            }
          }
          return _results1;
        })();
        _results.push(place(m, fixed, m.get_projected_css()));
      }
      return _results;
    };
    ms = spine.data('settings').moments.slice(0);
    _ref = [[], []], ups = _ref[0], downs = _ref[1];
    for (_i = 0, _len = ms.length; _i < _len; _i++) {
      m = ms[_i];
      [m.set_initial_top(), m.fixed = false];
      (m.is_up ? ups : downs).push(m);
    }
    comp = function(a, b) {
      if (a.is_expanded === b.is_expanded) {
        return a.start - b.start;
      } else if (a.is_expanded) {
        return 1;
      } else {
        return -1;
      }
    };
    [ups.sort(comp), downs.sort(comp)].map(place_moments);
    return animate_moments(SETTINGS.moments, SETTINGS.spine, SETTINGS.spine.parent());
  };

  draw_end_wires = function(m, vh) {
    var animate_vertical, vt, w;
    if (m.is_expanded && (m.horizontal_end_wire == null)) {
      vt = (m.is_up ? vh : 2);
      w = SETTINGS.date_to_marker_left_pct(m.end) - SETTINGS.date_to_marker_left_pct(m.start) + '%';
      m.vertical_end_wire = produce_wire(m, m.end).addClass('vertical end').css('top', vh);
      animate_vertical = function() {
        return m.vertical_end_wire.animate({
          height: Math.abs(vh),
          top: vt
        }, {
          duration: 300
        });
      };
      return m.horizontal_end_wire = produce_wire(m, m.start).delay(300).addClass('horizontal end').css('top', vh).animate({
        width: w
      }, {
        duration: 300,
        complete: function() {
          return animate_vertical();
        }
      });
    }
  };

  animate_moments = function(ms, spine, container) {
    var b, bottom_room, c, css, e, h, height, i, m, t, vh, vt, _i, _len, _ref, _ref1, _ref2, _ref3;
    for (_i = 0, _len = ms.length; _i < _len; _i++) {
      m = ms[_i];
      _ref = [m.expanded.elem, m.collapsed.elem, m.info_box, null], e = _ref[0], c = _ref[1], i = _ref[2], css = _ref[3];
      if (!((_ref1 = m.is_expanded) != null ? _ref1 : m.is_expanded = false)) {
        [e.hide(), c.show(), css = m.collapsed.css];
      } else {
        [c.hide(), e.show(), css = m.expanded.css];
      }
      i.animate({
        top: m.goal_top,
        width: css.w,
        height: css.h
      }, {
        duration: 300
      });
      h = (m.goal_top + m.bottom()) / 2;
      _ref2 = (m.is_up ? [h, Math.abs(h)] : [2, Math.abs(h)]), vt = _ref2[0], vh = _ref2[1];
      m.start_wire.animate({
        height: vh,
        top: vt
      }, {
        duration: 300
      });
      if ((m.horizontal_end_wire != null) && m.is_expanded) {
        m.horizontal_end_wire.animate({
          top: h
        }, {
          duration: 300
        });
        m.vertical_end_wire.animate({
          top: vt,
          height: vh
        }, {
          duration: 300
        });
      } else if (m.is_expanded) {
        draw_end_wires(m, h);
      } else if (m.horizontal_end_wire != null) {
        m.remove_end_wires();
      }
    }
    _ref3 = [
      Math.min.apply(Math, (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = ms.length; _j < _len1; _j++) {
          m = ms[_j];
          _results.push(m.goal_top);
        }
        return _results;
      })()), Math.max.apply(Math, (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = ms.length; _j < _len1; _j++) {
          m = ms[_j];
          _results.push(m.bottom());
        }
        return _results;
      })())
    ], t = _ref3[0], b = _ref3[1];
    if (b < 0) {
      b = 0;
    }
    b += 25;
    height = container.height();
    bottom_room = height - parseFloat(spine.css('top'));
    if (1.1 * (b - t) > height) {
      height = 1.1 * (b - t);
      container.animate({
        height: height
      }, {
        duration: 300
      });
    } else {
      container.animate({
        height: 1.1 * (b - t)
      }, {
        duration: 300
      });
    }
    return spine.animate({
      top: 100 * Math.abs(t) / (Math.abs(b) - t) + '%'
    }, {
      duration: 300
    });
  };

  parse_date = function(input) {
    var parts;
    if (input.getDate != null) {
      return new Date(input.getTime());
    }
    parts = input.match(/(\d+)/g);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  month_num_to_name = function(m) {
    return "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Aug,Nov,Dec".split(',')[m];
  };

  make_circle = function(r, c, shadow) {
    var circle, s;
    if (shadow == null) {
      shadow = true;
    }
    s = '0 0 1px black';
    circle = $('<div/ class="circle">').css({
      background: c,
      height: r,
      width: r,
      '-moz-border-radius': r,
      '-webkit-border-radius': r,
      marginTop: -r / 2,
      marginLeft: -r / 2
    });
    if (shadow) {
      circle.css({
        '-webkit-box-shadow': s,
        '-moz-box-shadow': s,
        'box-shadow': s
      });
    }
    return circle;
  };

  produce_wire = function(m, d) {
    var l;
    l = SETTINGS.date_to_marker_left_pct(d);
    return $('<div/ class="wire">').appendTo(SETTINGS.spine).css('left', l + '%');
  };

}).call(this);
