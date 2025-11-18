# System Design Quick Reference

A concise cheat sheet for system design concepts and formulas.

## Capacity Estimation

### Basic Calculations
```
1 million users = ~12 requests/second (1 request/user/day)
1 billion users = ~12,000 requests/second

Storage:
- 1 million URLs × 500 bytes = 500 MB
- 1 million users × 1 KB = 1 GB

Bandwidth:
- 12 RPS × 1 KB = 12 KB/s = 1 MB/s
- 1,000 RPS × 1 KB = 1 MB/s = 8.64 GB/day
```

### Storage Estimates
- **Text**: ~1 byte per character
- **Image**: 200 KB - 2 MB average
- **Video**: 100 MB - 1 GB per minute
- **Database Row**: 1 KB - 10 KB average

### Throughput Estimates
- **Single Server**: 1,000 - 10,000 RPS
- **Database**: 10,000 - 100,000 reads/sec, 1,000 - 10,000 writes/sec
- **Cache**: 100,000 - 1,000,000 ops/sec
- **CDN**: Millions of requests/sec

## Availability & Reliability

### SLA Percentages
| Availability | Downtime/Year | Downtime/Month |
|-------------|---------------|----------------|
| 99%         | 3.65 days     | 7.2 hours      |
| 99.9%       | 8.76 hours    | 43.2 minutes   |
| 99.99%      | 52.56 minutes | 4.32 minutes   |
| 99.999%     | 5.26 minutes  | 25.9 seconds   |

### Redundancy
- **N+1**: One extra server (survive 1 failure)
- **2N**: Double capacity (survive 50% failures)
- **2N+1**: Double + one (survive 50% + 1 failure)

## Database

### SQL vs NoSQL
| Feature | SQL | NoSQL |
|---------|-----|-------|
| Schema | Fixed | Flexible |
| ACID | Yes | Usually No |
| Scaling | Vertical + Read Replicas | Horizontal |
| Joins | Yes | Limited |
| Use Case | Structured, Transactions | Unstructured, Scale |

### Sharding Strategies
- **Range-based**: Partition by ID ranges (1-1000, 1001-2000)
- **Hash-based**: hash(key) % num_shards
- **Directory-based**: Lookup table for partition

### Replication
- **Master-Slave**: 1 write, N reads
- **Master-Master**: N writes, N reads (conflict resolution needed)

## Caching

### Cache Hit Ratio
```
Hit Ratio = Cache Hits / (Cache Hits + Cache Misses)
Target: > 80% for good performance
```

### Cache Strategies
- **Cache-Aside**: App checks cache, loads from DB on miss
- **Write-Through**: Write to cache and DB simultaneously
- **Write-Back**: Write to cache, async write to DB
- **Refresh-Ahead**: Proactively refresh before expiration

### TTL Guidelines
- **Static Content**: 1 year
- **User Data**: 5-15 minutes
- **Session Data**: 30 minutes - 1 hour
- **Real-time Data**: 1-5 seconds

## Load Balancing

### Algorithms
- **Round Robin**: Sequential distribution
- **Weighted Round Robin**: Based on server capacity
- **Least Connections**: Fewest active connections
- **Least Response Time**: Fastest response
- **IP Hash**: Session affinity

### Health Checks
- **Interval**: 10-30 seconds
- **Timeout**: 5 seconds
- **Unhealthy Threshold**: 2-3 consecutive failures
- **Healthy Threshold**: 2-3 consecutive successes

## API Design

### HTTP Status Codes
- **2xx Success**: 200 OK, 201 Created, 204 No Content
- **3xx Redirection**: 301 Moved, 302 Found, 304 Not Modified
- **4xx Client Error**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests
- **5xx Server Error**: 500 Internal Error, 502 Bad Gateway, 503 Service Unavailable

### Rate Limiting
- **Token Bucket**: Refill tokens at fixed rate
- **Leaky Bucket**: Fixed output rate
- **Fixed Window**: Requests per time window
- **Sliding Window**: Rolling time window

### Pagination
- **Offset-based**: `?page=1&limit=20` (simple, but slow for large offsets)
- **Cursor-based**: `?cursor=abc123&limit=20` (faster, consistent)

## Performance

### Latency Percentiles
- **P50 (Median)**: 50% of requests faster
- **P95**: 95% of requests faster
- **P99**: 99% of requests faster
- **P99.9**: 99.9% of requests faster

### Target Latencies
- **Web Page Load**: < 3 seconds
- **API Response**: < 200ms (P95)
- **Database Query**: < 10ms (simple), < 100ms (complex)
- **Cache Lookup**: < 1ms

### Throughput Targets
- **Web Server**: 1,000 - 10,000 RPS
- **API Gateway**: 10,000 - 100,000 RPS
- **Database**: 10,000 reads/sec, 1,000 writes/sec
- **Cache**: 100,000+ ops/sec

