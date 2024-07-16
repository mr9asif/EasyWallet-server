const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p7hqbnv.mongodb.net`;

const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    
    const db = client.db("EasyWallet"); // Replace with your database name
     usersCollection = db.collection("users"); // Replace with your collection name

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongoDB();

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { name, pin, mobileNumber, email, role, status } = req.body;

    // Check if a user with the same email or mobileNumber already exists
    const existingUser = await usersCollection.findOne({
      $or: [
        { email: email },
        { mobileNumber: mobileNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already registered with this email or mobile number" });
    }

    // Create a new user document
    const newUser = {
      name,
      pin,
      mobileNumber,
      email,
      role,
      status,
    };

    // Insert the new user document into MongoDB
    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({ message: "User registered successfully", userId: result.insertedId });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Server running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
