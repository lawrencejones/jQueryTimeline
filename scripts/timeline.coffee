#//////////////////////////////////////////////////////////////////////////////
#///////////////////////// jQuery Timeline Plugin /////////////////////////////
#
# AUTHOR - Lawrence Jones
# VERSION - 1.1.1 / GITHUB - http://www.github.com/LawrenceJones/jQueryTimeline
#
# DESCRIPTION - A simple timeline plugin that allows a variety of different
#               information to be processed and displayed on the timeline. There
#               is a strong emphasis on event start and termination.
# 
# LICENSE - This work is licensed under Creative Commons Attribution-ShareAlike 
#           3.0 Unported License. To view a copy of this license, visit 
#           http://creativecommons.org/licenses/by-sa/3.0/. 
#
#/////////////// © 2013 Lawrence Jones All Rights Reserved ////////////////////

#//////////////////////////////////////////////////////////////////////////////
# DEFINE THE SETTINGS OBJECT
#//////////////////////////////////////////////////////////////////////////////
# It's worth noting that all percentages are returned as floating point. Any
# use of the return as a setting will require % appended to the result.

SETTINGS = null

default_settings = ->
  $.fx.interval = 8  # increases animation speed
  SETTINGS = {  # All lefts are percentages
    container : null, spine : null
    start_date : null, end_date : null
    intervals : [], no_of_intervals : 0
    clash_sensitivity : {h : 5, v : 6}  # the amount of pixels clash detection
    structure : {}, moments : []        # extends out from the info box
    pct_buffer_for_markers : 3, spine_buffer : 5
    initial_heights :
        up   : [ -18, -34, -42, -44]
        down : [  12,  14,  18,  20]

    # Return the marker index of the given date
    date_to_marker_index : (d) ->
      Math.floor (d-@start_date)/(1000*60*60*24)

    # Return the percentage increment between each interval
    pct_per_interval : -> 
      (100 - @pct_buffer_for_markers) / (@intervals.length - 1)

    # Return the left percentage (as float) of the given date
    date_to_marker_left_pct : (d) ->
      (@pct_buffer_for_markers + @pct_per_interval()*
        (@date_to_marker_index parse_date(d)))
  }

# Expose the createTimeline function to the window object, allowing access from
# external scripts. From this function, process the creation of the timeline
# using the given user options.
window.create_timeline = (opt) ->
  if not $? 
    jQuery_link = 'http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js'
    #jQuery_link = './jQuery.min.js' # Testing only
    script = document.createElement('script')
    script.setAttribute('src',jQuery_link)
    document.body.appendChild(script)
    console.log 'Adding jQuery'
  default_settings()
  if not  (opt.destination?)
    console.log 'You are missing either destination or timeline start/end dates.'
  else if not (opt.start_date? and opt.end_date?) and not opt.moments[0]?
    console.log 'Cannot determine start and end with no moments'
  else
    if not opt.start_date?
      SETTINGS.start_date = 
        new Date (Math.min (parse_date(m.start) for m in opt.moments)...) - 3*1000*60*60*24
    else SETTINGS.start_date = opt.start_date
    if not opt.end_date?
      SETTINGS.end_date = 
        new Date (Math.max (parse_date(m.end) for m in opt.moments)...) + 3*1000*60*60*24
    else SETTINGS.end_date = opt.end_date
    
    create_interval_markers (SETTINGS.spine = create_spine opt.destination, SETTINGS)
    SETTINGS.spine.data('settings',SETTINGS)

    if opt.moments[0]?
      if not opt.structure then console.log 'Structure required for building moments'
      else
        SETTINGS.structure = opt.structure
        opt.moments.map (m) ->  # Convert all dates to js format
          [m.start, m.end] = [parse_date(m.start), parse_date(m.end)]
        SETTINGS.moments = opt.moments.sort (a,b) -> a.start - b.start
        create_moments SETTINGS.spine
  return SETTINGS.container

create_spine = (destination, SETTINGS) ->

  draw_origin_circle = ->
    circle = make_circle(15, 'black').css('left', 0).hide()
    circle.hover(
      -> circle.css('background-color', 'blue')
      ,
      -> circle.css('background-color', 'black'))
    .data('clicked',true)
    .click ->
      clicked = circle.data('clicked')
      m.is_expanded = clicked for m in $(this).parent().data('settings').moments
      circle.data('clicked',!clicked)
      layer_moment_tooltips($(this).parent())
    return circle

  spine_left = SETTINGS.spine_buffer
  id = "timeline#{$('.timeline_container').length}"
  SETTINGS.container = $("<div/ id='#{id}' class='timeline_container'>")
    .appendTo destination
  SETTINGS.spine = $('<div/ class="spine">').appendTo(SETTINGS.container)
    .css({left : spine_left + '%', width : 97 - spine_left + '%'})
    .append draw_origin_circle().addClass('origin').delay(400).fadeIn(300)
    .data 'settings', SETTINGS


