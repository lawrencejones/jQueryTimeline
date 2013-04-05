#//////////////////////////////////////////////////////////////////////////////
#///////////////////////// jQuery Timeline Plugin /////////////////////////////
#
# AUTHOR - Lawrence Jones  / GITHUB - www.github.com/lmj112   /   VERSION - 1.0
#
# DESCRIPTION - A simple timeline plugin that allows a variety of different
#               information to be processed and displayed on the timeline. There
#       is a strong emphasis on event start and termination.
# 
# LICENSE - This work is licensed under Creative Commons Attribution-ShareAlike 
#           3.0 Unported License. To view a copy of this license, visit 
#           http://creativecommons.org/licenses/by-sa/3.0/. 
#
#/////////////// © 2011 Lawrence Jones All Rights Reserved ////////////////////

#//////////////////////////////////////////////////////////////////////////////
# CREATION - USER FUNCTIONS
#//////////////////////////////////////////////////////////////////////////////

CONTAINER = null
SPINE = null
START_DATE = null  # Both in js date format
END_DATE = null
MOMENTS = []
UTILS =
  SPINEWidth : 100  #default
  dateToMarkerNo : (d) ->
    Math.floor (d-@startDate)/(1000*60*60*24)
  noOfIntervals : -> 
    1 + @dateToMarkerNo @endDate
  dateToMarkerLeft : (d) ->
    d = parseDate(d) if typeof d == "string"
    (@markerLeftBuffer + @pctPerInterval()*(@dateToMarkerNo d))+'%'
  pctPerInterval : ->
    (100 - @markerLeftBuffer) / (@intervals.length - 1)


#--------------- EXPOSED CREATION CALL, HOOKED ON WINDOW ----------------------
window.createTimeline = (args) ->
  # Set optional properties into the UTILS object
  UTILS.markerLeftBuffer = args.markerLeftBuffer ? 3
  UTILS.interval = args.interval ? 'day'
  UTILS.structure = args.structure ? {}
  UTILS.SPINELeftBuffer = args.SPINELeftBuffer ? 7
  #----------------------------------------------
  if not args.start? then console.log "No start date."
  else if not args.end? then console.log "No end date."
  else
    START_DATE = parseDate args.start
    END_DATE = parseDate args.end
  if not args.destination? then console.log "No jQuery destination element."
  else if not args.moments? then createEmptyTimeline args.destination
  else
    MOMENTS = args.moments[..] # Shallow copy to preserve outer order
    createTimelineWithMoments args.destination


#------------ CREATE TIMELINE AND ADD IN ALL GIVEN MOMENTS --------------------
# Run createEmptyTimeline with the first variables, then use the populate
# function to place the array of moments into the current timeline
createTimelineWithMoments = (destination) ->
  createEmptyTimeline destination   
  drawMomentsAtSPINE()    ##----
  bindExpandAllToOrigin SPINE.parent().data('originCircle'), moments, SPINE
  SPINE.parent()


#--------------- CREATE THE EMPTY TIMELINE INSIDE J_OBJ -----------------------
# Given start/end dates, important intervals ('day' | 'month'), the
# jQuery object into which to insert the timeline div and a structure
# for the moment details content, do it!
createEmptyTimeline = (destination) ->
  CONTAINER = createTimelineContainer destination # create the timeline in the jQO
  # create & draw a SPINE, then draw in the markers and circle
  UTILS.intervals = produceIntervals()
  SPINE = drawTimelineSPINE UTILS.intervals
  drawInMarkers()


#---------------------- CREATE AND PLACE ALL MOMENTS --------------------------
# With the given moment, insert that information into the (also given) 
# SPINE object
createMomentsAtSPINE = ->
  createMomentAtSPINE m for m in moments      # -------
  moments = assignMomentTopValues moments, SPINE
  m.lblContainer.delay(1700).fadeIn {
    duration : 600
    complete : -> m.animateStartWire() for m in moments
  } for m in moments


#----------------- DEAL WITH A SINGLE MOMENT PLACEMENT ------------------------
# With the given moment, insert it into the given SPINE
createMomentAtSPINE = (m) ->
  createAndPlaceMomentDots m      
  createAndPlaceMomentInfo m     # --------


