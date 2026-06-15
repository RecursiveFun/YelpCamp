require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const User = require('../models/user');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoUrl = (process.env.API_KEY || '').trim();

if (!mongoUrl) {
    console.error('API_KEY is not set in your environment.');
    process.exit(1);
}

mongoose.connect(mongoUrl);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    let author = await User.findOne({});
    if (!author) {
        const user = new User({ email: 'seed@yelpcamp.com', username: 'seeduser' });
        author = await User.register(user, 'seedpassword');
        console.log('Created seed user: seeduser / seedpassword');
    }

    await Campground.deleteMany({});
    console.log('Cleared existing campgrounds');

    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 20;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras finibus magna eget tellus venenatis tempor.',
            price,
            author: author._id,
            images: [
                {
                    url: 'https://res.cloudinary.com/do2b86jpr/image/upload/v1718692291/YelpCamp/file_dmmcmt.jpg',
                    filename: 'YelpCamp/file_dmmcmt',
                },
                {
                    url: 'https://res.cloudinary.com/do2b86jpr/image/upload/v1718692511/YelpCamp/file_uoyghh.png',
                    filename: 'YelpCamp/file_uoyghh',
                },
            ],
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude],
            },
        });
        await camp.save();
    }

    console.log('Seeded 200 campgrounds');
};

seedDB()
    .then(() => {
        mongoose.connection.close();
        console.log('Database connection closed');
    })
    .catch((err) => {
        console.error('Seed failed:', err.message);
        mongoose.connection.close();
        process.exit(1);
    });