create_interval_markers = (spine) ->

  set_priority = (interval) ->
    console.log 
    if 0 <= (today.getTime() - interval.js_date.getTime())/24/60/60 < 1000
      interval.priority = 4
    else if interval.date == 1 then interval.priority = 3
    else if interval.day == 1 then interval.priority = 2
    else interval.priority = 1

  produce_intervals = ->
    # Make copies of the dates to prevent mutation
    [start, end] = [SETTINGS.start_date, SETTINGS.end_date].map parse_date
    #start and end are now date type
    while start <= end
      SETTINGS.intervals.push 
        date    : start.getDate()
        day     : start.getDay()
        month   : start.getMonth()
        year    : start.getFullYear()
        js_date : new Date(start.getTime())
        #toString : -> @date + '/' + @month + '/' + @year + ' day is ' + @day
      start.setDate (start.getDate() + 1) # increment start

    set_priority(interval) for interval in SETTINGS.intervals
    return SETTINGS.intervals

  build_label = (interval) ->
    $('<div/ class="interval_label p' + interval.priority + '">')
      .css {left:SETTINGS.date_to_marker_left_pct(interval.js_date) + '%'}

  today = new Date()
  for interval in (intervals = produce_intervals())
    left = SETTINGS.date_to_marker_left_pct(interval.js_date) + '%'
    $('<div/ class="interval_marker p' + interval.priority + '">')
      .css('left',left)
      .delay(800).fadeIn()
      .appendTo spine
    int_lbl = build_label interval
    switch interval.priority
      when 4 then int_lbl.text 'Now'
      when 3 then int_lbl.text month_num_to_name interval.month
      when 2 then int_lbl.text "Mon #{interval.date}"
    if int_lbl.priority != 1 then int_lbl.appendTo spine

