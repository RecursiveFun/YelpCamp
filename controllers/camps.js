const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Camp = require('../models/campground');

module.exports.index = async (req, res) => {
    const camps = await Camp.find({});
    res.render('camps/index', { camps });
};

module.exports.renderNewCampForm = (req, res) => {
    res.render('camps/new');
};

module.exports.createCamp = async (req, res, next) => {
    const camp = new Camp(req.body.camp);
    camp.author = req.user._id;
    await camp.save();
    req.flash('success', 'Successfully created a new camp!');
    res.redirect(`/camps/${camp._id}`);
};

module.exports.showCamp = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        req.flash('error','Sorry that camp cannot be found.');
        return res.redirect('/camps');
    }
    const camp = await Camp.findById(req.params.id).populate({
        path:'reviews',
            populate: {
                path:'author'
            }
    }).populate('author');
    res.render('camps/show', {camp});
};

module.exports.editCamp = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        req.flash('error', 'Sorry that camp cannot be found.');
        return res.redirect('/camps');
     }   
    res.render('camps/edit', { camp });
};

module.exports.updateCamp = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findByIdAndUpdate(id, {...req.body.camp});
    req.flash('success', `Successfully updated the camp: ${camp.title}!`);
    res.redirect(`/camps/${camp._id}`);
};

module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    await Camp.findByIdAndDelete(id);
    res.redirect('/camps');
};