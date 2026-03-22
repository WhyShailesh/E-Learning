import { faker } from "@faker-js/faker";
import pool from "./config/db.js";

async function seed() {
    try {
        console.log("🌱 Seeding started...");

        await pool.query("BEGIN");

        // Pre-hashed 'password123' for dummy logins
        const defaultPasswordHash = "$2b$10$w4r0l8T5uO6A50n72gQmeOPaB7vG2S9dE80B4cOQeS5v5l71e7C9O";

        // -------------------------------
        // 1. INSTRUCTORS
        // -------------------------------
        const instructors = [];
        for (let i = 0; i < 10; i++) {
            const res = await pool.query(
                `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'instructor')
         RETURNING id`,
                [
                    faker.person.fullName(),
                    faker.internet.email().toLowerCase(),
                    defaultPasswordHash
                ]
            );
            instructors.push(res.rows[0].id);
        }

        // -------------------------------
        // 2. STUDENTS
        // -------------------------------
        const students = [];
        for (let i = 0; i < 300; i++) {
            const res = await pool.query(
                `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'learner')
         RETURNING id`,
                [
                    faker.person.fullName(),
                    faker.internet.email().toLowerCase(),
                    defaultPasswordHash
                ]
            );
            students.push(res.rows[0].id);
        }

        // -------------------------------
        // 3. COURSES
        // -------------------------------
        const courses = [];

        // Using faker commerce properties to guarantee unique 50 courses
        for (let i = 0; i < 50; i++) {
            const instructorId = instructors[Math.floor(Math.random() * instructors.length)];

            const res = await pool.query(
                `INSERT INTO courses (title, description, instructor_id, price, level, access_rule)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title`,
                [
                    faker.commerce.productName() + " Masterclass",
                    faker.lorem.paragraph(),
                    instructorId,
                    faker.helpers.arrayElement([0, 499, 999, 1499]),
                    faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
                    faker.helpers.arrayElement(['open', 'on-payment'])
                ]
            );

            courses.push(res.rows[0]);
        }

        // -------------------------------
        // 4. LESSONS + LESSON CONTENT
        // -------------------------------
        for (const course of courses) {
            for (let i = 0; i < 5; i++) {
                // Safe parameterized insertion for titles that might contain quotes
                const lessonRes = await pool.query(
                    `INSERT INTO lessons (title, course_id, type)
           VALUES ($1, $2, 'video') RETURNING id`,
                    [faker.company.catchPhrase(), course.id]
                );

                const lessonId = lessonRes.rows[0].id;

                // Insert actual video content so the Learnova Player doesn't fail
                await pool.query(
                    `INSERT INTO lesson_content (lesson_id, video_url)
           VALUES ($1, $2)`,
                    [lessonId, "https://www.youtube.com/watch?v=dQw4w9WgXcQ"]
                );
            }
        }

        // -------------------------------
        // 5. ENROLLMENTS
        // -------------------------------
        for (const studentId of students) {
            const course = courses[Math.floor(Math.random() * courses.length)];

            await pool.query(
                `INSERT INTO enrollments (user_id, course_id, status)
         VALUES ($1, $2, 'in_progress')
         ON CONFLICT DO NOTHING`,
                [studentId, course.id]
            );
        }

        // -------------------------------
        // 6. QUIZ + QUESTIONS + OPTIONS
        // -------------------------------
        for (const course of courses) {
            const quizRes = await pool.query(
                `INSERT INTO quizzes (title, course_id)
         VALUES ($1, $2)
         RETURNING id`,
                [`${course.title} Final Evaluation`, course.id]
            );

            const quizId = quizRes.rows[0].id;

            for (let i = 0; i < 5; i++) {
                const questionRes = await pool.query(
                    `INSERT INTO quiz_questions (question_text, quiz_id)
           VALUES ($1, $2)
           RETURNING id`,
                    [
                        faker.helpers.arrayElement([
                            "What is the best framework?",
                            "Explain the core runtime?",
                            "What is REST API?",
                            "What is a Token?",
                            "Describe the middleware pipeline?",
                        ]),
                        quizId,
                    ]
                );

                const questionId = questionRes.rows[0].id;
                const correctIndex = Math.floor(Math.random() * 4);

                for (let j = 0; j < 4; j++) {
                    await pool.query(
                        `INSERT INTO quiz_options (option_text, question_id, is_correct)
             VALUES ($1, $2, $3)`,
                        [faker.lorem.words(3), questionId, j === correctIndex]
                    );
                }
            }
        }

        // -------------------------------
        // 7. QUIZ ATTEMPTS 
        // -------------------------------
        for (const studentId of students) {
            // Pick a random course to grant a quiz score for
            const course = courses[Math.floor(Math.random() * courses.length)];

            const quiz = await pool.query(
                `SELECT id FROM quizzes WHERE course_id = $1 LIMIT 1`,
                [course.id]
            );

            if (quiz.rows.length > 0) {
                await pool.query(
                    `INSERT INTO quiz_attempts (user_id, quiz_id, score, attempt_number)
           VALUES ($1, $2, $3, 1)
           ON CONFLICT (user_id, quiz_id) DO NOTHING`,
                    [
                        studentId,
                        quiz.rows[0].id,
                        faker.number.int({ min: 1, max: 5 }), // Score relative to 5 questions
                    ]
                );
            }
        }

        await pool.query("COMMIT");

        console.log("✅ Seeding completed successfully!");
    } catch (err) {
        await pool.query("ROLLBACK");
        console.error("❌ Seeding failed:", err);
    } finally {
        pool.end();
    }
}

seed();