create_moments = (spine) ->

  create_start_end_markers = (m) ->
    [s_lft, e_lft] = [
      SETTINGS.date_to_marker_left_pct(m.start) + '%', 
      SETTINGS.date_to_marker_left_pct(m.end) + '%'
    ]
    cols = ['#47ACCA', '#E0524E']  # Dot colors
    m.start_marker = make_circle(7, cols[0]).addClass('start')
      .css('left',s_lft)
    m.end_marker = make_circle(7, cols[1]).addClass('end')
      .css('left',e_lft).hide()   # Hide end dot
    spine.append m.start_marker, m.end_marker

  create_moment_tooltips = (m) ->

    produce_collapsed_elem = (m, callback) ->
      text = ''
      text += m[key] + ':' for key in SETTINGS.structure.title
      m.collapsed = {}
      m.collapsed.elem = $('<div/ class="info_elem collapsed">')
        .text(text[0..-2])
      callback m

    produce_expanded_elem = (m) ->
      expanded = $('<div/ class="info_elem expanded">')
      text = m.collapsed.elem.text() 
      if Math.max((m[key][..].replace(/\s/g, '').length \
       for key in SETTINGS.structure.extendedTitle)...) != 0
        text += ' - '
        text += m[key] + ', ' for key in SETTINGS.structure.extendedTitle
        text = text[0..-3]
      m.collapsed.elem.clone().addClass('expanded').css('display','block')
        .text(text).appendTo expanded
      text = ''
      names = SETTINGS.structure.content.names
      keys = SETTINGS.structure.content.keys
      for key,i in keys
        if m[key]?
          href = m[key]
          if typeof m[key] != 'string'
            href = 'javascript:void(0)'
          link = $('<a/ class="content_link">')
            .attr({'href':href, key:key})
            .text(names[i])
            .appendTo(expanded)
          expanded.html(expanded.html() + ' / ')
      expanded.html(expanded.html()[0..-4]) if expanded.html()[-3..] == ' / '
      expanded.find('a').each ->
        $(this).data('value', m[$(this).attr('key')])
        switch typeof $(this).data('value')
          when 'string'
            $(this).bind 'click', (e) -> e.stopPropagation()
          when 'object'
            $(this).bind 'click', (e) ->
              e.preventDefault()
              e.stopPropagation()
              $(this).data('value').trigger('click')
      
      m.expanded = {}
      m.expanded.elem = expanded

    css_values = (elem, info_box) ->
      info_box.append elem
      [w, h] = [info_box.width(), info_box.height()]
      elem.hide()
      return {w : w, h : h}

    create_info_box = (m) ->
      # Create the info box to contain them, and append it to the spine
      m.info_box = $('<div/ class="info_box">').appendTo(SETTINGS.spine)
      m.spine = SETTINGS.spine
      # Create shorthand for a temporary use
      [e,c,i] = [m.expanded.elem, m.collapsed.elem, m.info_box]
      # Save the css values of height and width for the different views
      [m.collapsed.css, m.expanded.css] = [css_values(c, i), css_values(e, i)]
      c.show() 
      hover_on = ->
        m.end_marker.fadeIn(300)
        m.duration_wire.animate {width : m.duration_wire.data('w')}, {duration : 300}
      hover_off = ->
        m.end_marker.fadeOut(300)
        m.duration_wire.animate {width : 0}, {duration : 300}
      i.css
        width : i.width(), height : i.height(), marginLeft : -i.width()/2
        left : SETTINGS.date_to_marker_left_pct(m.start) + '%'
      .click (e) ->
        m.is_expanded = !m.is_expanded
        layer_moment_tooltips(m.spine) 
      .hover hover_on, hover_off

    add_moment_functionality = (m,spine) ->
      m.bottom = -> @goal_top + @get_projected_css().ih_px

      m.get_projected_css = ->
        i = (c = @collapsed)
        i = @expanded if @is_expanded
        [iw,ih,iml] = [i.css.w, i.css.h, -c.css.w/2]
        spine_width = parseFloat @spine.width()
        ml_pct = 100*iml/spine_width  # Get left pct of leftmost edge, should be neg
        leftmost = ml_pct + (left = @spine.data('settings').date_to_marker_left_pct(@start))
        rightmost = leftmost + (width_pct = (100*iw/spine_width))
        return {
          l : left, iml : iml, ih_px : ih
          ilm : leftmost, irm : rightmost
          iw_pct : width_pct, iw_px : iw
        }

      m.remove_end_wires = ->
        [m.vertical_end_wire.remove(), m.horizontal_end_wire.remove()]
        [m.vertical_end_wire, m.horizontal_end_wire] = [null,null]

      m.set_initial_top = ->
        css = @get_projected_css()
        left_index = Math.floor ((css.ilm - 
          SETTINGS.pct_buffer_for_markers) / SETTINGS.pct_per_interval()) - 1
        right_index = Math.floor ((css.irm - 
          SETTINGS.pct_buffer_for_markers) / SETTINGS.pct_per_interval()) + 2
        priority = Math.max (i.priority for i in SETTINGS.intervals[left_index..right_index])...
        top = (hs = SETTINGS.initial_heights).down[priority - 1]
        top = (hs.up[priority - 1] - css.ih_px) if @is_up
        m.goal_top = top

      m.clash_with = (m) ->
        sens = SETTINGS.clash_sensitivity
        vertical = (us, them) -> !((us.t > them.b-sens.v) or (them.t + sens.v > us.b))
        horizontal = (us, them) -> !((us.irm < them.ilm - sens.h) or (them.irm < us.ilm - sens.h))
        [us, them] = [@get_projected_css(), m.get_projected_css()]
        [us.t, us.b, them.t, them.b] = [@goal_top, @bottom(), m.goal_top, m.bottom()]
        [v, h] = [vertical(us, them), horizontal(us,them)]
        return v && h
        
    # Create the title/content elements
    produce_collapsed_elem m, produce_expanded_elem
    create_info_box m
    add_moment_functionality m, SETTINGS.spine

  produce_start_wire = (m) ->
    h = Math.abs((m.goal_top + m.bottom())/2)
    t = (if m.is_up then -h else 0)
    m.start_wire = produce_wire(m,m.start)
      .addClass('vertical start')
      .delay(800)
      .animate {height : h, top : t}, {duration : 300}

  produce_duration_wire = (m) ->
    w = SETTINGS.date_to_marker_left_pct(m.end) -
        SETTINGS.date_to_marker_left_pct(m.start) + '%'
    m.duration_wire = produce_wire(m,m.start)
      .addClass('horizontal duration').data('w',w)
      
  for m,i in SETTINGS.moments
    create_start_end_markers m
    m.is_up = (i%2 == 0)  # Set default up or down
    create_moment_tooltips m
    [m.set_initial_top(), m.info_box.css('top',m.goal_top)]
    produce_start_wire m
    produce_duration_wire m
  last_index = (infos = $('.info_box')).length - 1
  # On the completion of the fade, apply layering
  layer_moment_tooltips(spine)