#//////////////////////////////////////////////////////////////////////////////
# UTILITIES 
#//////////////////////////////////////////////////////////////////////////////


#------------ PRODUCE THE INTERVALS (IE, OBJECT ARRAY) ------------------------
#Given start/end dates and an interval type ('day' || 'month') produce
#an array of literals with assigned importance and relevant info
#For a day interval, month starts get value 3, week beginnings get 2
#and days 1, or whatever is the greatest score
produceIntervals = ->
  # Make copies of the dates to prevent mutation
  start = new Date(START_DATE)
  end = new Date(END_DATE)
  #start and end are now date type
  result = []
  while start <= end
    result.push 
      date  : start.getDate()
      day   : start.getDay()
      month : start.getMonth()
      year  : start.getFullYear()
      
      #toString : -> @date + '/' + @month + '/' + @year + ' day is ' + @day
    start.setDate (start.getDate() + 1) # increment start
  setPriority(interval) for interval in result
  result


#------------ SET THE PRIORITY OF A PARTICULAR INTERVAL -----------------------
#Given either a date type, string or object, find priority
setPriority = (interval) ->
    translation = {}
    if not interval['date']?
      if typeof interval == 'string' 
        interval = parseDate(interval)
      translation.day = interval.getDay()
      translation.date = interval.getDate()
      translation.month = interval.getMonth()
      interval = translation
    if interval.date == 1
      interval.priority = 3
    else if interval.day == 1
      interval.priority = 2
    else interval.priority = 1


#------------ FIRST RUN, ASSIGN DEFAULT VALUES FOR INFOS-----------------------
#Given all the moments, calculate their respective top values
#Run on start only
assignMomentTopValues = (moments,SPINE) ->
  # sort the moments array in place, via the start date value
  sortMoments(moments)
  # Create arrays to hold the top and bottom moments
  UTILS.ups = []
  UTILS.downs = []
  #Assign all moments a collapsed status
  m.isExpanded = false for m in moments
  # Process the moments into these arrays, storing an up 
  # value in each moment
  upDown = (m,i,ups,downs) ->
    m.up = (i%2 == 0)
    if (m.up) then ups.push(m) else downs.push(m)
  upDown(m,i,UTILS.ups,UTILS.downs) for m,i in moments

  # Ups and downs now hold their respective elements
  # Give each label the ability to calculate it's current furthest
  # leftpoint, rightpoint, it's current width, and a function that
  # states whether a given position intrudes on these
  # Assign each moment the pointer to the SPINE
  ((m) -> 
    m.lblWidth = -> parseFloat @_width
    m.lblHeight = -> @_height
    m.top = -> parseFloat @_top
    m._marginLeft ?= 16
    m.bottom = -> 
      parseFloat @top() + parseFloat @lblHeight()
    m.leftmost = ->
      @leftPctNum - @pctOffset() + '%'
    m.rightmost = ->
      (parseFloat(@leftmost()) + @pctWidth()) + '%'
    m.leftPctNum ?= parseFloat UTILS.dateToMarkerLeft(@start)
    m.pctWidth = ->
      100*@lblWidth()/(SPINE.data('widthPct')/100*SPINE.parent().width())
    m.pctOffset = ->
      leftOffset = parseFloat(@_marginLeft)  #_ml = 18
      widthOfSpinePct = (SPINE.data('widthPct')/100*SPINE.parent().width())
      100*(leftOffset/widthOfSpinePxs) #maybe 2.13...
    m.inVerticalRange = (m) ->
      #console.log('Test#1 : ' + @top() + ' ' + m.top() + ' ' + @bottom())
      (@top() <= m.top() <= @bottom() or
        @top() <= m.bottom() <= @bottom())
    m.inHorizontalRange = (m) -> 
      #console.log(parseFloat(@leftmost()) + ' ' + parseFloat(m.rightmost()) + ' ' + parseFloat(@rightmost()))      
      a = (parseFloat(@leftmost()) <= parseFloat(m.leftmost()) <= parseFloat(@rightmost()))
      b = (parseFloat(@leftmost()) <= parseFloat(m.rightmost()) <= parseFloat(@rightmost()))
      a or b
    m.clash = (m) -> 
      @inVerticalRange(m) and @inHorizontalRange(m)
  ) m for m in moments
  # Next step - process layer values of each label...
  adjustHeights()


