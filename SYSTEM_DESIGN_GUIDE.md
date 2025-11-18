# Complete System Design Guide

A comprehensive reference for system design concepts, patterns, and best practices.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Scalability](#scalability)
3. [Database Design](#database-design)
4. [Caching Strategies](#caching-strategies)
5. [Load Balancing](#load-balancing)
6. [API Design](#api-design)
7. [Microservices vs Monolith](#microservices-vs-monolith)
8. [Distributed Systems](#distributed-systems)
9. [Message Queues](#message-queues)
10. [CDN & Content Delivery](#cdn--content-delivery)
11. [Security](#security)
12. [Monitoring & Observability](#monitoring--observability)
13. [Performance Optimization](#performance-optimization)
14. [Design Patterns](#design-patterns)
15. [Common System Design Problems](#common-system-design-problems)

---

## Core Principles

### 1. Scalability
- **Vertical Scaling (Scale Up)**: Increase resources on a single machine (CPU, RAM, storage)
  - Pros: Simple, no code changes needed
  - Cons: Limited by hardware, expensive, single point of failure
- **Horizontal Scaling (Scale Out)**: Add more machines to handle load
  - Pros: Unlimited scaling, cost-effective, fault-tolerant
  - Cons: Requires distributed systems knowledge, data consistency challenges

### 2. Reliability & Availability
- **Reliability**: System continues to work correctly even when things go wrong
- **Availability**: System remains operational and accessible
- **SLA (Service Level Agreement)**: 
  - 99.9% = 8.76 hours downtime/year
  - 99.99% = 52.56 minutes downtime/year
  - 99.999% = 5.26 minutes downtime/year

### 3. Performance
- **Latency**: Time to complete a single operation
- **Throughput**: Number of operations completed per unit time
- **Response Time**: Time from request to response
- **P50/P95/P99 Percentiles**: Measure of latency distribution

### 4. Maintainability
- **Operability**: Easy to operate and monitor
- **Simplicity**: Easy to understand and modify
- **Evolvability**: Easy to adapt to changing requirements

---

## Scalability

### Capacity Planning
1. **Estimate Traffic**
   - Daily Active Users (DAU)
   - Requests per second (RPS)
   - Read/Write ratio
   - Data storage requirements

2. **Back-of-the-Envelope Calculations**
   - 1 million users = ~12 requests/second (assuming 1 request/user/day)
   - Storage: 1 million URLs × 500 bytes = 500 MB
   - Bandwidth: 12 RPS × 1 KB = 12 KB/s

### Scaling Strategies

#### Read Scaling
- **Read Replicas**: Multiple database copies for read operations
- **Caching**: Redis, Memcached for frequently accessed data
- **CDN**: Cache static content at edge locations

#### Write Scaling
- **Sharding/Partitioning**: Split data across multiple databases
- **Write-Ahead Logs**: Optimize write operations
- **Asynchronous Processing**: Queue writes for later processing

### Bottleneck Identification
1. **CPU Bound**: Computation-intensive tasks
   - Solution: More CPU cores, algorithm optimization
2. **Memory Bound**: Insufficient RAM
   - Solution: Increase memory, optimize data structures
3. **I/O Bound**: Disk or network limitations
   - Solution: SSDs, faster networks, caching
4. **Database Bound**: Database is the bottleneck
   - Solution: Read replicas, caching, query optimization

---

## Database Design

### Database Types

#### SQL (Relational)
- **ACID Properties**: Atomicity, Consistency, Isolation, Durability
- **Examples**: PostgreSQL, MySQL, SQL Server
- **Use Cases**: Structured data, transactions, complex queries
- **Scaling**: Vertical scaling, read replicas, sharding

#### NoSQL
- **Document Stores**: MongoDB, CouchDB
  - Use: Flexible schemas, hierarchical data
- **Key-Value Stores**: Redis, DynamoDB
  - Use: Caching, session storage, simple lookups
- **Column Stores**: Cassandra, HBase
  - Use: Time-series data, analytics, wide tables
- **Graph Databases**: Neo4j, Amazon Neptune
  - Use: Social networks, recommendation engines

### Database Patterns

#### Replication
- **Master-Slave (Primary-Replica)**: 
  - One master handles writes, multiple replicas handle reads
  - Replication lag can cause stale reads
- **Master-Master**: 
  - Multiple masters can handle writes
  - Conflict resolution needed

#### Sharding/Partitioning
- **Horizontal Partitioning**: Split data across multiple databases
  - **Strategies**:
    - Range-based: Partition by ID ranges
    - Hash-based: Hash key determines partition
    - Directory-based: Lookup table for partition mapping
- **Vertical Partitioning**: Split tables by columns
- **Challenges**:
  - Joins across shards are expensive
  - Rebalancing is complex
  - Cross-shard transactions are difficult

#### Indexing
- **Primary Index**: Unique identifier (usually primary key)
- **Secondary Index**: Additional indexes for faster queries
- **Composite Index**: Multiple columns
- **Trade-offs**: Faster reads, slower writes, more storage

### Database Optimization
1. **Query Optimization**
   - Use indexes appropriately
   - Avoid N+1 queries
   - Use EXPLAIN to analyze queries
   - Limit result sets
2. **Connection Pooling**
   - Reuse database connections
   - Reduce connection overhead
3. **Denormalization**
   - Trade storage for read performance
   - Reduce joins

---

## Caching Strategies

### Cache Types

#### In-Memory Cache
- **Redis**: Advanced data structures, persistence options
- **Memcached**: Simple key-value store, high performance
- **Use Cases**: Session storage, frequently accessed data

#### Application Cache
- **Local Cache**: In-process cache (e.g., Guava Cache)
- **Distributed Cache**: Shared across instances (e.g., Redis)

#### CDN Cache
- Cache static content at edge locations
- Reduce latency for global users

### Caching Patterns

#### Cache-Aside (Lazy Loading)
```
1. Check cache
2. If miss, read from database
3. Write to cache
4. Return data
```
- **Pros**: Simple, cache only what's needed
- **Cons**: Cache miss penalty, potential stale data

#### Write-Through
```
1. Write to database
2. Write to cache
```
- **Pros**: Cache always consistent
- **Cons**: Write latency, cache pollution

#### Write-Back (Write-Behind)
```
1. Write to cache
2. Asynchronously write to database
```
- **Pros**: Fast writes
- **Cons**: Risk of data loss, complexity

#### Refresh-Ahead
- Proactively refresh cache before expiration
- Reduces cache misses

### Cache Invalidation
- **TTL (Time To Live)**: Automatic expiration
- **Invalidation**: Explicit removal
- **Write-Through**: Update cache on write
- **Cache Stampede**: Multiple requests miss cache simultaneously
  - Solution: Locking, probabilistic early expiration

### Cache Design Considerations
- **Cache Size**: LRU, LFU eviction policies
- **Consistency**: Eventual consistency vs strong consistency
- **Cache Warming**: Pre-populate cache with hot data
- **Cache Key Design**: Include version, namespace

---

## Load Balancing

### Load Balancer Types

#### Layer 4 (Transport Layer)
- Routes based on IP and port
- Fast, low overhead
- No content awareness

#### Layer 7 (Application Layer)
- Routes based on HTTP headers, URL, cookies
- More intelligent routing
- SSL termination
- Higher overhead

### Load Balancing Algorithms

1. **Round Robin**: Distribute requests sequentially
2. **Weighted Round Robin**: Assign weights to servers
3. **Least Connections**: Route to server with fewest connections
4. **Least Response Time**: Route to fastest server
5. **IP Hash**: Route based on client IP (session affinity)
6. **Geographic**: Route based on geographic location

### Load Balancer Placement

#### Client → Load Balancer → Servers
- Single point of failure
- Solution: Multiple load balancers with health checks

#### DNS Load Balancing
- Multiple IP addresses for a domain
- Client chooses IP
- Simple but less control

### Health Checks
- **Active**: Load balancer sends requests to check health
- **Passive**: Monitor actual traffic for errors
- **Graceful Degradation**: Remove unhealthy servers gradually

---

## API Design

### RESTful API Principles
- **Resources**: Nouns (e.g., `/users`, `/orders`)
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Status Codes**: 200, 201, 400, 401, 404, 500
- **Stateless**: Each request contains all necessary information

### API Versioning
- **URL Versioning**: `/v1/users`, `/v2/users`
- **Header Versioning**: `Accept: application/vnd.api+json;version=1`
- **Query Parameter**: `/users?version=1`

### API Design Best Practices
1. **Consistent Naming**: Use plural nouns, lowercase with hyphens
2. **Pagination**: Limit results, use cursor or offset-based
3. **Filtering & Sorting**: Query parameters for flexibility
4. **Rate Limiting**: Prevent abuse, return appropriate headers
5. **Error Handling**: Consistent error format
6. **Documentation**: OpenAPI/Swagger specifications

### GraphQL
- **Single Endpoint**: `/graphql`
- **Client-Specified Queries**: Request only needed fields
- **Strongly Typed**: Schema defines available data
- **Trade-offs**: More complex, potential N+1 queries

### gRPC
- **Protocol Buffers**: Efficient binary serialization
- **HTTP/2**: Multiplexing, header compression
- **Streaming**: Bidirectional streaming support
- **Use Cases**: Microservices, high-performance APIs

---

## Microservices vs Monolith

### Monolithic Architecture
- **Single Deployable Unit**: All components in one application
- **Pros**: 
  - Simple development and deployment
  - Easier testing and debugging
  - ACID transactions across components
- **Cons**:
  - Tight coupling
  - Difficult to scale individual components
  - Technology lock-in
  - Deployment risk (all or nothing)

### Microservices Architecture
- **Independent Services**: Each service is a separate application
- **Pros**:
  - Technology diversity
  - Independent scaling
  - Fault isolation
  - Team autonomy
- **Cons**:
  - Distributed system complexity
  - Network latency
  - Data consistency challenges
  - Operational overhead

### When to Use Each

#### Start with Monolith If:
- Small team
- Unclear domain boundaries
- Need rapid development
- Simple application

#### Move to Microservices If:
- Clear service boundaries
- Need independent scaling
- Multiple teams
- Different technology requirements

### Microservices Patterns
- **API Gateway**: Single entry point for clients
- **Service Discovery**: Find available service instances
- **Circuit Breaker**: Prevent cascade failures
- **Saga Pattern**: Manage distributed transactions
- **Event Sourcing**: Store events instead of state
- **CQRS**: Separate read and write models

---

## Distributed Systems

### CAP Theorem
In a distributed system, you can only guarantee 2 of 3:
- **Consistency**: All nodes see same data simultaneously
- **Availability**: System remains operational
- **Partition Tolerance**: System continues despite network failures

**Trade-offs**:
- **CP**: Strong consistency, partition tolerant (e.g., MongoDB, HBase)
- **AP**: High availability, partition tolerant (e.g., Cassandra, DynamoDB)
- **CA**: Not possible in distributed systems (only in single-node systems)

### Consistency Models

#### Strong Consistency
- All reads receive most recent write
- Linearizability, sequential consistency

#### Eventual Consistency
- System will become consistent over time
- Common in distributed systems
- Acceptable for many use cases

#### Weak Consistency
- No guarantees about when consistency is achieved
- Fastest but least predictable

### Distributed System Challenges

#### Network Partitions
- Split-brain problem
- Solution: Quorum-based decisions, leader election

#### Clock Synchronization
- Distributed systems need synchronized clocks
- NTP (Network Time Protocol)
- Logical clocks (Lamport timestamps, Vector clocks)

#### Consensus Algorithms
- **Paxos**: Classic consensus algorithm
- **Raft**: More understandable alternative
- **PBFT**: Byzantine fault tolerance

### Distributed Transactions
- **Two-Phase Commit (2PC)**: Coordinator manages transaction
  - Pros: Strong consistency
  - Cons: Blocking, single point of failure
- **Saga Pattern**: Sequence of local transactions
  - Compensating transactions for rollback
- **Eventual Consistency**: Accept temporary inconsistency

---

## Message Queues

### Why Use Message Queues?
- **Decoupling**: Services don't need to know about each other
- **Asynchronous Processing**: Non-blocking operations
- **Reliability**: Guaranteed delivery
- **Scalability**: Handle traffic spikes
- **Ordering**: Process messages in order

### Message Queue Patterns

#### Point-to-Point (Queue)
- One producer, one consumer
- Message consumed once
- Example: Task queue

#### Publish-Subscribe (Topic)
- One producer, multiple consumers
- Message delivered to all subscribers
- Example: Event notifications

### Popular Message Queues

#### RabbitMQ
- AMQP protocol
- Complex routing
- Good for complex workflows

#### Apache Kafka
- High throughput
- Distributed log
- Event streaming platform
- Good for event sourcing, log aggregation

#### Amazon SQS
- Managed service
- Simple API
- At-least-once delivery

#### Redis Pub/Sub
- Simple pub/sub
- No persistence
- Good for real-time notifications

### Message Queue Best Practices
1. **Idempotency**: Handle duplicate messages
2. **Dead Letter Queue**: Store failed messages
3. **Message Ordering**: Ensure order when needed
4. **Batching**: Group messages for efficiency
5. **Monitoring**: Track queue depth, processing time

---

## CDN & Content Delivery

### What is a CDN?
- **Content Delivery Network**: Distributed servers worldwide
- Cache content at edge locations
- Reduce latency for end users

### CDN Benefits
- **Lower Latency**: Content served from nearest location
- **Reduced Server Load**: Offload traffic from origin
- **High Availability**: Multiple edge locations
- **Bandwidth Savings**: Reduce origin bandwidth costs

### CDN Use Cases
- **Static Assets**: Images, CSS, JavaScript
- **Video Streaming**: Large media files
- **API Responses**: Cacheable API responses
- **Dynamic Content**: Edge computing

### CDN Caching Strategies
- **Cache-Control Headers**: Control caching behavior
- **Cache Invalidation**: Purge cache when content changes
- **Edge Computing**: Run code at edge locations (Cloudflare Workers, AWS Lambda@Edge)

### Popular CDNs
- **Cloudflare**: Free tier, DDoS protection
- **AWS CloudFront**: Integrated with AWS services
- **Fastly**: Real-time cache purging
- **Akamai**: Enterprise-grade CDN

---

## Security

### Authentication & Authorization

#### Authentication (Who are you?)
- **Password-based**: Hash passwords (bcrypt, Argon2)
- **Token-based**: JWT, OAuth 2.0
- **Multi-factor Authentication (MFA)**: Additional security layer
- **Single Sign-On (SSO)**: One login for multiple services

#### Authorization (What can you do?)
- **Role-Based Access Control (RBAC)**: Permissions based on roles
- **Attribute-Based Access Control (ABAC)**: Permissions based on attributes
- **OAuth 2.0**: Delegated authorization
- **JWT**: Stateless authentication tokens

### Security Best Practices

#### Input Validation
- Validate all inputs
- Sanitize user data
- Prevent injection attacks (SQL, XSS, Command)

#### Encryption
- **In Transit**: TLS/SSL for network communication
- **At Rest**: Encrypt stored data
- **Key Management**: Secure key storage and rotation

#### API Security
- **Rate Limiting**: Prevent abuse
- **API Keys**: Authenticate API clients
- **CORS**: Control cross-origin requests
- **HTTPS Only**: Encrypt all communications

#### Common Vulnerabilities
- **SQL Injection**: Use parameterized queries
- **XSS (Cross-Site Scripting)**: Sanitize output
- **CSRF (Cross-Site Request Forgery)**: Use tokens
- **DDoS**: Rate limiting, CDN, load balancers

### Security Headers
- **HSTS**: Force HTTPS
- **CSP**: Prevent XSS attacks
- **X-Frame-Options**: Prevent clickjacking
- **X-Content-Type-Options**: Prevent MIME sniffing

---

## Monitoring & Observability

### Three Pillars of Observability

#### 1. Metrics
- **Quantitative Measurements**: CPU, memory, request rate
- **Time Series Data**: Values over time
- **Examples**: Prometheus, CloudWatch, Datadog
- **Types**:
  - **Counter**: Incrementing value (total requests)
  - **Gauge**: Value that goes up/down (current connections)
  - **Histogram**: Distribution of values (response time)

#### 2. Logging
- **Event Records**: What happened and when
- **Structured Logging**: JSON format for parsing
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Examples**: ELK Stack, Splunk, CloudWatch Logs
- **Best Practices**:
  - Include context (user ID, request ID)
  - Avoid sensitive data
  - Use appropriate log levels

#### 3. Tracing
- **Request Flow**: Follow request through system
- **Distributed Tracing**: Track across services
- **Examples**: Jaeger, Zipkin, AWS X-Ray
- **Benefits**:
  - Identify bottlenecks
  - Debug distributed systems
  - Understand dependencies

### Key Metrics to Monitor

#### Application Metrics
- **Request Rate**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Latency**: P50, P95, P99 response times
- **Throughput**: Operations per second

#### Infrastructure Metrics
- **CPU Usage**: Processor utilization
- **Memory Usage**: RAM consumption
- **Disk I/O**: Read/write operations
- **Network I/O**: Bandwidth usage

#### Business Metrics
- **User Signups**: New users per day
- **Revenue**: Sales, transactions
- **Active Users**: DAU, MAU
- **Conversion Rates**: Key business KPIs

### Alerting
- **Threshold-based**: Alert when metric exceeds threshold
- **Anomaly Detection**: Alert on unusual patterns
- **Alert Fatigue**: Avoid too many alerts
- **On-Call Rotation**: Distribute responsibility

### Dashboards
- **Real-time Monitoring**: Current system state
- **Historical Analysis**: Trends over time
- **Service Health**: Overall system status
- **Business KPIs**: Key business metrics

---

## Performance Optimization

### Frontend Optimization

#### Asset Optimization
- **Minification**: Reduce file sizes
- **Compression**: Gzip, Brotli
- **Image Optimization**: WebP, lazy loading
- **Code Splitting**: Load only needed code
- **Tree Shaking**: Remove unused code

#### Caching
- **Browser Caching**: Cache-Control headers
- **Service Workers**: Offline support
- **CDN**: Cache static assets

#### Rendering
- **Server-Side Rendering (SSR)**: Faster initial load
- **Static Site Generation (SSG)**: Pre-render pages
- **Lazy Loading**: Load content on demand
- **Virtual Scrolling**: Render only visible items

### Backend Optimization

#### Database
- **Indexing**: Fast lookups
- **Query Optimization**: Efficient queries
- **Connection Pooling**: Reuse connections
- **Read Replicas**: Distribute read load

#### Caching
- **Application Cache**: In-memory caching
- **Database Query Cache**: Cache query results
- **CDN**: Cache API responses

#### Code Optimization
- **Algorithm Optimization**: Better time complexity
- **Async Processing**: Non-blocking operations
- **Batch Processing**: Group operations
- **Connection Reuse**: HTTP keep-alive

### System-Level Optimization
- **Load Balancing**: Distribute traffic
- **Auto-scaling**: Scale based on load
- **Resource Allocation**: Right-size instances
- **Network Optimization**: Reduce latency

---

## Design Patterns

### Architectural Patterns

#### Layered Architecture
- **Presentation Layer**: UI, API endpoints
- **Business Logic Layer**: Core functionality
- **Data Access Layer**: Database interactions
- **Pros**: Clear separation, easy to understand
- **Cons**: Can be rigid, performance overhead

#### Event-Driven Architecture
- **Events**: Something happened
- **Event Producers**: Generate events
- **Event Consumers**: React to events
- **Event Bus**: Routes events
- **Pros**: Loose coupling, scalability
- **Cons**: Complexity, eventual consistency

#### CQRS (Command Query Responsibility Segregation)
- **Commands**: Write operations
- **Queries**: Read operations
- **Separate Models**: Different models for read/write
- **Pros**: Independent scaling, optimization
- **Cons**: Complexity, data synchronization

### Design Patterns for Scalability

#### Sharding
- Split data across multiple databases
- Horizontal partitioning
- Key considerations: Shard key, rebalancing

#### Replication
- Multiple copies of data
- Read replicas for scaling reads
- Master-slave or master-master

#### Caching
- Store frequently accessed data
- Multiple cache layers
- Cache invalidation strategies

#### Load Balancing
- Distribute requests across servers
- Multiple algorithms
- Health checks

---

## Common System Design Problems

### URL Shortener (like bit.ly)
**Requirements**:
- Shorten long URLs
- Redirect to original URL
- Handle high traffic
- Track analytics

**Design**:
- Base62 encoding for short URLs
- Database for URL mapping
- Cache for hot URLs
- Load balancers for traffic distribution

### Twitter/X Feed
**Requirements**:
- Post tweets
- Follow users
- View timeline (home feed)
- Real-time updates

**Design**:
- Fan-out on write vs read
- Timeline generation strategies
- Caching user timelines
- Real-time updates (WebSockets, Server-Sent Events)

### Chat System (WhatsApp, Slack)
**Requirements**:
- Send/receive messages
- Group chats
- Online status
- Message delivery status

**Design**:
- WebSocket for real-time communication
- Message queue for reliability
- Database for message history
- Presence service for online status

### Video Streaming (YouTube, Netflix)
**Requirements**:
- Upload videos
- Stream videos
- Support multiple qualities
- Handle high traffic

**Design**:
- CDN for video delivery
- Video encoding pipeline
- Adaptive bitrate streaming
- Distributed storage

### Search Engine (Google)
**Requirements**:
- Index web pages
- Fast search results
- Rank results by relevance
- Handle billions of queries

**Design**:
- Web crawler
- Inverted index
- Distributed search
- Ranking algorithms

### Rate Limiter
**Requirements**:
- Limit requests per user/IP
- Multiple algorithms
- Distributed system support

**Design**:
- Token bucket algorithm
- Sliding window log
- Redis for distributed rate limiting

### Distributed Cache
**Requirements**:
- High availability
- Consistency
- Partition tolerance
- Fast access

**Design**:
- Consistent hashing
- Replication strategy
- Cache eviction policies
- Cache invalidation

### Notification System
**Requirements**:
- Multiple channels (email, SMS, push)
- High throughput
- Reliable delivery
- User preferences

**Design**:
- Message queue
- Worker pools per channel
- Retry mechanism
- User preference service

---

## System Design Interview Process

### 1. Clarify Requirements (5-10 min)
- **Functional Requirements**: What the system should do
- **Non-Functional Requirements**: Performance, scalability, availability
- **Scale**: Users, requests, data size
- **Assumptions**: Make reasonable assumptions

### 2. High-Level Design (10-15 min)
- **Architecture Diagram**: Main components
- **API Design**: Endpoints, request/response
- **Database Schema**: Tables, relationships
- **Technology Stack**: Choose appropriate technologies

### 3. Detailed Design (15-20 min)
- **Scaling**: How to handle growth
- **Caching**: What to cache, where
- **Load Balancing**: How to distribute load
- **Database**: Replication, sharding
- **Security**: Authentication, authorization

### 4. Identify Bottlenecks (5-10 min)
- **Single Points of Failure**: How to eliminate
- **Scalability Issues**: How to scale
- **Performance**: How to optimize

### 5. Trade-offs & Alternatives (5 min)
- **Discuss Alternatives**: Why chosen approach
- **Trade-offs**: Pros and cons
- **Future Improvements**: How to evolve

### Key Tips
- **Think Out Loud**: Explain your reasoning
- **Ask Questions**: Clarify ambiguous requirements
- **Start Simple**: Begin with basic design, then optimize
- **Consider Scale**: Think about millions of users
- **Discuss Trade-offs**: No perfect solution

---

## Key Takeaways

1. **Start Simple**: Begin with a basic design, then optimize
2. **Scale Later**: Design for scale, but don't over-engineer
3. **Trade-offs Everywhere**: Every decision has pros and cons
4. **Think Distributed**: Assume multiple servers, databases
5. **Cache Everything**: Caching solves many performance problems
6. **Monitor Everything**: You can't optimize what you don't measure
7. **Design for Failure**: Systems will fail, plan for it
8. **Keep It Simple**: Complexity is the enemy of reliability

---

## Additional Resources

### Books
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "System Design Interview" by Alex Xu
- "High Performance Browser Networking" by Ilya Grigorik

### Online Resources
- System Design Primer (GitHub)
- High Scalability Blog
- AWS Architecture Center
- Google Cloud Architecture Center

### Practice
- LeetCode System Design
- Pramp System Design Interviews
- InterviewBit System Design

---

*This guide covers the essential concepts for system design. Remember: system design is iterative. Start simple, identify bottlenecks, and optimize based on requirements and constraints.*