## Distributed Systems

### CAP Theorem
Choose 2 of 3:
- **C**onsistency: All nodes see same data
- **A**vailability: System remains operational
- **P**artition Tolerance: Works despite network failures

**Common Choices**:
- **CP**: MongoDB, HBase (consistency + partition tolerance)
- **AP**: Cassandra, DynamoDB (availability + partition tolerance)

### Consistency Models
- **Strong**: All reads see latest write
- **Eventual**: Will become consistent over time
- **Weak**: No guarantees

### Consensus Algorithms
- **Paxos**: Classic, complex
- **Raft**: Understandable, widely used
- **PBFT**: Byzantine fault tolerance

## Message Queues

### Queue Types
- **Point-to-Point**: One producer, one consumer
- **Publish-Subscribe**: One producer, multiple consumers

### Delivery Guarantees
- **At-most-once**: May lose messages
- **At-least-once**: May duplicate messages (need idempotency)
- **Exactly-once**: Guaranteed once (hardest to achieve)

### Popular Queues
- **RabbitMQ**: Complex routing, AMQP
- **Kafka**: High throughput, event streaming
- **SQS**: Managed, simple
- **Redis**: Simple pub/sub, fast

## Security

### Authentication
- **JWT**: Stateless tokens, expires
- **OAuth 2.0**: Delegated authorization
- **Session**: Server-side state

### Password Security
- **Hashing**: bcrypt, Argon2 (never plain text)
- **Salt**: Random data added before hashing
- **Pepper**: Secret key added before hashing

### Encryption
- **In Transit**: TLS 1.2+ (HTTPS)
- **At Rest**: AES-256 encryption
- **Key Management**: Rotate keys regularly

## Monitoring

### Key Metrics
- **Request Rate**: Requests per second
- **Error Rate**: % of failed requests
- **Latency**: P50, P95, P99 response times
- **Throughput**: Operations per second
- **CPU/Memory**: Resource utilization

### Alert Thresholds
- **Error Rate**: > 1% for 5 minutes
- **Latency**: P95 > 500ms for 5 minutes
- **CPU**: > 80% for 10 minutes
- **Memory**: > 90% for 5 minutes
- **Disk**: > 85% full

## Common Patterns

### URL Shortener
- Base62 encoding (a-z, A-Z, 0-9) = 62 characters
- 6 characters = 62^6 = 56.8 billion URLs
- 7 characters = 62^7 = 3.5 trillion URLs

### ID Generation
- **UUID**: 128 bits, globally unique
- **Snowflake**: Twitter's ID generator (timestamp + machine + sequence)
- **Database Auto-increment**: Simple but not distributed-friendly

### Bloom Filter
- Probabilistic data structure
- Check if element exists (may have false positives, no false negatives)
- Space efficient
- Use case: Check if URL exists before database lookup

## Design Checklist

### Functional Requirements
- [ ] Core features defined
- [ ] User stories clear
- [ ] Edge cases considered

### Non-Functional Requirements
- [ ] Scale (users, requests, data)
- [ ] Performance (latency, throughput)
- [ ] Availability (SLA target)
- [ ] Consistency requirements

### Architecture
- [ ] High-level design diagram
- [ ] API endpoints defined
- [ ] Database schema designed
- [ ] Technology stack chosen

### Scalability
- [ ] Horizontal scaling plan
- [ ] Database sharding strategy
- [ ] Caching strategy
- [ ] Load balancing

### Reliability
- [ ] Redundancy plan
- [ ] Failover mechanism
- [ ] Data backup strategy
- [ ] Disaster recovery

### Security
- [ ] Authentication/Authorization
- [ ] Input validation
- [ ] Encryption (in transit, at rest)
- [ ] Rate limiting

### Monitoring
- [ ] Key metrics identified
- [ ] Logging strategy
- [ ] Alerting rules
- [ ] Dashboard design

## Interview Tips

1. **Clarify First**: Ask questions about requirements
2. **Start Simple**: Basic design, then optimize
3. **Think Scale**: Millions of users, billions of requests
4. **Discuss Trade-offs**: Every decision has pros/cons
5. **Draw Diagrams**: Visualize the system
6. **Calculate**: Back-of-envelope math
7. **Consider Failure**: What can go wrong?
8. **Iterate**: Refine based on feedback

## Common Mistakes to Avoid

- ❌ Over-engineering from the start
- ❌ Ignoring scale requirements
- ❌ Single point of failure
- ❌ No caching strategy
- ❌ Ignoring security
- ❌ No monitoring plan
- ❌ Not considering failure scenarios
- ❌ Forgetting about data consistency

---

*Keep this reference handy during system design interviews and architecture discussions!*

