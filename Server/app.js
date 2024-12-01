"use strict";
require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const client = new MongoClient(process.env.MONGODB_URL);
const dbName = "Dashboard";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes

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

        // Check if email is already registered
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).send({
                status: "Conflict",
                message: "Email is already registered.",
            });
        }

        // Hash password and store user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { 
            uuid: uuidv4(), 
            username, 
            email, 
            password: hashedPassword, 
            status: "Student", // Default status
            gender, // Include gender
        };
        await usersCollection.insertOne(newUser);

        res.status(201).send({
            status: "Success",
            message: "User registered successfully.",
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
            { _id: new ObjectId(id) }, // Convert id to ObjectId
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
