#///////////////////////////////////////////////////////////////////////////////
# TESTS
#///////////////////////////////////////////////////////////////////////////////

getTestData = ->
	[
    id:"2", type:"CW", name:"EX2", handin:"null"
    start: new Date(1359331200000), end: new Date(1359936000000)
    spec:"showfile.cgi?key=2012:3:880:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:491:c1:new:lmj112"
  , 
    id:"5", type:"CW", name:"EX4", handin:"null"
    start: new Date(1360540800000), end: new Date(1361750400000)
    spec:"showfile.cgi?key=2012:3:1018:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:549:c1:new:lmj112"
  , 
    id:"8", type:"TUT", name:"Intel 64 - Tutorial 3", handin:"null"
    start: new Date(1362355200000), end: new Date(1362960000000)
    spec:"showfile.cgi?key=2012:3:1181:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:594:c1:new:lmj112"
  , 
    id:"3", type:"CW", name:"EX3", handin:"null"
    start: new Date(1360022400000), end: new Date(1360540800000)
    spec:"showfile.cgi?key=2012:3:938:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:515:c1:new:lmj112"
  , 
    id:"6", type:"TUT", name:"Intel 64 - Tutorial 1", handin:"null"
    start: new Date(1361232000000), end: new Date(1361750400000)
    spec:"showfile.cgi?key=2012:3:1044:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:558:c1:new:lmj112"
  , 
    id:"1", type:"CW", name:"EX1", handin:"null"
    start: new Date(1358726400000), end: new Date(1359331200000)
    spec:"showfile.cgi?key=2012:3:780:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:437:c1:new:lmj112"
  , 
    id:"4", type:"CW", name:"ASSESSED_EX1", handin:"null"
    start: new Date(1359936000000), end: new Date(1361232000000)
    spec:"showfile.cgi?key=2012:3:948:c1:SPECS:lmj112", givens:"null"
  , 
    id:"7", type:"TUT", name:"Intel 64 - Tutorial 2", handin:"null"
    start: new Date(1361750400000), end: new Date(1362355200000)
    spec:"showfile.cgi?key=2012:3:1142:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:582:c1:new:lmj112"
  , 
    id:"9", type:"TUT", name:"Floating Point Tutorial", handin:"null"
    start: new Date(1362960000000), end: new Date(1363564800000)
    spec:"showfile.cgi?key=2012:3:1220:c1:SPECS:lmj112", givens:"given.cgi?key=2012:3:603:c1:new:lmj112"
	]

$ ->
	[testStart, testEnd] = ['2013-01-07', '2013-03-27']
	structure = {
		title : ['id','type']
		extendedTitle : ['name']
		content :
			names : ['HAND IN', 'SPEC', 'GIVENS']
			links : ['handin', 'spec', 'givens']
	}
	createEmptyTimeline testStart, testEnd, 'day', $('#container'), getTestData(), structure
