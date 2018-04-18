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

const redis = require("redis");
const bluebird = require('bluebird');
const http = require('http');
const client = redis.createClient("http://redis");
client.on("connect", () => console.log("connected successfully to redis!"));
client.on("error", err => console.log("redis connection error: ", err));

bluebird.promisifyAll(client); // allows for chaining of .then and .catch

let startTime = Date.now();

client.keysAsync('*')
.then(keys => {
	let sum = 0, count = 0;
	keys.forEach(key => {
		client.typeAsync(key).then(type => {
			if ( type === 'list' ) {
				client.llenAsync(key).then(l => {
					client.lrangeAsync(key, 0, l).then(arr => {
						sum += checkSum(arr);
						count++;
						if ( count === keys.length ) {
							http.get(`http://answer:3000/${sum}`, res => {
								console.log('response: ', res.statusCode);
								console.log('finished in: ', Date.now() - startTime, 'ms');
							});
						}
					}).catch(e => console.log('lrange error: ', e));
				}).catch(e => console.log('llen error', e));
			} else if ( type === 'set' ) {
				client.smembersAsync(key).then(arr => {
					sum += checkSum(arr);
					count++;
					if ( count === keys.length ) {
						http.get(`http://answer:3000/${sum}`, res => {
							console.log('response: ', res.statusCode);
							console.log('finished in: ', Date.now() - startTime, 'ms');
						});
					}
				}).catch(e => console.log('smembers error: ', e));
			} else {
				console.log('something unexpected happened!');
			}
			// move the http.get('answer...') to here instead of writing it twice
			// factor out set/list code into function
		}).catch(e => {
			console.log('error getting type of key: ', e);
		})
	})
}).catch(e => console.log(e));

/*
* @param {array} row - an array of strings representing numbers in a row of data
* @return {boolean} - whether the row contains any numerical anagrams
*/

let containsAnagrams = row => {
	// use an object to return early
	// copy the row to avoid mutating the input
	let copy = row.slice();
	for (var i = 0; i < copy.length; i++) {
		// sort the digits inside each number so anagrams will appear as the same number
		// EDGE CASE: LEADING ZEROS AFTER SORTING - must sort digits from 9 to 0, not 0 to 9!
		let key = copy[i]
			.split("")
			.sort((a, b) => b - a)
			.join("");
		copy[i] = parseInt(key);
	}

	// sort the entire array so any anagrams will be adjacent
	// and therefore identifiable in a single pass over the array
	copy.sort((a, b) => a - b);

	let candidate = copy[0];
	for (i = 1; i < copy.length; i++) {
		if (copy[i] === candidate) {
			return true;
		} else {
			candidate = copy[i];
		}
	}
	return false;
};

/*
* @param {array} row - a sorted array of numbers
* @return {boolean} - whether any two elements in the array can be divided to equal 177
*/
let divCheck = row => {
	// put numbers into a set, loop over it once, check if element[i] * 177 exists in set
		// if yes, return true
		// if element[i] * 177 > maximum, return false
		// else i++
	// since the row is sorted, we can use two pointers to scan the array outside-in:
	// let a = 0,
	// 	b = row.length - 1
	// while (b > a) {
	// 	if (row[b] / row[a] < 177) {
	// 		a++;
	// 	} else if (row[b] / row[a] > 177) {
	// 		b--;
	// 	} else if (row[b] / row[a] === 177) {
	// 		return true;
	// 	}
	// }
	// return false;
	let set = {};
	for ( var i = 0; i < row.length; i++ ) {
		set[row[i]] = true;
	}

	for ( var i = 0; i < row.length; i++ ) {
		if ( row[i] * 177 > row[row.length - 1] ) {
			return false;
		} else if ( set[row[i] * 177] !== undefined ) {
			return true;
		}
	}
	return false;
};

/*
* @param {array} row - a single row from the redis database
* @return {Number} sum - the checkSum calculated after processing the row
*/
let checkSum = row => {
	let sum = 0;
	// check for anagrams before sorting since doesn't take sorted array as input

	// sort the row before calling divCheck
	let sortedRow = row.slice().sort((a, b) => parseInt(a) - parseInt(b));

	if (!containsAnagrams(row) && !divCheck(sortedRow)) {
		// min/max will be first and last elements in sortedRow
		sum += sortedRow[sortedRow.length - 1] - sortedRow[0];
	}
	return sum;
};

module.exports = {
	checkSum: checkSum,
	divCheck: divCheck,
	containsAnagrams: containsAnagrams
};