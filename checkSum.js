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
const client = redis.createClient("http://redis");
client.on("connect", () => console.log("connected successfully to redis!"));
client.on("error", err => console.log("redis connection error: ", err));

bluebird.promisifyAll(client); // allows for chaining of .then and .catch

client.keysAsync('*')
.then(keys => {
	let sum = 0;
	keys.forEach(key => {
		client.typeAsync(key).then(type => {
			if ( type === 'list' ) {
				client.llenAsync(key).then(l => {
					client.lrangeAsync(key, 0, l).then(arr => {
						data.push(arr);
						if ( data.length === keys.length ) {
							console.log('donezo!', data);
						} else {
							console.log('not yet');
						}
					}).catch(e => console.log('lrange error: ', e));
				}).catch(e => console.log('llen error', e));
			} else if ( type === 'set' ) {
				client.smembersAsync(key).then(arr => {
					data.push(arr);
					if ( data.length === keys.length ) {
						console.log('donezo!!', data);
					} else {
						console.log('not yet');
					}
				}).catch(e => console.log('smembers error: ', e));
			}
		}).catch(e => {
			console.log('error getting type of key: ', e);
		})
	})
}).catch(e => console.log(e));

// client.keys('*', (err, replies) => {
// 	if ( err ) {
// 		console.log('client keys error: ', err);
// 	} else {
// 		let data = [];
// 		replies.forEach(key => {
// 			client.type(key, (err, res) => {
// 				if ( err ) throw err;
// 				console.log('type of key', key, ': ', res);
// 				if ( res === "set" ) {
// 					console.log('do something with the set')
// 					data.push(res);
// 					if ( data.length === 500 ) {
// 						console.log('all done! time to call checkSum on the data.');
// 					} else {
// 						console.log('not yet!');
// 					}
// 				} else if ( res === "list" ) {
// 					client.llen(key, (err, length) => {

// 					});
// 					// let a = client.lrange(key, 0, len);
// 					console.log('key: ', key, 'len: ', len);
// 					data.push(res);
// 					if ( data.length === 500 ) {
// 						console.log('all done! time to call checkSum on the data.');
// 					} else {
// 						console.log('not yet!');
// 					}
// 				}
// 			});
// 		})
// 	}
// });

/*
* @param {array} row - an array of strings representing numbers in a row of data
* @return {boolean} - whether the row contains any numerical anagrams
*/

let containsAnagrams = row => {
	// copy the row to avoid mutating the input
	let copy = row.slice();
	for (var i = 0; i < copy.length; i++) {
		// sort the digits inside each number so anagrams will appear as the same number
		let key = copy[i]
			.split("")
			.sort((a, b) => parseInt(a) - parseInt(b))
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
	// since the row is sorted, we can use two pointers to scan the array outside-in:
	let a = 0,
		b = row.length - 1,
		flag = false;
	while (b > a && flag === false) {
		if (row[b] / row[a] < 177) {
			a++;
		} else if (row[b] / row[a] > 177) {
			b--;
		} else if (row[b] / row[a] === 177) {
			flag = true;
		}
	}
	return flag;
};

/*
* @param {array} row - a single row from the redis database
* @return {Number} sum - the checkSum calculated after processing every row
*/
let checkSum = row => {
	let sum = 0;
	// data.forEach(row => {
		// sort the row before calling divCheck
		let sortedRow = row.slice().sort((a, b) => parseInt(a) - parseInt(b));
		if (!containsAnagrams(row) && !divCheck(sortedRow)) {
			// min/max will be first and last elements in sortedRow
			sum += sortedRow[sortedRow.length - 1] - sortedRow[0];
		}
	// });
	return sum;
};

// let assert = (condition, description) => {
// 	if (condition) {
// 		console.log("test passed!!!");
// 	} else {
// 		console.log("test failed: ", description);
// 	}
// };

// let testData = [
// 	["1", "2", "3", "4", "5"],
// 	["100", "150", "215", "80", "152"],
// 	["500", "354", "50", "2", "99"],
// 	["3001", "4", "1", "9", "500"]
// ];

// assert(
// 	containsAnagrams(testData[1]) === true,
// 	"it should identify numerical anagrams"
// );
// assert(
// 	containsAnagrams(testData[0]) === false,
// 	"it should return false when there are no anagrams."
// );
// assert(
// 	divCheck(testData[2].slice().sort((a, b) => parseInt(a) - parseInt(b))) ===
// 		true,
// 	"it should identify numbers that divide to 177"
// );
// assert(checkSum(testData) === 3004, "it should calculate the sum correctly");
