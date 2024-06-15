const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCamp} = require('../middleware');
const mongoose = require('mongoose');

router.get('/', catchAsync(async (req, res) => {
    const camps = await Campground.find({});
    res.render('camps/index', { camps });
}));

router.get('/new', isLoggedIn, async (req, res) => {
    res.render('camps/new');
});

router.post('/', validateCamp, isLoggedIn, catchAsync(async (req, res) => {
    // if(!req.body.camp) throw new ExpressError('Invalid Camp Data', 400);
    const camp = new Campground(req.body.camp);
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully made a new camp!');
    res.redirect(`camps/${camp._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        req.flash('error','Sorry that camp cannot be found.');
        return res.redirect('/camps');
    }
    const camp = await Campground.findById(req.params.id).populate({
        path:'reviews',
            populate: {
                path:'author'
            }
    }).populate('author');
    res.render('camps/show', { camp});
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error', 'Sorry that camp cannot be found.');
        return res.redirect('/camps');
    }   
    res.render('camps/edit', { camp });
}));

router.put('/:id', validateCamp, isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    //const camp = await Campground.findByIdAndUpdate(id, {...req.body.camp});
    req.flash('success', `Successfully updated the camp: ${camp.title}!`);
    res.redirect(`/camps/${camp._id}`);
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/camps');
}));

module.exports = router;