/*
	This file connects to the redis database, reads all the keys, calculates
	the checkSum, and sends the result to the answer server. The main function 
	is called driver - it begins on line 18 and is invoked on line 137.
*/

const redis = require("redis");
const bluebird = require("bluebird");
const http = require("http");
const client = redis.createClient("redis://redis");
client.on("connect", () => console.log("connected successfully to redis!"));
client.on("error", err => console.log("redis connection error: ", err));

bluebird.promisifyAll(client); // allows for chaining of .then and .catch

let startTime = Date.now();

let driver = () => {
	client
		.keysAsync("*")
		.then(keys => {
			let sum = 0,
				count = 0;
			keys.forEach(key => {
				client
					.typeAsync(key)
					.then(type => {
						// ideally this if/else block would be factored out into helper function:
						if (type === "list") {
							client
								.llenAsync(key)
								.then(l => {
									client
										.lrangeAsync(key, 0, l)
										.then(arr => {
											sum += checkSum(arr);
											count++;
											if (count === keys.length) {
												sendAnswer(sum);
												client.quit();
											}
										})
										.catch(e => console.log("lrange error: ", e));
								})
								.catch(e => console.log("llen error", e));
						} else if (type === "set") {
							client
								.smembersAsync(key)
								.then(arr => {
									sum += checkSum(arr);
									count++;
									if (count === keys.length) {
										sendAnswer(sum);
										client.quit();
									}
								})
								.catch(e => console.log("smembers error: ", e));
						} else {
							console.log("something unexpected happened!");
						}
					})
					.catch(e => {
						console.log("error getting type of key: ", e);
					});
			});
		})
		.catch(e => console.log(e));
};

/*
* @param {Number} sum - the calculated checkSum
* @return {void}
*/
let sendAnswer = sum => {
	http.get(`http://answer:3000/${sum}`, res => {
		console.log("response: ", res.statusCode);
		console.log("finished in: ", Date.now() - startTime, "ms");
	});
};

/*
* @param {array} row - an array of strings representing numbers in a row of data
* @return {boolean} - whether the row contains any numerical anagrams
*/
let containsAnagrams = row => {
	// copy the row to avoid mutating the input
	let copy = row.slice(),
		obj = {};
	for (var i = 0; i < copy.length; i++) {
		// sort the digits inside each number so anagrams will appear as the same string
		let key = copy[i]
			.split("")
			.sort((a, b) => b - a) // sort 9 to 0 to avoid leading zeros
			.join("");

		// if key exists already, an anagram exists:
		if (obj[parseInt(key)]) {
			return true;
		} else {
			obj[parseInt(key)] = true;
		}
	}
	// no anagrams were found:
	return false;
};

/*
* @param {array} row - a sorted array of numbers
* @return {boolean} - whether any two elements in the array can be divided to equal 177
*/
let divCheck = row => {
	let set = {},
		max = row[row.length - 1];
	for (var i = 0; i < row.length; i++) {
		set[row[i]] = true;
	}

	for (var key in set) {
		if (key * 177 > max) {
			return false;
		} else if (set[key * 177] !== undefined) {
			// a match exists:
			return true;
		}
	}
	// no matches were found:
	return false;
};

/*
* @param {array} row - a single row from the redis database
* @return {Number} sum - the checkSum calculated after processing the row
*/
let checkSum = row => {
	// check for anagrams before sorting because sorting is expensive and
	// we may be able to return early
	if (containsAnagrams(row)) {
		return 0;
	}
	// sort the row before calling divCheck
	let sortedRow = row.slice().sort((a, b) => parseInt(a) - parseInt(b));

	if (divCheck(sortedRow)) {
		return 0;
	}
	// no anagrams and no elements that divide to 177, so calculate diff:
	// min/max will be first and last elements in sortedRow
	return sortedRow[sortedRow.length - 1] - sortedRow[0];
};

// run the main function:
driver();

module.exports = {
	checkSum: checkSum,
	divCheck: divCheck,
	containsAnagrams: containsAnagrams
};
