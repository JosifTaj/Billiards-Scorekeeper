// Import the express module
const express = require("express");
// Import the mongoose module
const mongoose = require("mongoose");
// Create an Express Router instance
const app = express.Router();

app.use(express.json());

// Create a user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  wins: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  fouls: { type: Array, default: [] },
});

// Create a User model based on the schema
const User = mongoose.model("User", userSchema);

// Route to fetch leaderboard data (done with some help of a friend, Tin Djukic)
app.get("/leaderboard", async (req, res) => {
  try {
    // Find top 5 players sorted by score in descending order
    const topPlayers = await User.find({}).sort({ score: -1 }).limit(5);
    console.log(topPlayers);
    // Render the leaderboard view with the top players data
    res.render("leaderboard", { players: topPlayers });
  } catch (error) {
    console.error(error);
    // Send an error response if an error occurs
    res.status(500).send("An error occurred");
  }
});

// Route to debug and fetch all users data
app.get("/debug", async (req, res) => {
  try {
    // Find all users in the database
    const allUsers = await User.find({});
    console.log(allUsers);
    // Send a response instructing to check the server console for users data
    res.send("Check the server console for all users data.");
  } catch (error) {
    console.error(error);
    // Send an error response if an error occurs
    res.status(500).send("An error occurred");
  }
});

// Route to render the profile page
app.get("/profile", async (req, res) => {
  try {
    // Find all players in the database
    const allPlayers = await User.find({});
    console.log(allPlayers);
    // Render the profile view with all players data
    res.render("profile", { players: allPlayers });
  } catch (error) {
    console.error(error);
    // Send an error response if an error occurs
    res.status(500).send("An error occurred");
  }
});

// Route to handle login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      // Return an error response if user is not found
      return res.status(400).json({ error: "User not found. Please sign up." });
    }

    // Compare the provided password with the stored password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Return an error response if the password is incorrect
      return res.status(400).json({ error: "Incorrect password." });
    }

    // Return user data if login is successful
    res.json({ username: user.username, wins: user.wins, score: user.score, fouls: user.fouls });
  } catch (error) {
    console.error(error);
    // Send an error response if an error occurs
    res.status(500).json({ error: "An error occurred" });
  }
});
 
// Route to handle signup (done with some help of a friend, Tin Djukic)
app.post('/add-item', async (req, res) => {
  // Check if the request provided a username & password
  if (!req.body.username || !req.body.password) return res.json({ success: false, message: `No username/password provided` });
  
  // Create a new user instance with the provided data
  const newUserSchema = {
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      password: req.body.password,
      wins: 0,
      score: 0,
      fouls: []
  };
  const newItem = new User(newUserSchema);

  // Save the new user to the database
  let success = true; 

  await newItem.save().catch(err => {
    success = false;
    console.log(err);
  });

  if (success) {
    res.json({ success: true, user: newUserSchema });
  } else {
    res.json({ success: false, message: `Could not create MongoDB item` });
  }
});

// Route to update user stats
app.post("/updateStats", async (req, res) => {
  const { username, score, fouls } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      // Return a 400 error response if user is not found
      return res.status(400).json({ error: "User not found." });
    }

    // Update user stats
    user.score += score;
    user.fouls.push(...fouls);
    await user.save();

    // Send a success message
    res.json({ message: "Stats updated successfully." });
  } catch (error) {
    console.error(error);
    // Send an error response if an error occurs
    res.status(500).json({ error: "An error occurred" });
  }
});

// Export the router to be used in other parts of the application
module.exports = app;