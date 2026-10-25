# Day 7 Assignment: Scaling a Photo-Sharing App

## 1. Assumptions

The scaling plan for SnapShare uses the following assumptions provided in the assignment:

- Registered users: 10,000,000.
- Daily active users: 10% of registered users.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Average thumbnail size: 50 KB.
- One day is approximated as 100,000 seconds for easier calculations.
- Peak traffic is estimated at 5 times the average traffic.
- Storage calculations use decimal units: 1 MB = 1,000 KB and 1 GB = 1,000 MB.

These estimates exclude database metadata, backups, storage replication and other overheads.

## 2. Load and Storage Estimates

### Daily active users

10,000,000 registered users × 10% active daily

**Daily active users (DAU) = 1,000,000 users**

### Photo uploads per second

Each daily active user uploads one photo per day.

1,000,000 users × 1 photo = 1,000,000 uploads per day

1,000,000 ÷ 100,000 seconds ≈ 10 uploads per second

At 5 times average traffic, the estimated peak is approximately 50 uploads per second.

### Feed views per second

Each active user views 50 feed pages per day.

1,000,000 users × 50 feed views = 50,000,000 feed views per day

50,000,000 ÷ 100,000 seconds ≈ 500 feed views per second

At 5 times average traffic:

500 × 5 = 2,500 feed views per second at peak.

### Annual photo storage

Each uploaded photo requires storage for the original image and its thumbnail.

- Original photo: 2 MB
- Thumbnail: 50 KB = 0.05 MB
- Total per upload: 2.05 MB

Daily storage:

1,000,000 uploads × 2.05 MB = 2,050,000 MB per day

This is approximately 2.05 TB per day.

Annual storage:

2.05 TB × 365 days = 748.25 TB per year.

The original photos account for approximately 730 TB per year, while thumbnails account for approximately 18.25 TB per year.

These figures represent the raw storage required for photos and thumbnails before backups, replication, and other overheads.

### Summary of estimates

| Measurement                        | Average estimate |                   Peak estimate |
| ---------------------------------- | ---------------: | ------------------------------: |
| Daily active users                 |  1,000,000 users |                               — |
| Photo uploads                      |    10 per second |                   50 per second |
| Feed views                         |   500 per second |                2,500 per second |
| Photo and thumbnail storage        |  2.05 TB per day |  Depends on upload distribution |
| Annual photo and thumbnail storage |        748.25 TB | Depends on retention and growth |

### Is SnapShare read-heavy or write-heavy?

SnapShare is **read-heavy** because users view 50 feed pages per day but upload only one photo per day. Feed views therefore occur approximately 50 times as often as photo uploads.

This means the design should prioritize fast feed loading and reducing repeated database queries. A cache, a CDN, and database read replicas can help handle the large number of reads, while the primary database handles writes.

## 3. Why Photos Should Use Object Storage

Photo files should be stored in object storage rather than directly inside the relational database.

Photo files are large and storing millions of them in database records can increase database size, backup times and the cost of serving image content. Object storage is designed to store and retrieve large files efficiently and can scale to hold large amounts of image data.

SnapShare can use object storage for original photos and generated thumbnails. The database stores metadata such as the photo ID, owner ID, caption, upload time, object-storage key and visibility settings.

This separation allows the database to manage relationships and feed queries while object storage handles the actual image files. A CDN can cache and deliver frequently accessed images from locations close to users.

## 4. SnapShare Architecture Diagram

```text
                         ┌───────────────────┐
                         │   Users / Clients │
                         └─────────┬─────────┘
                                   │
                                   v
                         ┌───────────────────┐
                         │        DNS        │
                         └─────────┬─────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    v                             v
          ┌──────────────────┐          ┌──────────────────┐
          │       CDN        │          │  Load Balancer   │
          │ Photos, thumbs   │          │    API traffic   │
          └─────────┬────────┘          └────────┬─────────┘
                    │                            │
                    │                    ┌───────┴────────┐
                    │                    │                │
                    │                    v                v
                    │             ┌────────────┐   ┌────────────┐
                    │             │ App Server │   │ App Server │
                    │             │     1      │   │     2      │
                    │             └─────┬──────┘   └─────┬──────┘
                    │                   │                │
                    │                   └───────┬────────┘
                    │                           │
                    │              ┌────────────┴───────────┐
                    │              │                        │
                    │              v                        v
                    │       ┌─────────────┐          ┌─────────────┐
                    │       │ Cache       │          │ Primary DB  │
                    │       │ (Redis)     │          │ Metadata    │
                    │       └─────────────┘          └──────┬──────┘
                    │                                        │
                    │                                        │ Replication
                    │                                        v
                    │                                 ┌─────────────┐
                    │                                 │ Read Replica│
                    │                                 └─────────────┘
                    │
                    v
          ┌────────────────────┐
          │   Object Storage    │
          │ Original photos and │
          │ generated thumbnails│
          └──────────▲─────────┘
                     │
                     │ Store thumbnail
              ┌──────┴──────────┐
              │ Thumbnail Worker│
              └──────▲──────────┘
                     │
              ┌──────┴──────────┐
              │   Job Queue     │
              │ Thumbnail jobs  │
              └──────▲──────────┘
                     │
              App server submits
              a thumbnail job
```

