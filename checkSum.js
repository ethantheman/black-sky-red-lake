/*
	For each list or set, collect all the items (each item will be an integer (>= 1) 
	represented as a string) into an array and run the following analysis:
	Scan the array for any numerical anagrams (123 is a numerical anagram of 321, as is 212 of 221). 
	If it contains any numerical anagrams, skip this array and continue to the next.
	If any two numbers in the array can be divided together to equal 177, skip this array and continue to the next.
	Otherwise, find the difference between the maximum value in the array and the minimum value. 
	Store this result.
	Sum the differences collected above. This is your checksum.

	ex. If the arrays extracted from Redis were:

	[1, 2, 3, 4, 5] // diff: 5 - 1 = 4
	[100, 150, 215, 80, 152] // skipped, 215 and 152 are numerical anagrams
	[500, 354, 50, 2, 99] // skipped, 354 / 2 = 177
	[3001, 4, 1, 9, 500] // diff: 3001 - 1 = 3000
	Your checksum would be 3004.
*/

/* 
	containsAnagrams works by sorting the digits inside each element,
	and storing the result in a hashmap if it doesn't exist in the hashmap yet.
	if any duplicate keys are found, an anagram exists.

	this can also be done without the hashmap by sorting the digits in each element,
	then sorting the entire row and checking for duplicate using a 'candidate' variable.
*/
let containsAnagrams = (row) => {
	let nums = {};

	for ( let i = 0; i < row.length; i++ ) {
		// sort the digits inside each element:
		let key = row[i].split('').sort((a, b) => parseInt(a) - parseInt(b)).join('');
		if ( nums[key] !== undefined ) {
			// duplicate key was found, therefore an anagram exists:
			return true;
		} else {
			nums[key] = true;
		}
	}
	// if we reach this point, no anagram exists in this row:
	return false;
}

let divCheck = (row) => {
	// since the row is sorted, we can use two pointers to check for the condition:
	let a = 0, b = row.length - 1, flag = false;
	while ( b > a && flag === false ) {
		if ( row[b] / row[a] < 177 ) {
			a++;
		} else if ( row[b] / row[a] > 177 ) {
			b--;
		} else if ( row[b] / row[a] === 177 ) {
			flag = true;
		}
	}
	return flag;
}

let checkSum = (data) => {
	let sum = 0;
	data.forEach(row => {
		// sort the row before calling helper functions
		let sortedRow = row.sort((a, b) => parseInt(a) - parseInt(b));
		if ( !containsAnagrams(row) && !divCheck(sortedRow) ) {
			// since row is sorted:
			sum += sortedRow[row.length - 1] - sortedRow[0];
		}
	});

	return sum;
}

let assert = (condition, description) => {
	if ( condition ) {
		console.log('test passed.')
	} else {
		console.log('test failed: ', description);
	}
}

let testData = [
	["1", "2", "3", "4", "5"], 
	["100", "150", "215", "80", "152"], 
	["500", "354", "50", "2", "99"],
	["3001", "4", "1", "9", "500"]
];

assert(containsAnagrams(testData[1]) === true, "it should identify numerical anagrams");
assert(containsAnagrams(testData[0]) === false, "it should return false when there are no anagrams.");
assert(divCheck(testData[2].sort((a, b) => parseInt(a) - parseInt(b))) === true, "it should identify numbers that divide to 177");
assert(checkSum(testData) === 3004, "it should calculate the sum correctly");