#------------ LAYERING PROCESS, FIND CORRECT CSS FOR ALL INFO -----------------
# Given all the moments, run through, apply layering algorithm. Cross & hope.
adjustHeights = () -> 
  #console.log('Does moment 5 clash with 7? ' + moments[4].inHorizontalRange(moments[6]))
  ups = UTILS.ups
  downs = UTILS.downs
  #set all _ css to what they should be for the end of animation
  #should alter width, height and marginLeft properties
  for m in MOMENTS
    if m.isExpanded  
      m._marginLeft = m.expanded.marginLeft 
      m._width = m.expanded.width
      m._height = m.expanded.height
    else
      m._marginLeft = m.collapsed.marginLeft
      m._width = m.collapsed.width
      m._height = m.collapsed.height
  ## Assign moments their priority
  ((m) ->
    pointDate = parseDate m.start
    leftDaySpan = Math.floor((m.leftPctNum - parseFloat m.leftmost()) / 
      UTILS.pctPerInterval()) + 1
    rightDaySpan = Math.floor(((parseFloat m.rightmost()) - 
      m.leftPctNum) / UTILS.pctPerInterval()) + 1
    lowestDate = new Date(pointDate)
    lowestDate.setDate(pointDate.getDate() - leftDaySpan)
    pointDate.setDate(pointDate.getDate() + rightDaySpan)
    dates = []
    while lowestDate <= pointDate
      dates.push(setPriority lowestDate)
      lowestDate.setDate(lowestDate.getDate() + 1)
    m.priority = Math.max dates...
    #console.log('From ' + dates + ' we got ' + m.priority)
  ) m for m in MOMENTS
  ## Depending on priority and direction assign first top value
  ( (m) -> 
    _top = 0
    if m.up 
      switch m.priority
        when 3 then _top = -35
        when 2 then _top = -30
        when 1 then _top = -23
      _top = _top - parseFloat m._height
    else
      switch m.priority
        when 3 then _top = 20
        when 2 then _top = 16
        when 1 then _top = 12
    m._top = _top
  ) m for m in MOMENTS
  ## Create functions for assigning moments layer values
  adjustForClash = (crrt, others) ->
    clashedWith = (m for m in others when crrt.clash(m))
    if clashedWith.length > 0
      if not m.up
        #console.log(clashedWith[0]._height)
        crrt._top = clashedWith[0]._top + 8 + crrt._height
      else
        crrt._top = clashedWith[0]._top - 8 - crrt._height
      adjustForClash crrt, others
  processLayers = (moments) ->
    for m,i in moments
      adjustForClash(m,(ms for ms in moments when ms!=m))
  ## Apply functions to both the ups and the downs separately
  processLayers ups
  processLayers downs
  updateMomentInfoCSS(m) for m in MOMENTS
  findMaxTop = (moments) ->
    maxt = 0
    for m in moments
      t = parseFloat m._top
      maxt = t if maxt > t
    return Math.abs maxt
  findMaxBottom = (moments) ->
    maxb = 0
    for m in moments
      b = parseFloat (m._top + m._height)
      maxb = b if maxb < b
    return maxb

  
  SPINE.parent().animate {
    height : 2*Math.max(findMaxTop(MOMENTS), findMaxBottom(MOMENTS)) + 8
  }, {duration : 200}



#------------ UPDATE A MOMENTS CSS TO THE _ VALUES ----------------------------
# To be run on the finish of layer processing
updateMomentInfoCSS = (m) ->
  info = m.lblContainer
  info.animate {
    height : m._height, width : m._width
    marginLeft : m._marginLeft, top : m._top + 'px'
  }, {duration : 200}
  if m.vertical?
    top = m.top() + m.lblHeight()/2
    verticalHeight = Math.abs(top)
    if m.up then verticalTop = top else verticalTop = 0
    m.vertical.animate {
      top : verticalTop, height : verticalHeight
    }, {duration : 200}
    m.horizontal.animate {top : top}, {duration : 200}
    #m.circle.animate {top : top}, {duration : 200}
  if m.startWire.height() != 0 then m.animateStartWire()

