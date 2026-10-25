# School Database Design

## Tables

- **`students`** stores each student's ID, full name, and email address. `student_id` is the primary key and `email` is required and unique so two students cannot use the same email.
- **`courses`** stores each course's ID, name and course code. `course_id` is the primary key and `course_code` is required and unique.
- **`enrolments`** records which student is enrolled on which course and stores that student's grade for the course. `enrolment_id` is the primary key. `student_id` and `course_id` are foreign keys referencing `students` and `courses`. Both foreign keys are required. The `UNIQUE (student_id, course_id)` constraint prevents the same student from enrolling on the same course more than once.

## Relationships

The relationship between **students and enrolments** is one-to-many: one student can have several enrolment records, but each enrolment belongs to one student.

The relationship between **courses and enrolments** is also one-to-many: one course can have several enrolment records, but each enrolment refers to one course.

Therefore, the relationship between **students and courses** is many-to-many. A student can take several courses, and each course can have several students. The `enrolments` join table is needed to represent this relationship in a relational database and to store information about the relationship itself, such as the student's grade for a course.

## Index

I would add an index on `enrolments(course_id)` because the system often needs to find all students enrolled on a particular course and count enrolments for each course. The index can help those lookups. It uses extra storage and can add a small cost to inserts, updates, and deletes, so indexes should be added where they support common queries.

## SQL or NoSQL?

I would choose a relational SQL database for this school system. Students, courses, and enrolments have clearly defined fields and relationships, and the system needs to prevent duplicate enrolments and maintain valid references using primary keys, foreign keys, and constraints. SQL also supports `JOIN`, `GROUP BY`, and `LEFT JOIN`, which make it straightforward to list courses for a student, list students on a course, count students per course, and find students who have no enrolments. A NoSQL database can be useful for flexible or document-oriented data, but the structured relationships and integrity rules in this assignment make SQL a suitable choice.
