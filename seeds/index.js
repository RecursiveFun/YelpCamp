const express = require ('express');
const path = require('path');
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')
require('dotenv').config();

mongoose.connect(process.env.API_KEY);



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected and reseeded.");
});

const sample = array => array[Math.floor(Math.random() * array.length)];



const seedDB = async () => {
    await Campground.deleteMany({});
for (let i = 0; i < 200; i++){
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor((Math.random() * 30) + 20)
    const camp = new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras finibus magna eget tellus venenatis tempor. Aliquam a purus laoreet sapien porttitor condimentum. Ut cursus malesuada efficitur. Sed porttitor interdum aliquet. Fusce pretium malesuada semper. Morbi ultricies a velit id blandit. Nulla sagittis quam laoreet ultricies dapibus. Quisque nec mollis lorem. Nunc porttitor libero nec arcu varius efficitur. Praesent consequat neque odio, ut lacinia lorem pretium in. Phasellus vel erat vel leo facilisis gravida. Pellentesque vitae faucibus felis. Ut vehicula, magna ut feugiat facilisis, dolor quam tristique augue, ut egestas magna sapien quis leo. Curabitur iaculis velit ipsum, ac venenatis mi congue vel. Quisque mattis interdum enim, vel hendrerit nulla fringilla ac. Mauris accumsan feugiat odio, eu eleifend elit tincidunt blandit.',
        price,
        //Provide userid below for author to seed based on your database same with images for cloudinary
        author: '666911c4d743e9faf2097da9',
        images: [
            {
                url: 'https://res.cloudinary.com/do2b86jpr/image/upload/v1718692291/YelpCamp/file_dmmcmt.jpg',
                filename: 'YelpCamp/file_dmmcmt'
            },
            {
                url: 'https://res.cloudinary.com/do2b86jpr/image/upload/v1718692511/YelpCamp/file_uoyghh.png',
                filename: 'YelpCamp/file_uoyghh'
            }
        ],
        geometry: {
            type: 'Point',
            coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
            ]
        }

    })
    await camp.save();
}
}

seedDB().then( () => {
    mongoose.connection.close();
})