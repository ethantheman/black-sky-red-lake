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

let containsAnagrams = (row) => {
	// return whether any two elements are anagrams
	// brute force: try each combination, with possibility to return true early if match found.
	for ( var i = 0; i < row.length - 1; i++ ) {
		for ( var j = i + 1; j < row.length; j++ ) {
			let flag = true;
			// anagrams must be the same length
			if ( row[i].length === row[j].length ) {
				// count occurrences of characters in first string
				let chars = {};
				for ( var c = 0; c < row[i].length; c++ ) {
					if ( chars[c] === undefined ) {
						chars[c] = 1;
					} else {
						chars[c]++;
					}
				}

				// check against characters in second string
				for ( c = 0; c < row[j].length; c++ ) {
					if ( chars[c] === undefined || chars[c] === 0 ) {
						flag = false;
					} else {
						chars[c]--;
					}
				}
				if ( flag ) {
					return true;
				}
			}
		}
	}
	return false;
}

let divCheck = (row) => {
	// return whether any two elements can divide to 177
	// brute force: try each combination, with possibility to return true early if match found.
	for ( var i = 0; i < row.length-1; i++ ) {
		for ( var j = i + 1; j < row.length; j++ ) {
			if ( parseInt(row[i]) / parseInt(row[j]) === 177 || parseInt(row[j]) / parseInt(row[i]) === 177 ) {
				return true;
			}
		}
	}
	return false;
}

let checkSum = (data) => {
	let sum = 0, max, min;
	data.forEach(row => {
		// reset min and max. all elements will be >= 1, so max can be 0 to start.
		max = 0;
		min = Number.POSITIVE_INFINITY;

		if ( !containsAnagrams(row) && !divCheck(row) ) {
			// calculate the min and max, add diff to sum
			row.forEach(el => {
				// each array element is a string representing an integer >= 1.
				if ( parseInt(el) < min ) {
					min = parseInt(el);
				}
				if ( parseInt(el) > max ) {
					max = parseInt(el);
				}
			});
			sum += max - min;
		}
	});

	return sum;
}

console.log(checkSum([[1, 2, 3, 4, 5], [3001, 4, 1, 9, 500]]));
console.log(divCheck(["500", "354", "50", "2", "99"]));
console.log(containsAnagrams([100, 150, 215, 80, 153])); // broken!