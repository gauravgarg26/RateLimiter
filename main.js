const express = require('express');
const TokenBucket = require('./tokenBucket');
const config = require('./config.json');
 


const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize an empty object to store rate limits for different endpoints
const rateLimits = {};

// Configure rate limits based on the values in the config.json file
config.rateLimitsPerEndpoint.forEach((routeConfig) => {
  const { endpoint, burst, sustained } = routeConfig;
  rateLimits[endpoint] = new TokenBucket(burst, sustained);
});

// Define a route handler for the "/take" endpoint
app.get('/take', (req, res) => {
  const { endpoint } = req.query;

  // Check if the provided endpoint is valid and has a rate limit configuration
  if (!endpoint || !rateLimits[endpoint]) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  // Get the token bucket for the specified endpoint
  const tokenBucket = rateLimits[endpoint];
  const remainingTokens = tokenBucket.getRemainingTokens();

  // If a token is available, consume it and return a success response
  if (tokenBucket.consumeToken()) {
    return res.json({ remainingTokens : remainingTokens - 1, accept: true });
  }
  
  // If no token is available, return a rejection response
  return res.json({ remainingTokens: 0, accept: false });
});

module.exports = app;