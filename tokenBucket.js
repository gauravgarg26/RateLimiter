class TokenBucket {
  constructor(burst, sustained) {
    // Initialize the token bucket with burst and sustained rate values
    this.burst = burst;
    this.sustained = sustained;
    this.tokens = burst;
    this.lastRefillTimestamp = Date.now();
    this.refillInterval = (60 * 1000) / sustained; // Interval in milliseconds
  }
  
  // Refills the token bucket based on time elapsed since last refill
  refillTokens() {
    const now = Date.now();
    const timeElapsed = now - this.lastRefillTimestamp;
    const tokensToAdd = Math.floor(timeElapsed / this.refillInterval);

    // Add tokens to the bucket if time has passed since the last refill
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.burst);
      this.lastRefillTimestamp = now;
    }
  }

  // Consumes a token from the bucket if available
  consumeToken() {
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
  
  // Gets the current number of remaining tokens after refilling
  getRemainingTokens() {
    this.refillTokens(); // Ensure tokens are refilled before getting remaining count
    return this.tokens; // Return the current token count
  }
}

module.exports = TokenBucket;