layer_moment_tooltips = (spine) ->

  SETTINGS = spine.data('settings')

  place = (m,fixed,m_css) ->

    adjust_height = (m, cm) ->
      m_css = m.get_projected_css()
      if m.is_up then m.goal_top = cm.goal_top - m_css.ih_px - 10
      else m.goal_top = cm.bottom() + 10

    clashed = (cm for cm in fixed when cm.clash_with m)
    if clashed.length != 0
      adjust_height m, clashed[0]
      place m, fixed
    else m.fixed = true
  
  place_moments = (moments) ->
    for m in moments
      fixed = (fm for fm in moments when fm.fixed and m != fm)
      place m, fixed, m.get_projected_css()

  ms = spine.data('settings').moments[..]
  [ups, downs] = [[],[]]
  for m in ms
    [m.set_initial_top(), m.fixed = false]
    (if m.is_up then ups else downs).push m
  comp = (a,b) ->
    if a.is_expanded == b.is_expanded then a.start - b.start
    else if a.is_expanded then 1 else -1
  [ups.sort(comp), downs.sort(comp)].map place_moments
  animate_moments(SETTINGS.moments, SETTINGS.spine, SETTINGS.spine.parent())

draw_end_wires = (m,vh) ->
  if m.is_expanded and not m.horizontal_end_wire?
    vt = (if m.is_up then vh else 2)
    w = SETTINGS.date_to_marker_left_pct(m.end) -
        SETTINGS.date_to_marker_left_pct(m.start) + '%'
    m.vertical_end_wire = produce_wire(m,m.end)
      .addClass('vertical end').css('top',vh)
    animate_vertical = ->
      m.vertical_end_wire.animate {
        height : Math.abs(vh), top : vt
      }, {duration : 300}
    m.horizontal_end_wire = produce_wire(m,m.start)
      .delay(300)
      .addClass('horizontal end').css('top',vh)
      .animate {width : w}, {duration : 300, complete : -> animate_vertical()}

animate_moments = (ms, spine, container) ->
  for m in ms
    [e,c,i,css] = [m.expanded.elem, m.collapsed.elem, m.info_box, null]
    if !(m.is_expanded ?= false)  
      [e.hide(), c.show(), css = m.collapsed.css]
    else [c.hide(), e.show(), css = m.expanded.css]
    i.animate {
      top : m.goal_top, width : css.w, height : css.h
    }, {duration : 300}
    h = (m.goal_top + m.bottom())/2
    [vt,vh] = (if m.is_up then [h,Math.abs(h)] else [2,Math.abs(h)])
    m.start_wire.animate {height : vh, top : vt}, {duration : 300}
    if m.horizontal_end_wire? and m.is_expanded  # Then lines already present
      m.horizontal_end_wire.animate {top : h}, {duration : 300}
      m.vertical_end_wire.animate {top : vt, height : vh}, {duration : 300}
    else if m.is_expanded then draw_end_wires(m,h) 
    else if m.horizontal_end_wire? then m.remove_end_wires()
  [t, b] = [Math.min(((m.goal_top) for m in ms)...), Math.max (m.bottom() for m in ms)... ]
  if b < 0 then b = 0
  b += 25
  height = container.height()
  bottom_room = height - parseFloat spine.css('top')
  if (1.1*(b-t) > height)
    height = 1.1*(b-t)
    container.animate {height : height}, {duration : 300}
  else
    container.animate {height : 1.1*(b-t)}, {duration : 300}
  spine.animate {top : 100*Math.abs(t)/(Math.abs(b)-t) + '%'}, {duration : 300}

parse_date = (input) ->
  if input.getDate? then return new Date(input.getTime())
  parts = input.match(/(\d+)/g)
  new Date(parts[0], parts[1] - 1, parts[2])

# Given a month index, return the months name
month_num_to_name = (m) ->
  "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Aug,Nov,Dec".split(',')[m]

make_circle = (r, c, shadow) ->
  shadow ?= true   # Default to true
  s = '0 0 1px black'
  circle = $('<div/ class="circle">').css
      background : c, height : r, width : r
      borderRadius : r
      '-moz-border-radius' : r, '-webkit-border-radius' : r
      marginTop : -r/2, marginLeft : -r/2
  if shadow then circle.css
      '-webkit-box-shadow': s, '-moz-box-shadow': s, 'box-shadow' : s
  return circle

produce_wire = (m,d) ->
  l = SETTINGS.date_to_marker_left_pct d
  $('<div/ class="wire">')
    .appendTo(SETTINGS.spine)
    .css('left', l + '%')

