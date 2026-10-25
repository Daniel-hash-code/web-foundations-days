# Day 8 Reflection

The most difficult concept in this course was designing a system that remains correct when many users perform the same action simultaneously. I learned that checking seat availability before updating it is not enough because two requests may check the same seat at nearly the same time. I overcame this by studying database transactions, atomic updates and unique constraints, which help prevent double-booking.

Feedback on my QuickNotes System Design project highlighted an improvement I needed to make: my note creation success message did not display the HTTP response status code and the newly generated note ID. Although my asynchronous requests and error handling were well structured, this feedback taught me that an application should communicate important server response details to users. I would improve the capstone by displaying this metadata and making the interface's response to server operations clearer.

This assignment also helped me understand how traffic estimates, API design, data modelling and architecture work together. I learned that design decisions involve trade-offs, such as improving performance through caching while risking outdated information.

Next, I want to learn Node.js and Express and connect a backend to PostgreSQL. I plan to implement persistent storage, authentication and real database transactions so I can progress from documenting system designs to building and testing reliable applications.
