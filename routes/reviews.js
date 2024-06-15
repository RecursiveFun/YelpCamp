const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {reviewSchema} = require('../schemas.js');
const Review = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

router.post('/', validateReview, isLoggedIn, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully made a new review!');
    res.redirect(`/camps/${camp._id}`);
}))

router.delete('/:reviewId', isLoggedIn, catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review deleted successfully.');
    res.redirect(`/camps/${id}`);
}))

module.exports = router;