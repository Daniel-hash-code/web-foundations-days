-- Day 6 Assignment: A School Database
PRAGMA foreign_keys = ON;

-- Drop child table first so the script can be safely rerun.
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- 1. Students: each student has a unique email address.
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- 2. Courses: each course has a unique course code.
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL UNIQUE
);

-- 3. Enrolments: join table between students and courses.
-- A student can enrol on many courses, and a course can have many students.
-- The composite UNIQUE constraint prevents duplicate enrolments.
CREATE TABLE enrolments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT CHECK (
        grade IN ('A', 'B', 'C', 'D', 'E', 'F') OR grade IS NULL
    ),
    PRIMARY KEY (student_id, course_id),

    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- Sample data: 

INSERT INTO students (student_id, full_name, email) VALUES
    (1, 'Amina Otieno', 'amina.otieno@gmail.com'),
    (2, 'Brian Kamau', 'brian.kamau@gmail.com'),
    (3, 'Carol Wanjiku', 'carol.wanjiku@gmail.com'),
    (4, 'David Mwangi', 'david.mwangi@gmail.com');

INSERT INTO courses (course_id, course_name, course_code) VALUES
    (1, 'Database Systems', 'DBS101'),
    (2, 'Web Development', 'WEB102'),
    (3, 'Computer Networks', 'NET103');

INSERT INTO enrolments (student_id, course_id, grade) VALUES
    (1, 1, 'B'),
    (1, 2, 'A'),
    (2, 1, 'C'),
    (2, 3, NULL),
    (3, 2, 'A');

    -- David has no enrolments so the required LEFT JOIN query has a result.

-- QUERY 1: All courses for one student, identified by name.
SELECT s.full_name, c.course_name, c.course_code, e.grade
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.full_name = 'Amina Otieno'
ORDER BY c.course_name;

-- QUERY 2: All students enrolled on one course.
SELECT c.course_name, s.full_name, s.email, e.grade
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.course_id
JOIN students AS s ON s.student_id = e.student_id
WHERE c.course_name = 'Database Systems'
ORDER BY s.full_name;

-- QUERY 3: Number of students per course, including courses with zero students.
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

-- QUERY 4: Students who have no enrolments.
SELECT s.student_id, s.full_name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.student_id IS NULL
ORDER BY s.full_name;

-- QUERY 5: Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 1 AND course_id = 2;

-- Verify the grade update.
SELECT e.student_id, s.full_name, c.course_name, e.grade
FROM enrolments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE e.student_id = 1 AND e.course_id = 2;

-- Suggested index: useful for queries that look up enrolments by course.
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
