#///////////////////////////////////////////////////////////////////////////////
# UTILITIES 
#///////////////////////////////////////////////////////////////////////////////

#Set container to hold data on the start date of the current timeline,
#the end date and the buffer for the start of the markers.
#   dateToMarkerNo   - takes a date and returns number of days between
#                      that date and the start date, ie markerNo
#   noOfIntervales   - returns number of markers
#   dateToMarkerLeft - returns the exact left percentage of a marker, 
#                      given date
#   pctPerInterval   - simply calculated the percentage per interval
setContainerData = (container, start, end, markerLeftBuffer)  ->
	container.data
		utils :
			startDate : start
			endDate : end
			markerLeftBuffer : markerLeftBuffer
			dateToMarkerNo : (d) ->
				Math.floor (d-@startDate)/(1000*60*60*24)
			noOfIntervals : -> 
				1 + @dateToMarkerNo @endDate
			dateToMarkerLeft : (d) ->
				(@markerLeftBuffer + @pctPerInterval()*(@dateToMarkerNo d)) + '%'
			pctPerInterval : ->
				(100 - @markerLeftBuffer) / @noOfIntervals()
			toString : -> 
				"Start : #{@startDate} 
				\nEnd : #{@endDate}  
				\nMarkers left buffer : #{@markerLeftBuffer} 
				\nNo Of Intervals : #{@noOfIntervals()}  
				\nPercent per Interval : #{@pctPerInterval().toFixed(3)}"


#Given start/end dates and an interval type ('day' || 'month') produce
#an array of literals with assigned importance and relevant info
#For a day interval, month starts get value 3, week beginnings get 2
#and days 1, or whatever is the greatest score
produceIntervals = (start, end, interval) ->
	#start and end should be strings of format yyyy-mm-dd
	start = parseDate start
	alert(start)
	alert(start.getDay())
	end = parseDate end
	#start and end are now date type
	result = []
	while start <= end
		result.push 
			date  : start.getDate()
			day   : start.getDay()
			month : start.getMonth()
			year  : 1900+start.getYear()
			
			toString : -> @date + '/' + @month + '/' + @year + ' day is ' + @day
		start.setDate (start.getDate() + 1)

	setPriority = (interval) ->
		if interval['date'] == 1
			interval['priority'] = 3
		else if interval['day'] == 1
		 	interval['priority'] = 2
		 else interval['priority'] = 1
	console.log(int.toString()) for int in result
	setPriority(interval) for interval in result
	result


#Given a spine, will return the owning container. Helps keep code in context
getContainer = (spine) ->
	spine.parent()


#Given the container, grab utils
getUtils = (container) ->
	container.data('utils')


#Get the next available timelineId
getNextId = ->
	'timeline_' + $('.timeline').length + 1


#Given an input of yyyy-mm-dd format create a js date
parseDate = (input) ->
	parts = input.match(/(\d+)/g)
	new Date(parts[0], parts[1] - 1, parts[2])


#Given a month index, return the months name
monthNumToName = (m) ->
	"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Aug,Nov,Dec".split(',')[m]
	

#///////////////////////////////////////////////////////////////////////////////
# DRAWING FUNCTIONS -- CREATING TIMELINE SPINE & CONTAINER
#///////////////////////////////////////////////////////////////////////////////

#Given a user created container, start laying the divs with the first container
createTimelineContainer = (userContainer) ->
	userContainer.append timelineContainer = $(document.createElement('div'))
	timelineContainer.attr
		'id' : getNextId()
		'class' : 'timelineContainer'
	.css
		'position' : 'absolute'
		'height' : '150px', 'width' : '100%'
		'backgroundColor'  : 'white'
	timelineContainer


#Given a radius and a color, return an jQuery SVG circle element
#NB- circle positioned dead center, due to center call
makeCircle = (r, c) ->
	center circle = $(document.createElement('div'))
		.css(
			background : c
			height : r+'px', width : r+'px'
			'-moz-border-radius' : r+'px'
			'-webkit-border-radius' : r+'px'
			position : 'absolute')


#Given a jQuery div representing a circle, center it by accounting
#for it's width and height
center = (c) ->
	c.css
		'margin-top' : -c.height()/2+'px'
		'margin-left': -c.width()/2+'px'

#Given a jQuery circle div, a goal radius size and a speed in 
#miliseconds animate the movement of that circle toward the specified 
#goal, maintaining the centering
animateCircleGrowth = (c,rGoal,speed) ->
	c.animate {
		'height' : rGoal+'px', 'width' : rGoal+'px'
		'-moz-border-radius' : rGoal+'px'
		'-webkit-border-radius' : rGoal+'px'
		'margin-top' : -rGoal/2+'px'
		'margin-left' : -rGoal/2+'px'
	}, {duration : speed}


#Given a timeline container, NB- not user container,
#create the timelines spine and animate it's extension
drawTimelineSpine = (timelineContainer) ->
	leftBuffer = 7;
	rightBuffer = 3;
	tlSpine = $(document.createElement('div'))
		.data 
			'leftBuffer' : leftBuffer
			'rightBuffer' : rightBuffer
	timelineContainer.append tlSpine
	tlSpine.attr
		'class' : 'spine'
	.css
		'position' : 'absolute'
		'width' : '0%', 'height' : '1px'
		#'margin' : timelineContainer.height()/2+'px'
		'margin-top' : '50%'
		'margin-left' : leftBuffer+'%', 'margin-right' : rightBuffer + '%' #sideBuffer+'%'
		'backgroundColor' : 'black'
	.animate {
		width : 100-(rightBuffer + leftBuffer)+'%'
	}, {
		duration : 1000
	}
	tlSpine


