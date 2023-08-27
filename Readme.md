# Rate Limiting Service

This is a small standalone service designed to provide rate limiting capabilities for client-facing services using the token bucket algorithm. The service enforces rate limits based on burst and sustained request rates for specified endpoints.


## Implementation

The Rate Limiting Service is designed to manage the rate at which incoming requests are accepted for various endpoints using the token bucket algorithm. This mechanism ensures that clients can make requests within specified rate limits defined by burst and sustained rates.

`Token Bucket Algorithm:`
The service employs the token bucket algorithm to control request rates. Upon initialization, each endpoint is associated with a token bucket configured with a burst limit (maximum burst tokens) and a sustained rate (tokens added per sustained interval). As requests arrive, tokens are consumed from the bucket. If tokens are available, the request is accepted, and the bucket's token count decreases. The bucket refills tokens at the sustained rate, maintaining a maximum of burst tokens.

This approach provides effective rate limiting while accommodating occasional bursts of traffic and maintaining a steady request flow over time.

`Refill Mechanism: `
The refill mechanism was implemented to ensure that tokens are replenished at the specified sustained rate. The service keeps track of the last refill time for each endpoint and calculates the number of tokens that should be added since the last refill. This approach ensures that the tokens are available as soon as possible, without waiting for fixed intervals.

## Assumptions
- No Rate Limit Changes at Runtime: The current implementation assumes that rate limit configurations (burst and sustained) do not change at runtime. This means that if you need to adjust the rate limits for specific endpoints, you would need to restart the rate limiting service.

- Single Instance, No Scaling: The code assumes that the rate limiting service will run as a single instance. There is no consideration for distributing the service across multiple instances or nodes to handle increased load.

- In-Memory Storage: The service uses in-memory storage to keep track of rate limit information. This assumption implies that the rate limit state will be lost if the service restarts, which may not be ideal for maintaining consistent rate limiting across restarts.

- Request URI as Endpoint Identifier: The assumption is that the client will provide the full request URI (including HTTP method and path) as the endpoint parameter. This is used to identify the endpoint's rate limit configuration.

- No Authentication or Authorization: The service assumes that it will run in a trusted network environment without the need for authentication or authorization. This means any client can access the /take endpoint without authentication.

- Instantaneous Refill: The refill of tokens is assumed to occur instantaneously whenever the service determines that tokens need to be refilled. The current implementation calculates the number of tokens that should be added since the last refill and adds them immediately.

- Lack of Advanced Throttling: While the Token Bucket algorithm is used for rate limiting, more advanced throttling mechanisms (such as burst protection) are not considered in this implementation.

- Limited Error Handling: The current implementation provides basic error handling, but it may not cover all possible error scenarios or provide detailed error messages for troubleshooting.

- Assumption about Request Format: The assumption is that the endpoint parameter is provided directly in the query string as ?endpoint=.... The code does not handle other formats for providing the endpoint, such as in the request body or as part of the route parameters.

## Future Considerations

For future improvements, considerations could include:

- Persistent State: Implementing a persistence layer (e.g., a database) for storing rate limit state would ensure that the state is not lost on service restarts.
- Rate Limit Enforcement: Consider implementing rate limit enforcement as a middleware to be easily integrated into different services.
- Distributed State: If scaling to multiple instances, explore distributed caching solutions to manage state across instances.


## Note
The test suite is designed to cover basic scenarios using the provided configuration. Adding more comprehensive test cases, especially edge cases and error scenarios, would require additional testing libraries like proxyquire and sinon for mocking external dependencies. Unfortunately, the current limitation of not being able to install additional npm packages constrains the scope of test case coverage.