const redis = require('redis');
const client = redis.createClient(6379, 'redis://redis');

client.on('error', err => {
	console.log('connection error: ', err);
});

// export a function that does the following:
	// formats the data into an array of arrays
	// calls checkSum on the data
	// makes GET request with result of checkSum(data) to `http://answer:3000/${result}`
module.exports.processData = (cb) => {
	client.multi()
  .keys('*')
  .exec((err, replies) => {
    if (err) throw err;
    console.log('replies: ', replies);
    cb(replies);
    client.quit();
  });
}