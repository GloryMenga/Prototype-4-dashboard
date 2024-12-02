"use strict";
require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const client = new MongoClient(process.env.MONGODB_URL);
const dbName = "Dashboard";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db = null;

async function connectToDatabase() {
    if (db) return db;
    try {
        const client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db(dbName);
        return db;
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
}

// Middleware to ensure database connection
const ensureDbConnection = async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        res.status(500).send({ 
            status: "Error", 
            message: "Database connection failed", 
            error: error.message 
        });
    }
};

// Register a new user
app.post("/register", async (req, res) => {
    console.log("Request received:", req.body);
    const { username, email, password, gender } = req.body;

    if (!username || !email || !password || !gender) {
        return res.status(400).send({
            status: "Bad Request",
            message: "All fields (username, email, password, gender) are required.",
        });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection("Users");
        const studentsCollection = db.collection("Students");

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).send({
                status: "Conflict",
                message: "Email is already registered.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { 
            uuid: uuidv4(), 
            username, 
            email, 
            password: hashedPassword, 
            status: "Student", 
            gender, 
        };
        const userResult = await usersCollection.insertOne(newUser);

        const newStudent = {
            name: username
        };
        await studentsCollection.insertOne(newStudent);

        res.status(201).send({
            status: "Success",
            message: "User and student registered successfully.",
            data: { 
                uuid: newUser.uuid, 
                username: newUser.username, 
                email: newUser.email,
                status: newUser.status,
                gender: newUser.gender, 
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: "Error", message: "An error occurred during registration." });
    } finally {
        await client.close();
    }
});


// Login a user
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            status: "Bad Request",
            message: "Both email and password are required.",
        });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection("Users");

        // Find the user by email
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).send({
                status: "Not Found",
                message: "No user found with the provided email.",
            });
        }

        // Check if the password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({
                status: "Unauthorized",
                message: "Invalid email or password.",
            });
        }

        res.status(200).send({
            status: "Success",
            message: "Login successful.",
            data: {
                uuid: user.uuid,
                username: user.username,
                email: user.email,
                status: user.status,
                gender: user.gender, 
            },
        });        
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "Error",
            message: "An error occurred while logging in.",
        });
    } finally {
        await client.close();
    }
});

// Add Assignment
app.post("/assignments", async (req, res) => {
    const { name, description, deadline } = req.body;

    if (!name || !description || !deadline) {
        console.error("Missing required fields:", req.body);
        return res.status(400).send({ message: "All fields are required." });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const assignmentsCollection = db.collection("Assignments");

        const newAssignment = { name, description, deadline, createdAt: new Date() };
        const result = await assignmentsCollection.insertOne(newAssignment);

        if (!result.insertedId) {
            console.error("Insert failed:", result);
            return res.status(500).send({ message: "Failed to add assignment." });
        }

        const insertedAssignment = await assignmentsCollection.findOne({ _id: result.insertedId });
        res.status(201).send({ message: "Assignment added successfully", assignment: insertedAssignment });
    } catch (error) {
        console.error("Error while adding assignment:", error);
        res.status(500).send({ message: "Failed to add assignment.", error });
    } finally {
        await client.close();
    }
});

// Get All Assignments
app.get("/assignments", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const assignmentsCollection = db.collection("Assignments");

        const assignments = await assignmentsCollection.find().sort({ createdAt: -1 }).toArray();
        res.status(200).send(assignments);
    } catch (error) {
        res.status(500).send({ message: "Failed to retrieve assignments", error });
    } finally {
        await client.close();
    }
});

// Update Assignment
app.put("/assignments/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, deadline } = req.body;

    if (!name || !description || !deadline) {
        return res.status(400).send({ message: "All fields are required." });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const assignmentsCollection = db.collection("Assignments");

        const updatedAssignment = { name, description, deadline };
        const result = await assignmentsCollection.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: updatedAssignment }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Assignment not found" });
        }

        res.status(200).send({ message: "Assignment updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Failed to update assignment", error });
    } finally {
        await client.close();
    }
});

// Delete Assignment
app.delete("/assignments/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await client.connect();
        const db = client.db(dbName);
        const assignmentsCollection = db.collection("Assignments");

        const result = await assignmentsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Assignment not found" });
        }

        res.status(200).send({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Failed to delete assignment", error });
    } finally {
        await client.close();
    }
});

// Fetch Grades
app.get("/grades", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const gradesCollection = db.collection("Grades");

        const grades = await gradesCollection.find().sort({ createdAt: -1 }).toArray();

        if (!grades || grades.length === 0) {
            return res.status(200).send([]);
        }

        res.status(200).send(grades);
    } catch (error) {
        console.error("Error fetching grades:", error.message);
        res.status(500).send({ 
            status: "Error", 
            message: "Failed to retrieve grades", 
            error: error.message 
        });
    }
});

