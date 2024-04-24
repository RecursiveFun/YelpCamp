const express = require ('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/camps', async (req, res) => {
    const camps = await Campground.find({});
    res.render('camps/index', { camps })
});

app.get('/camps/:id', async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('camps/show', { camp });
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
});