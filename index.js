// Packages
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose");

// Initialize secondary file (done with the help of a friend, Tin Djukic)
const serverRouter = require('./server');

// Connect to MongoDB
mongoose.connect("mongodb+srv://jaffaryosif:fIIs8PwCvXBrC0RC@clusterone.hmy8haj.mongodb.net/usersAndPasses", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Main
app.use(express.static('public'));
app.use(serverRouter);
app.use(express.json());

const ejs = require('ejs');
app.set("views", path.join(__dirname, "Views"));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('live');
});

app.get('/tips', (req, res) => {
    res.render('tips');
});

app.listen(8000, () => {
    console.log('Express Server Initialized');
});