#------------ CREATE THE EXPAND ALL FUNCTIONALITY AND BIND IT -----------------
# Given the origin circle, all moments and the SPINE, bind an expand all toggle
# function to the origin circle's event click
bindExpandAllToOrigin = (originCircle, moments, SPINE) ->
  originCircle
    .data('clicked',true)
    .click -> 
      e = originCircle.data('clicked')
      notExpanded = (m for m in MOMENTS when not m.isExpanded)
      m.isExpanded = e for m in MOMENTS
      if e
        adjustHeights()
        animateEndWires m for m in notExpanded
      else
        adjustHeights()
        m.removeEndWires() for m in moments
      originCircle.data('clicked',not e)


#------------ SMALL HELPER FUNCTIONS, SELF-EXPLANATORY ------------------------
# Given a month index, return the months name
monthNumToName = (m) ->
  "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Aug,Nov,Dec".split(',')[m]

# Given an array of moments, sort them by their start date
sortMoments = (moments) ->
  moments.sort((a,b) -> 
    if parseDate(a.start) < parseDate(b.start) then -1 else 1)

# Get the next available timelineId
getNextId = ->
  'timeline_' + $('.timeline').length + 1

# Given an input of yyyy-mm-dd format create a js date
parseDate = (input) ->
  if input.getDate? then return new Date(input.getTime())
  parts = input.match(/(\d+)/g)
  new Date(parts[0], parts[1] - 1, parts[2])

formatDate = (d) ->
  if d.getDate? then return d
  pad = (a,b) -> (1e15+a+"").slice(-b)
  d.getFullYear() + '/' + pad(d.getMonth()+1,2) + '/' + pad(d.getDate(),2) 

#------------------------------------------------------------------------------

createTimelineContainer = (destination) ->
  $('<div/ id="#{getNextId()}" class="timelineContainer">').css
    position : 'relative', minWidth : '500px'
    minHeight : '150px', height : 'auto', width : '100%'
    backgroundColor  : 'white'
  .appendTo(destination)


drawTimelineSPINE = (intervals) ->
  rightBuffer = UTILS.markerLeftBuffer
  markerLeftBuffer = UTILS.SPINELeftBuffer
  UTILS.SPINEWidthPct = 100-(rightBuffer + markerLeftBuffer)
  tlSPINE = $('<div class="SPINE"/>').appendTo(CONTAINER)
  .css
    'margin-left' : markerLeftBuffer+'%', 'margin-right' : rightBuffer + '%'
  .animate {
    width : UTILS.SPINEWidthPct + '%'
  }, {
    duration : 1000
    complete : ->   # animate interval appearance
      tlSPINE.find('.intMarker').delay(800).fadeIn(600)
  }


makeCircle = (r, c, boxShadow) ->
  boxShadow ?= true
  center circle = $(document.createElement('div'))
    .css
      background : c, zIndex : 10
      height : r+'px', width : r+'px'
      position : 'absolute'
      '-moz-border-radius' : r+'px'
      '-webkit-border-radius' : r+'px'
  if boxShadow then circle.css
      '-webkit-box-shadow': '0 0 1px black'
      '-moz-box-shadow': '0 0 1px black'
      boxShadow: '0 0 1px black'
  return circle

center = (c) ->
  c.css
    'margin-top' : -c.height()/2+'px'
    'margin-left': -c.width()/2+'px'


animateCircleGrowth = (c,rGoal,speed) ->
  c.animate {
    'height' : rGoal+'px', 'width' : rGoal+'px'
    '-moz-border-radius' : rGoal+'px'
    '-webkit-border-radius' : rGoal+'px'
    'margin-top' : -rGoal/2+'px'
    'margin-left' : -rGoal/2+'px'
  }, {duration : speed}


