# Library Books API Design

## Overview

The Library Books API allows users to list, view, create, update, delete, and search for books by author.

Base URL: `https://api.example.com`

## Endpoints

### 1. List All Books

- **Method:** GET
- **Path:** `/books`
- **Description:** Retrieves a list of all books.
- **Success status:** `200 OK`

### 2. Get One Book

- **Method:** GET
- **Path:** `/books/42`
- **Description:** Retrieves the details of the book with ID 42.
- **Success status:** `200 OK`

### 3. Create a Book

- **Method:** POST
- **Path:** `/books`
- **Description:** Creates a new book in the library.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```

- **Success status:** `201 Created`

### 4. Update a Book

- **Method:** PUT
- **Path:** `/books/42`
- **Description:** Replaces the details of the book with ID 42.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```

- **Success status:** `200 OK`

### 5. Delete a Book

- **Method:** DELETE
- **Path:** `/books/42`
- **Description:** Deletes the book with ID 42.
- **Success status:** `204 No Content`

### 6. List Books by Author

- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Retrieves books written by Chinua Achebe using the author query parameter.
- **Success status:** `200 OK`

## Error Codes

### 400 Bad Request

- **Description:** The request contains invalid data.
- **Example:** A client tries to create a book without the required title.

### 404 Not Found

- **Description:** The requested resource does not exist.
- **Example:** A client requests `GET /books/9999`, but no book with that ID exists.