#Create a circle on the leftmost point of the spine,
#layering like so...   .timelineContainer #timeline_0n
#                      |-- .spine
#                      +-- .originCircle
#return the container for use later
drawTimelineOriginCircle = (spine) ->
	container = getContainer(spine)
	container.append makeCircle(12,'black')
		.addClass('originCircle')
		.css
			'opacity' : 0
			'top' : '50%'
			'left' : spine.data('leftBuffer') + '%'
	container.find('.originCircle').animate {
		'opacity':1
	},{duration : '300', easing : 'easeInBounce'}
	#animateCircleGrowth container.find('.originCircle').eq(0), 12, 300


#///////////////////////////////////////////////////////////////////////////////
# DRAWING FUNCTIONS -- CREATING INTERVALS AND LABELS
#///////////////////////////////////////////////////////////////////////////////

#Given a width, height and color, create a vertical line to be used
#(typically) as an interval marker
makeMarker = (properties) ->
	h = properties['h']
	w = properties['w']
	$(document.createElement('div')).css
		position : 'absolute', top : 0
		marginTop : 0, 'margin-left' : -w/2
		height : 0, width : w #TODO - SETUP ANIMATION
		backgroundColor : properties['c']
	.data('finalHeight',h)

animateMarker = (m) ->
	finalHeight = m.data('finalHeight')
	m.delay(1200)
		.animate({
			height : finalHeight
			marginTop : -finalHeight/2
		}, {duration : 300})


buildLabel = (int) ->
	lbl = $(document.createElement('div')).css
		marginTop : -14, width : 40, marginLeft : -20, textAlign : 'center'
		height : 'auto', fontFamily : 'Arial', fontSize : '7px'
		position : 'absolute'
	txt = ''
	switch int.priority
		when 3 
			txt = monthNumToName int.month
			lbl.css 
				marginTop : -20
				fontSize : 9
				fontWeight : 'bold'
		when 2 then txt = 'Mon ' + int.date
		when 1 then return null
	lbl.text(txt)


#Given intervals, draw them onto the spine in the correct placement
#and then call the labelling function
drawInMarkers = (spine, intervals) ->
	assignCSS = (int) ->
		switch int.priority
			when 3 then {w : 3, h : 19, c : 'black'}
			when 2 then {w : 2, h : 11, c : 'black'}
			when 1 then {w : 1, h : 5,  c : 'black'}
	#start interval marking a percentage away from the leftmost edge of the
	#spine, find appropriate value by fetching from the container.data
	utils = getUtils(getContainer(spine))
	buffer = utils.markerLeftBuffer
	pctPerInterval = (100-buffer)/(intervals.length-1)
	for int, i in intervals
		pos = 3 + i*pctPerInterval + '%'
		(mrk = makeMarker assignCSS(int)).css 
			left : pos
		spine.append mrk
		animateMarker mrk
		lbl = (buildLabel int)
		spine.append(lbl.css('left',pos)) if lbl?


#///////////////////////////////////////////////////////////////////////////////
# DRAWING FUNCTIONS -- CREATING MOMENTS
#///////////////////////////////////////////////////////////////////////////////






#///////////////////////////////////////////////////////////////////////////////
# CREATION
#///////////////////////////////////////////////////////////////////////////////

#Given start/end dates, important intervals ('day' | 'month') and the
#jQuery object into which to insert the timeline div, do it!
createEmptyTimeline = (startDate, endDate, interval, jQueryObject) ->


#Run createEmptyTimeline with the first variables, then use the populate
#function to place the array of moments into the current timeline
createTimelineWithMoments = (startDate, endDate, interval, jQueryObject, moments) ->


#With the given moment, insert that information into the (also give) jQuery
#timeline object
createMomentAtTimeline = (moment, jQueryTimeline) ->


#Iterate through the array of moments, inserting each into the given
#jQuery timeline object
insertMomentsIntoTimeline = (moments, jQueryTimeline) ->


#///////////////////////////////////////////////////////////////////////////////
# TESTS
#///////////////////////////////////////////////////////////////////////////////

printCurrentContainerData = (container) ->
	console.log(getUtils(container).toString())

#String format date
shootMarkerByDate = (d, container) ->
	spine = container.find('.spine').eq(0)
	$(document.createElement('div'))
		.css
			left : getUtils(container).dateToMarkerLeft(parseDate('2013-02-01'))
			position : 'absolute', backgroundColor : 'black'
			height : 30, width : 1, marginTop : -15
		.appendTo(spine)

runTests = (container) ->
	console.log('Printing current container information...\n')
	printCurrentContainerData(container)
	console.log('Test selecting date 2013-03-01...')
	shootMarkerByDate '2013-03-01', container


#Container utils
# --startDate, endDate, markerLeftBuffer
# --dateToMarkerNo(d)      --noOfIntervals()
# --dateToMarkerLeft(d)    --pctPerInterval()

$ ->
	[testStart, testEnd] = ['2013-01-07', '2013-03-22']
	container = createTimelineContainer $('#container')
	setContainerData container, parseDate(testStart), parseDate(testEnd), 3
	intervals = produceIntervals(testStart, testEnd, 'day')
	drawInMarkers (spine = drawTimelineSpine container), intervals
	drawTimelineOriginCircle spine
	#runTests(container)

