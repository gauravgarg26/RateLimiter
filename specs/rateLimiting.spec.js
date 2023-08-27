const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../main');

chai.use(chaiHttp);

const { request, expect } = chai;


describe('Rate Limiting Service', () => {
  
  it('should return remaining tokens and accept true when tokens are available', async () => {
    const response = await request(app).get('/take').query({ endpoint: 'GET /user/:id' });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('remainingTokens');
    expect(response.body.accept).to.equal(true);
  });
  
  it('should return remaining tokens and accept false when tokens are not available', async () => {
    // Test when tokens are not available (e.g., reach burst limit)
    // Make multiple requests in quick succession to consume all tokens
    const requests = [];
    for (let i = 0; i < 15; i++) {
      requests.push(request(app).get('/take').query({ endpoint: 'PATCH /user/:id' }));
    }
    const responses = await Promise.all(requests);
    expect(responses[0].body.accept).to.equal(true);
    expect(responses[responses.length -1].body.accept).to.equal(false);
  });
  
  it('should refill tokens based on sustained rate, waiting for 100ms', async () => {
    // Test when tokens are consumed and then refilled based on the sustained rate
    const response1 = await request(app).get('/take').query({ endpoint: 'POST /test' });
    
    // Wait for enough time to pass to trigger token refill
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 0.1 seconds //after 0.06 seconds one token will add
    
    const response2 = await request(app).get('/take').query({ endpoint: 'POST /test' });
    
    expect(response1.body.remainingTokens).to.equal(2999); // Burst limit is 3000 and sustained is 1000
    expect(response2.body.remainingTokens).to.equal(2999);
  });
  
  // Can sdd more test cases with different mock configurations but limitation is we can't use lib which handled mock data like proxyquire, sinon
});