drawInMarkers = ->

  assignCSS = (int) ->
    today = new Date()
    switch int.priority
      when 3 then r = {w : 3, h : 19, c : 'black'}
      when 2 then r = {w : 2, h : 11, c : 'black'}
      when 1 then r = {w : 1, h : 5,  c : 'black'}
    if (int.date == today.getDate()) and (int.month == today.getMonth())
      r.c = 'blue'
      r.h = 15 if r.h < 15
    return r

  buildLabel = (int) ->
    lbl = $('<div/>').addClass('intMarker')
    txt = ''
    switch int.priority
      when 3 
        txt = monthNumToName int.month
        lbl.css 
          marginTop : -28
          fontSize : 9
          fontWeight : 'bold'
      when 2 then txt = 'Mon ' + int.date
      when 1 then return null
    lbl.text(txt)

  drawOrigin = ->
    UTILS.originCircle = makeCircle(12,'black')
      .addClass('originCircle')
      .css
        opacity : 0, cursor : 'pointer', top : '50%'
        left : SPINE.data('markerLeftBuffer') + '%'
      .animate {opacity:1}, {duration : 300}

  for int, i in UTILS.intervals
    ps = assignCSS int
    leftPos = UTILS.markerLeftBuffer + i*UTILS.pctPerInterval() + '%'
    $('<div class="int_marker"/>').css
      marginLeft : -ps.w/2
      width : ps.w, backgroundColor : ps.c
      left : leftPos
    .delay(1200).animate({
        height : ps.h
        marginTop : -ps.h/2
      }, {duration : 300})
    .appendTo SPINE
    lbl = (buildLabel int)
    lbl.css('left',leftPos).hide().appendTo SPINE if lbl?
  drawOrigin 


createAndPlaceMomentDots = (moment) ->

  createDurationLine = (moment, color) ->
    lft = UTILS.dateToMarkerLeft moment.start
    right = UTILS.dateToMarkerLeft moment.end
    width = (parseFloat(right) - parseFloat(lft)) + '%'
    line = $('<div class="duration"/>').css
      left : lft, backgroundColor : color
    .data
      slideIn : -> if not line.hasClass('inTransition')
        line.addClass('inTransition').stop()
          .css('width',0)
          .animate({width : width}, {duration : 300, complete : -> 
                line.removeClass('inTransition')})
        moment.endDot.fadeIn(300)
      slideOut : -> 
        if line.hasClass('inTransition') then delay = 200
        moment.endDot.delay(delay).stop().fadeOut(300)
        line.delay(delay).stop().removeClass('inTransition')
          .animate({width : 0}, {duration:300})
          

  startLeft = UTILS.dateToMarkerLeft(parseDate moment.start)
  endLeft = utils.dateToMarkerLeft(parseDate moment.end)
  (moment.startDot = makeCircle(7,'#47ACCA'))
      .delay(1400)
      .css {left:0, zIndex : 10}
      .animate {left : startLeft}, {duration : 400}
  (moment.endDot = makeCircle(7,'#E0524E'))
      .hide().delay(1400)
      .css {startLeft:0, zIndex : 11}
  moment.duration = createDurationLine(moment,'#5BB35C')
  hoverCircle = makeCircle(14,'white').css {opacity : 0, left : startLeft}
  SPINE.append(
    moment.startDot, moment.endDot
    moment.duration, hoverCircle
  )
  moment.hoverAnimation = 
    in : moment.duration.data('slideIn')
    out : moment.duration.data('slideOut')



