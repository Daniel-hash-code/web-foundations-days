# TicketHub — Event Ticketing System Design

## 1. Context, Goals and Requirements

### Context

TicketHub is a website where users discover concerts and events, select seats, purchase tickets and view their bookings. The system must handle normal traffic and sudden demand when popular concerts go on sale.

### Goals

- Allow users to browse events and view seat availability.
- Enable users to select and temporarily hold seats, pay and receive tickets.
- Prevent two customers from purchasing the same seat.
- Maintain fast responses, fair access and high availability during major sales.

### Non-goals

- Building a complete event-management platform for organizers.
- Supporting ticket resale between users.
- Implementing physical ticket scanning at event entrances.

### Functional requirements

1. Users can register, log in and view events.
2. Users can view event details, prices and available seats.
3. Users can hold available seats temporarily while completing checkout.
4. Users can pay for held seats and receive confirmed tickets.
5. Users can view their orders and tickets.
6. Users can cancel eligible orders and receive refunds according to the event's policy.
7. The system releases expired or unpaid seat holds automatically.

### Non-functional requirements

- **Performance:** Event pages and seat availability should normally respond within 300 milliseconds under expected load. The seat-hold API should target a response within 500 milliseconds at the 95th percentile, excluding external payment processing.
- **Correctness:** A seat must never be confirmed in two different orders.
- **Availability:** The browsing and purchasing services should target 99.9% availability, with controlled degradation if a dependency fails.
- **Fairness:** Users should receive a fair opportunity to enter high-demand sales. A virtual waiting room can limit how many users enter checkout at once.
- **Security:** Authentication, authorization, encrypted connections, input validation, rate limiting and secure payment-provider integration are required.
- **Reliability:** Confirmed orders and payment outcomes must be recoverable after service failures.
- **Scalability:** The system must scale application capacity horizontally to handle sudden traffic spikes.

## 2. Traffic and Capacity Estimates

### Given assumptions

- 2 million registered users.
- 50,000 visitors on a normal day.
- Each visitor views 10 pages.
- 5,000 tickets are sold on a normal day.
- A popular concert has 20,000 seats.
- 200,000 people attempt to buy tickets during its first 10 minutes on sale.

These calculations assume that the supplied page views and purchase attempts are evenly distributed within their stated periods. Real traffic can be much more bursty.

### Normal-day traffic

**Page views per day**

50,000 visitors × 10 pages = 500,000 page views/day.

**Average page requests per second**

500,000 ÷ 86,400 seconds ≈ 5.8 requests/second.

**Tickets sold per second**

5,000 ÷ 86,400 ≈ 0.058 tickets/second, or approximately one ticket every 17 seconds on average.

These averages do not represent the busiest moments. The system should be tested at higher rates to allow for peak hours and uneven demand.

### Popular-concert sale

**Purchase attempts per second**

200,000 people ÷ 600 seconds ≈ 333 purchase attempts/second.

**Demand compared with supply**

200,000 people ÷ 20,000 seats = 10 people competing for each seat on average.

Only 10% of the interested buyers can receive one of the 20,000 tickets if every buyer wants one seat.

### Comparison

The sale produces approximately 333 purchase attempts per second during the ten-minute window, compared with approximately 0.058 ticket sales per second averaged across a normal day. These figures describe different activities and time periods, but they show why a popular sale requires special protection.

The system should be load-tested above the estimated average peak because requests arrive unevenly. It should also distinguish page views, seat-hold attempts, payment attempts and completed ticket sales when monitoring capacity.

## 3. Proposed API Design

The API uses REST conventions and JSON for request and response bodies. Authenticated endpoints require a valid access token.

| Method and endpoint                  | Purpose                                              | Success status |
| ------------------------------------ | ---------------------------------------------------- | -------------- |
| GET `/api/events`                    | List upcoming events, with pagination and filters    | 200 OK         |
| GET `/api/events/{eventId}`          | View event details                                   | 200 OK         |
| GET `/api/events/{eventId}/seats`    | View seats and their availability                    | 200 OK         |
| POST `/api/seat-holds`               | Temporarily hold available seats                     | 201 Created    |
| POST `/api/orders`                   | Create an order for held seats and initiate checkout | 201 Created    |
| POST `/api/orders/{orderId}/payment` | Request payment through the payment provider         | 202 Accepted   |
| GET `/api/orders/{orderId}`          | View order status                                    | 200 OK         |
| GET `/api/me/tickets`                | View the authenticated user's confirmed tickets      | 200 OK         |

### Example: Hold seats

Request:

`POST /api/seat-holds`

```json
{
  "eventId": 501,
  "seatIds": [1201, 1202]
}
```

A successful response returns `201 Created`:

```json
{
  "holdId": "hold_8f31",
  "eventId": 501,
  "seatIds": [1201, 1202],
  "status": "HELD",
  "expiresAt": "2026-10-25T18:10:00Z"
}
```

