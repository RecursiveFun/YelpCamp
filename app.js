const express = require ('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const Joi = require('joi');
const {campSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', engine);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCamp = (req, res, next) =>{
    const {error} = campSchema.validate(req.body);
    if (error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/camps', catchAsync(async (req, res) => {
    const camps = await Campground.find({});
    res.render('camps/index', { camps });
}));

app.get('/camps/new', async (req, res) => {
    const camps = await Campground.find({});
    res.render('camps/new');
});

app.post('/camps', validateCamp, catchAsync(async (req, res) => {
    // if(!req.body.camp) throw new ExpressError('Invalid Camp Data', 400);
    const camp = new Campground(req.body.camp);
    await camp.save();
    res.redirect(`camps/${camp._id}`);
}))

app.get('/camps/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('camps/show', { camp });
}))

app.get('/camps/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('camps/edit', { camp });
}))

app.put('/camps/:id', validateCamp, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.camp});
    res.redirect(`/camps/${camp._id}`);
}))

app.delete('/camps/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/camps');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong.';
    res.status(statusCode).render('error', {err});
 })

app.listen(3000, () => {
    console.log("Serving on port 3000");
});