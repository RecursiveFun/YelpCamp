const express = require ('express');
const path = require('path');
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected and reseeded.");
});

const sample = array => array[Math.floor(Math.random() * array.length)];



const seedDB = async () => {
    await Campground.deleteMany({});
for (let i = 0; i < 50; i++){
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor((Math.random() * 30) + 20)
    const camp = new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image: 'https://source.unsplash.com/collection/483251',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras finibus magna eget tellus venenatis tempor. Aliquam a purus laoreet sapien porttitor condimentum. Ut cursus malesuada efficitur. Sed porttitor interdum aliquet. Fusce pretium malesuada semper. Morbi ultricies a velit id blandit. Nulla sagittis quam laoreet ultricies dapibus. Quisque nec mollis lorem. Nunc porttitor libero nec arcu varius efficitur. Praesent consequat neque odio, ut lacinia lorem pretium in. Phasellus vel erat vel leo facilisis gravida. Pellentesque vitae faucibus felis. Ut vehicula, magna ut feugiat facilisis, dolor quam tristique augue, ut egestas magna sapien quis leo. Curabitur iaculis velit ipsum, ac venenatis mi congue vel. Quisque mattis interdum enim, vel hendrerit nulla fringilla ac. Mauris accumsan feugiat odio, eu eleifend elit tincidunt blandit.',
        price

    })
    await camp.save();
}
}

seedDB().then( () => {
    mongoose.connection.close();
})