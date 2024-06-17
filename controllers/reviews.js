const Camp = require('../models/campground');
const Review = require('../models/review');


module.exports.postReview = async (req, res) => {
    const camp = await Camp.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'Successfully made a new review!');
    res.redirect(`/camps/${camp._id}`);
};

module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params;
    await Camp.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Review deleted successfully.');
    res.redirect(`/camps/${id}`);
}