// Modify the existing add grade endpoint to remove assignment collection validation
app.post("/grades", async (req, res) => {
    const { assignmentName, studentName, subjectName, date, grade } = req.body;

    if (!assignmentName || !studentName || !subjectName || !date || !grade) {
        return res.status(400).send({ 
            status: "Bad Request", 
            message: "All fields (assignmentName, studentName, subjectName, date, grade) are required." 
        });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const gradesCollection = db.collection("Grades");
        
        // Validate that the student exists
        const studentsCollection = db.collection("Students");
        const studentExists = await studentsCollection.findOne({ name: studentName });
        if (!studentExists) {
            return res.status(404).send({ 
                status: "Not Found", 
                message: "Student not found." 
            });
        }

        // Validate that the subject exists
        const subjectsCollection = db.collection("Subjects");
        const subjectExists = await subjectsCollection.findOne({ name: subjectName });
        if (!subjectExists) {
            return res.status(404).send({ 
                status: "Not Found", 
                message: "Subject not found." 
            });
        }

        // Prepare the grade entry
        const newGrade = { 
            assignmentName, 
            studentName, 
            subjectName, 
            date: new Date(date), 
            grade: parseFloat(grade),
            createdAt: new Date()
        };

        // Insert the grade
        const result = await gradesCollection.insertOne(newGrade);

        if (!result.insertedId) {
            return res.status(500).send({ 
                status: "Error", 
                message: "Failed to add grade." 
            });
        }

        res.status(201).send({ 
            status: "Success", 
            message: "Grade added successfully", 
            data: newGrade 
        });
    } catch (error) {
        console.error("Error while adding grade:", error);
        res.status(500).send({ 
            status: "Error", 
            message: "Failed to add grade.", 
            error: error.message 
        });
    } finally {
        await client.close();
    }
});

// Fetch Subjects for dropdown
app.get("/subjects", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const subjectsCollection = db.collection("Subjects");

        const subjects = await subjectsCollection.find().toArray();
        
        // If no subjects exist, return an empty array instead of throwing an error
        if (subjects.length === 0) {
            return res.status(200).send([]);
        }

        res.status(200).send(subjects);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).send({ 
            status: "Error", 
            message: "Failed to retrieve subjects", 
            error: error.message 
        });
    } finally {
        await client.close(); // Ensure connection is closed
    }
});

// Fetch Students for dropdown
app.get("/students", async (req, res) => {
    try {
        const database = await connectToDatabase();
        const studentsCollection = database.collection("Students");

        const students = await studentsCollection.find().toArray();
        res.status(200).send(students);
    } catch (error) {
        console.error("Error fetching students:", error.message);
        res.status(500).send({
            status: "Error",
            message: "Failed to retrieve students",
            error: error.message,
        });
    }
});

process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection', error);
        process.exit(1);
    }
});

// Update Grade
app.put("/grades/:id", async (req, res) => {
    const { id } = req.params;
    const { assignmentName, studentName, subjectName, date, grade } = req.body;

    if (!assignmentName || !studentName || !subjectName || !date || !grade) {
        return res.status(400).send({ 
            status: "Bad Request", 
            message: "All fields (assignmentName, studentName, subjectName, date, grade) are required." 
        });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const gradesCollection = db.collection("Grades");

        const updatedGrade = {
            assignmentName,
            studentName,
            subjectName,
            date: new Date(date),
            grade: parseFloat(grade),
        };

        const result = await gradesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedGrade }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ 
                status: "Not Found", 
                message: "Grade not found." 
            });
        }

        res.status(200).send({ 
            status: "Success", 
            message: "Grade updated successfully." 
        });
    } catch (error) {
        console.error("Error updating grade:", error);
        res.status(500).send({ 
            status: "Error", 
            message: "Failed to update grade.", 
            error: error.message 
        });
    }
});

// Delete Grade
app.delete("/grades/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await client.connect();
        const db = client.db(dbName);
        const gradesCollection = db.collection("Grades");

        const result = await gradesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ 
                status: "Not Found", 
                message: "Grade not found." 
            });
        }

        res.status(200).send({ 
            status: "Success", 
            message: "Grade deleted successfully." 
        });
    } catch (error) {
        console.error("Error deleting grade:", error);
        res.status(500).send({ 
            status: "Error", 
            message: "Failed to delete grade.", 
            error: error.message 
        });
    }
});


// Start the server
app.listen(port, async () => {
    try {
        await connectToDatabase(); // Ensure this references the correct function
        console.log(`Server is running on http://localhost:${port}`);
    } catch (error) {
        console.error("Failed to start server", error);
    }
});