The diagram is a logical view of the system. The app servers are stateless, and both can access shared services. The CDN serves image content, while API requests pass through the load balancer.

## 5. What Each Component Solves

1. **Users / Clients:** Allow users to upload photos, view feeds and interact with other users' content.
2. **DNS:** Resolves SnapShare's domain name to the appropriate network address.
3. **CDN:** Delivers cached photos and thumbnails from nearby edge servers to reduce latency and object-storage traffic.
4. **Load Balancer:** Distributes API requests across healthy app servers and avoids sending new traffic to unhealthy instances.
5. **App Servers:** Validate requests, enforce permissions, coordinate uploads, retrieve feed data and communicate with the cache, database, object storage and queue.
6. **Cache (Redis):** Stores frequently requested feed data and metadata in memory to reduce repeated database queries.
7. **Primary Database:** Stores authoritative application metadata, including users, photo records, captions, timestamps and relationships used to build feeds.
8. **Read Replica:** Serves database read queries to reduce read load on the primary database.
9. **Object Storage:** Stores the original photo files and thumbnails separately from the relational database.
10. **Job Queue:** Holds thumbnail-generation jobs so image processing does not have to finish before the upload request can be acknowledged.
11. **Thumbnail Worker:** Retrieves queued jobs, creates smaller thumbnail images, stores them in object storage and updates the corresponding photo metadata when needed.

## 6. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits it through the SnapShare application.
2. The request reaches the load balancer, which forwards it to a healthy app server.
3. The app server authenticates the user, checks upload permissions, and validates the file type, size and other required details.
4. The app server creates a photo record or upload record in the primary database and obtains an object-storage location for the original photo.
5. The original photo is uploaded to object storage. In a scalable implementation, the server can issue a short-lived, restricted upload URL so the client uploads directly to object storage rather than sending the entire file through the app server.
6. After the upload succeeds, the system confirms the photo is stored and records its status in the database.
7. The app server adds a thumbnail-generation job to the queue and can return an upload-success response without waiting for thumbnail processing to finish.
8. A thumbnail worker retrieves the job and generates a 50 KB thumbnail from the original photo.
9. The worker stores the thumbnail in object storage and updates the photo record to indicate that thumbnail processing is complete.
10. The CDN can then serve the original photo or thumbnail when users request it. The application can invalidate or update any affected cached feed data so users do not continue seeing stale information.

If thumbnail generation fails, the job can be retried with appropriate limits and back-off. The original photo should remain safely stored while the thumbnail job is retried.

## 7. Trade-offs

### 1. Speed versus freshness

Caching feed data in Redis improves response times and reduces database load. However, a cached feed may not immediately show a newly uploaded photo or a recent change. SnapShare can invalidate or update affected cache entries when new photos are published, while using a suitable time-to-live (TTL) as an additional safeguard.

### 2. Database simplicity versus read scalability

A single primary database is simpler to manage, but it may become overloaded by feed queries. Adding a read replica distributes read traffic, but replication lag can cause users to briefly see older data. The primary should handle writes and the application should account for the possibility that replicas are not immediately up to date.

### 3. Immediate processing versus background processing

Generating a thumbnail before returning an upload response provides an immediately available thumbnail, but it increases upload latency and ties up application resources. Using a queue and worker makes uploads faster but thumbnails become available asynchronously and may take additional time to appear.

### 4. Reliability versus cost

Using multiple app servers, database replicas, object storage redundancy and a CDN can improve availability and resilience. However, these components increase infrastructure costs and operational complexity. SnapShare should add capacity based on measured demand and its reliability requirements.

## 8. Conclusion

SnapShare has 1 million daily active users under the given assumptions, approximately 10 photo uploads per second on average and approximately 500 feed views per second on average. Peak feed traffic is estimated at 2,500 views per second.

The app is read-heavy, so the design uses a cache, read replica and CDN to support fast feed access. Original photos and thumbnails are stored in object storage, while the relational database stores metadata. A load balancer distributes requests across stateless app servers and a queue with a thumbnail worker moves image processing into the background.

This architecture supports growth while balancing performance, reliability, cost and implementation complexity.
