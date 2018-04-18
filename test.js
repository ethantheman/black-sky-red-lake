const {containsAnagrams, divCheck, checkSum} = require('./checkSum.js');

let assert = (condition, description) => {
	if (condition) {
		console.log("test passed!!!");
	} else {
		console.log("test failed: ", description);
	}
};

let sample = 	[ '17796',
'27791',
'30677',
'34176',
'36574',
'54286',
'55994',
'56442',
'58858',
'69522',
'72158',
'126652',
'129749',
'156951',
'172100',
'247234',
'252587',
'278154',
'282997',
'342487',
'361684',
'378299',
'415271',
'438606',
'455018',
'476495',
'512855',
'518422',
'523445',
'544802',
'567403',
'570770',
'611447',
'620081',
'642191',
'663095',
'684227',
'722440',
'741061',
'770476',
'772836',
'778294',
'833914',
'834584',
'887222',
'920549',
'946264',
'974126',
'987210' ];

let testData = [
	["1", "2", "3", "4", "5"],
	["100", "150", "215", "80", "152"],
	["500", "354", "50", "2", "99"],
	["3001", "4", "1", "9", "500"]
];

assert(containsAnagrams(sample) === false, 'it should handle numbers with zeros');

assert(
	containsAnagrams(testData[1]) === true,
	"it should identify numerical anagrams"
);
assert(
	containsAnagrams(testData[0]) === false,
	"it should return false when there are no anagrams."
);
assert(
	divCheck(testData[2].slice().sort((a, b) => parseInt(a) - parseInt(b))) ===
		true,
	"it should identify numbers that divide to 177"
);

assert(divCheck(testData[1].slice().sort((a, b) => parseInt(a) - parseInt(b))) ===
		false, "it should return false when no two elements divide to 177.");

let sum = 0;
testData.forEach(row => sum += checkSum(row));
assert(sum === 3004, "it should calculate the sum correctly");