#------------ CREATE AND APPEND THE INFO DIV FOR MOMENT -----------------------
# Given a moment and a SPINE, create the label for the moment and deal
# with left positioning. Attach the label jQuery element to the moment 
# for easy access. Also make the startWire
createAndPlaceMomentInfo = (moment) ->

  processTitle = (m, infoDiv) ->
    textLine = ""
    if UTILS.structure.title.length != 1
      for i in [0..UTILS.structure.title.length-2]
        key = UTILS.structure.title[i]
        if m[key]? then textLine += m[key] + ':'
    textLine += m[UTILS.structure.title[UTILS.structure.title.length-1]]
    mainTitle = $('<span/>').css('display','inline')
      .text(textLine).addClass('title').appendTo(infoDiv)

    m.collapsed = 
      height : infoDiv.height()
      width : infoDiv.width() + 1
      marginLeft : -(infoDiv.width())/2
    processExpanded m, mainTitle, infoDiv, textLine

  processExpanded = (m, mainTitle, infoDiv, textLine) ->
    # Process the extendedTitle parts
    structure = UTILS.structure
    if structure.extendedTitle.length != 0
      textLine += ' - '
      for i in [0..structure.extendedTitle.length-2]
        key = structure.extendedTitle[i]
        if m.key? then textLine = textLine +  m[key] + ', '
      textLine += m[structure.extendedTitle[structure.extendedTitle.length-1]]
      if /^[\s]+$/.test(textLine.split(' - ')[1]) then textLine = textLine.replace(' - ','')
    mainTitle.text(textLine)
    textLine = ''
    # Create the new line
    infoDiv.html(infoDiv.html() + '<br>')
    # Create content span and assign css, then append
    content = $('<span/>').css({whiteSpace:'nowrap', fontSize:'10px'}).appendTo(infoDiv)

    if structure.content.names?
      links = []
      for linkKey,i in structure.content.links
        if m[linkKey]?
          links.push $('<a/>').text(structure.content.names[i]).attr('href',m[linkKey])
      addedContent = links.length != 0
      for link,i in links
        if i != links.length-1
          link.appendTo(content)
          content.html(content.html()+ ' / ')
      if links[0]? then content.append link
    else
      for i in [0..structure.content.length-2]
        key = structure.content[i]
        if m[key]? then textLine += (m[key] + ' / ')
      textLine += m[structure.content[structure.content.length-1]]
      addedContent = true
      content.text(textLine)
    m.expanded =
      height : infoDiv.height() + (if addedContent then 4 else 0)
      width : infoDiv.width() + (if addedContent then 4 else 0)
      marginLeft : m.collapsed.marginLeft #TODO - sort out centering
    infoDiv.css
      height : m.collapsed.height
      width : m.collapsed.width
      marginLeft : m.collapsed.marginLeft

  createAndPlaceMomentStartWire = (moment, left) ->
    startWire = $('<div/>').appendTo SPINE
    startWire.addClass('wire').css
      position : 'absolute', width : '2', backgroundColor : 'black'
      left : left   # This will always remain the same, wire won't move
      top : 0, '-webkit-box-shadow': '0 0 2px blue', height : 0
      '-moz-box-shadow': '0 0 2px blue', boxShadow: '0 0 2px blue'
    moment.startWire = startWire
    moment.animateStartWire =  ->
      if @up
        @startWire.stop().animate {
          height : Math.abs(@bottom())
          top : @bottom()
        }, {duration : 200, easing : 'linear'}
      else
        @startWire.animate {
          height : @top()
        }, {duration : 200}

  animateEndWires = (m) ->
    startWire = m.startWire
    left = UTILS.dateToMarkerLeft m.start
    right = parseFloat utils.dateToMarkerLeft(m.end)
    top = m.top() + m.lblHeight()/2
    vHeight = Math.abs(top)
    if m.up then vTop = top else verticalTop = 0
    
    m.vertical = $('<div class="due_wire"/>').css
      width : '2px', left : right + '%', height : 0, top : top
      
    m.horizontal = $('<div class="due_wire"/>').css
      height : '2px', left : left, width : 0, top : top

    SPINE.append m.vertical, m.horizontal

    m.horizontal.animate {
      width : (right - parseFloat left) + '%'
    }, {complete : ->
        m.vertical.animate {height : vHeight, top : vTop}, {duration : 200}}
    m.removeEndWires = ->
      m.vertical.remove()
      m.horizontal.remove()

  left = UTILS.dateToMarkerLeft(moment.start)
  container = $('<div/>').addClass('infoBox')
  .css('left',left).click ->
    moment.isExpanded = not moment.isExpanded
    adjustHeights()     # -----------
    if moment.isExpanded
      animateEndWires moment
    else
      moment.removeEndWires()   
  .hover moment.hoverAnimation.in, moment.hoverAnimation.out
  .appendTo(SPINE)
  
  processTitle(moment, container).hide()
  container.css('margin-left',-container.width()/2).data('defaultLeft',left)
  moment.leftPctNum = parseFloat(left)
  createAndPlaceMomentStartWire moment, left
  moment.lblContainer = container
  return moment