The expiration time is illustrative. The actual hold duration should be configured by the business.

If another user already holds or purchased either seat, the API returns `409 Conflict` and identifies the unavailable seats without creating a partial hold.

### Example: Create an order

Request:

`POST /api/orders`

```json
{
  "holdId": "hold_8f31",
  "idempotencyKey": "checkout-unique-request-001"
}
```

The idempotency key allows a retried request to be recognized as the same logical operation, preventing accidental duplicate orders.

A successful response returns `201 Created`:

```json
{
  "orderId": "ord_7421",
  "status": "PENDING_PAYMENT",
  "currency": "KES",
  "totalAmount": 6000
}
```

The amount is illustrative. The server calculates the authoritative price from the event and seat records rather than trusting a client-supplied amount.

### Error handling

- `400 Bad Request`: Invalid input or missing required fields.
- `401 Unauthorized`: The user is not authenticated.
- `403 Forbidden`: The user is not allowed to access the resource.
- `404 Not Found`: The event, seat, hold, or order does not exist.
- `409 Conflict`: A seat is unavailable or a hold has expired.
- `429 Too Many Requests`: The user has exceeded a rate limit.
- `500 Internal Server Error`: An unexpected server failure occurred.
- `503 Service Unavailable`: The service cannot safely process the request temporarily.

Errors should use a consistent JSON structure with an error code and readable message.

## 4. Data Model

A relational database is suitable because orders, users, events and seats have defined relationships and require strong consistency.

### Tables and relationships

**users**

- `id`: BIGINT, primary key.
- `name`: VARCHAR(100), not null.
- `email`: VARCHAR(255), unique and not null.
- `password_hash`: VARCHAR(255), not null.
- `created_at`: TIMESTAMP, not null.

**events**

- `id`: BIGINT, primary key.
- `title`: VARCHAR(200), not null.
- `venue`: VARCHAR(200), not null.
- `starts_at`: TIMESTAMP, not null.
- `sales_open_at`: TIMESTAMP, not null.
- `status`: VARCHAR(20), not null.

**seats**

- `id`: BIGINT, primary key.
- `event_id`: BIGINT, foreign key referencing `events.id`.
- `seat_label`: VARCHAR(30), not null.
- `price`: DECIMAL(10,2), not null.
- `status`: VARCHAR(20), not null.
- `hold_expires_at`: TIMESTAMP, nullable.
- `held_by_user_id`: BIGINT, nullable, foreign key referencing `users.id`.
- `order_id`: BIGINT, nullable.

Each seat belongs to one event. A unique constraint on `(event_id, seat_label)` prevents duplicate seat labels within the same event.

**orders**

- `id`: BIGINT, primary key.
- `user_id`: BIGINT, foreign key referencing `users.id`.
- `status`: VARCHAR(30), not null.
- `total_amount`: DECIMAL(12,2), not null.
- `currency`: CHAR(3), not null.
- `payment_reference`: VARCHAR(150), nullable and unique.
- `created_at`: TIMESTAMP, not null.
- `paid_at`: TIMESTAMP, nullable.

An order belongs to one user and can contain multiple seats. Each seat can belong to at most one confirmed order.

### Additional constraints

- Seat status is restricted to values such as `AVAILABLE`, `HELD`, and `SOLD`.
- Prices and order totals cannot be negative.
- Foreign keys prevent orders or seats from referencing nonexistent users or events.
- A unique constraint on the seat's event and label prevents duplicate seat records.
- The database enforces that a seat cannot be assigned to two different orders.

In a production schema, payment attempts and individual order items would usually be separate tables. The seat's `order_id` can reference `orders.id` as a foreign key. A migration or a deferred foreign-key constraint can be used if circular table references are introduced.

### Example SQL: Prevent double-booking

The following is PostgreSQL-style SQL. It demonstrates an atomic conditional update for a seat hold:

```sql
BEGIN;

UPDATE seats
SET status = 'HELD',
    held_by_user_id = :user_id,
    hold_expires_at = CURRENT_TIMESTAMP + INTERVAL '5 minutes'
WHERE id = :seat_id
  AND event_id = :event_id
  AND (
      status = 'AVAILABLE'
      OR (
          status = 'HELD'
          AND hold_expires_at < CURRENT_TIMESTAMP
      )
  )
RETURNING id;

COMMIT;
```

The application must check the returned rows. If no row is returned, the seat was not available to hold. For a request containing multiple seats, the application should hold all requested seats in one transaction and roll back the entire transaction if any seat cannot be acquired.

**Why this works:** The conditional update and database locking ensure that concurrent requests cannot both successfully claim the same currently available seat. A unique constraint and carefully enforced order/seat relationships provide additional protection. A read of the seat map followed by an unconditional update would not be safe
