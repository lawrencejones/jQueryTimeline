#///////////////////////////////////////////////////////////////////////////////
# TESTS
#///////////////////////////////////////////////////////////////////////////////

getTestData = ->
	[
		id : '5:TUT', name : 'Mathematical and Strong Induction   '
		start : '2013-01-17', end : '2013-01-24', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '2:PMT', name : 'Well-Founded Induction   '
		start : '2013-01-31', end : '2013-02-08', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '3:PMT', name : 'Loops   '
		start : '2013-02-14', end : '2013-02-22', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '4:PMT', name : 'Loops - Part 2   '
		start : '2013-02-28', end : '2013-03-08', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '17:TUT', name : 'Sorting Flags   '
		start : '2013-03-14', end : '2013-03-21', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '10:TUT', name : 'Well-Founded Induction   '
		start : '2013-01-31', end : '2013-02-07', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '8:PMT', name : 'Structural Induction   '
		start : '2013-01-24', end : '2013-01-31', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '14:TUT', name : 'Loops   '
		start : '2013-02-14', end : '2013-02-21', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '7:TUT', name : 'Structural Induction   '
		start : '2013-01-24', end : '2013-01-31', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '12:TUT', name : 'Induction over Recursively Defined Relations   '
		start : '2013-02-07', end : '2013-02-14', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '1:PMT', name : 'Structural_Induction   '
		start : '2013-01-24', end : '2013-02-01', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '11:PMT', name : 'Induction over Recursively Defined Relations   '
		start : '2013-02-07', end : '2013-02-14', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '15:TUT', name : 'Recursion   '
		start : '2013-02-21', end : '2013-02-28', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '18:CW', name : 'Iterative Quicksort   '
		start : '2013-03-14', end : '2013-03-21', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '6:PMT', name : 'Mathematical and Strong Induction   '
		start : '2013-01-17', end : '2013-01-24', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '9:PMT', name : 'Well-Founded Induction   '
		start : '2013-01-31', end : '2013-02-07', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '13:PMT', name : 'Loops   '
		start : '2013-02-14', end : '2013-02-21', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	,
		id : '16:TUT', name : 'Binary_Search   '
		start : '2013-03-07', end : '2013-03-15', spec : 'SPEC', givens : 'GIVENS', notes : 'NOTES'
	]
	

$ ->
	[testStart, testEnd] = ['2013-01-07', '2013-03-27']
	structure =
		title : ['id']
		extendedTitle : ['name']
		content : ['spec','givens','notes']
	createTimelineWithMoments testStart, testEnd, 'day', $('#container'), getTestData(), structure
