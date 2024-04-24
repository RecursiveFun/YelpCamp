const express = require ('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/camps', async (req, res) => {
    const camps = await Campground.find({});
    res.render('camps/index', { camps });
});

app.get('/camps/new', async (req, res) => {
    const camps = await Campground.find({});
    res.render('camps/new');
});

app.post('/camps', async (req, res) => {
    const camp = new Campground(req.body.camp);
    await camp.save();
    res.redirect(`camps/${camp._id}`);
})

app.get('/camps/:id', async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('camps/show', { camp });
})

app.get('/camps/:id/edit', async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('camps/edit', { camp });
})

app.put('/camps/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.camp});
    res.redirect(`/camps/${camp._id}`);
})

app.delete('/camps/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/camps');
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
});