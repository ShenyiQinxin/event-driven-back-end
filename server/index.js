
const needle = require('needle')
const config = require('dotenv').config()

const TOKEN = process.env.TWITTER_BEARER_TOKEN

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

const rules = [{
  'value': 'dog has:images -is:retweet',
  'tag': 'dog pictures'
},
{
  'value': 'cat has:images -grumpy',
  'tag': 'cat pictures'
},
];

async function getRules() {
  const response = await needle('get', rulesURL, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (response.statusCode !== 200) {
    console.log("Error:", response.statusMessage, response.statusCode)
    throw new Error(response.body)
  }
  return (response.body)
}

async function setRules() {
  const data = {'add': rules}
  const response = await needle('post', rulesURL, data, { headers: { 
    'content-type': 'application/json',
    Authorization: `Bearer ${TOKEN}` } });
  
  return (response.body)
}

async function deleteRules() {
  const data = {'add': rules}
  const response = await needle('post', rulesURL, data, { headers: { 
    'content-type': 'application/json',
    Authorization: `Bearer ${TOKEN}` } });
  
  return (response.body)
}

function listenToStream(retryAttempt) {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      "Authorization": `Bearer ${TOKEN}`
    },
    timeout: 20000
  });
  stream.on('data', data => {
    try {
      const json = JSON.parse(data);
      console.log(json)
      retryAttempt = 0
    } catch (e) {
      if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
        console.log(data.detail)
        process.exit(1)
      } else {
        // Keep alive signal received. Do nothing.
      }
    }
  }).on('err', error => {
    if (error.code !== 'ECONNRESET') {
      console.log(error.code);
      process.exit(1);
    } else {
      // This reconnection logic will attempt to reconnect when a disconnection is detected.
      // To avoid rate limits, this logic implements exponential backoff, so the wait time
      // will increase if the client cannot reconnect to the stream. 
      setTimeout(() => {
        console.warn("A connection error occurred. Reconnecting...")
        streamConnect(++retryAttempt);
      }, 2 ** retryAttempt)
    }
  })
  return stream;
}

(async () => {
  let currentRules;
  try {
    await setRules();
    currentRules = await getRules();
    console.log(currentRules)
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  // const data = listenToStream(0);
  // console.log(data)

})();