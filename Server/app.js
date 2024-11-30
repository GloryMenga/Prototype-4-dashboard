"use strict";
require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
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
                gender: newUser.gender, // Include gender in the response
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

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
