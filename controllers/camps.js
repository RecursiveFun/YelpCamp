const mongoose = require('mongoose');
const Camp = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

const cloudinary = require('cloudinary').v2;

module.exports.index = async (req, res) => {
    const camps = await Camp.find({});
    res.render('camps/index', { camps });
};

module.exports.renderNewCampForm = (req, res) => {
    res.render('camps/new');
};

module.exports.createCamp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send();
    const camp = new Camp(req.body.camp);
    camp.geometry = geoData.body.features[0].geometry;
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs);
    await camp.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    };
    req.flash('success', `Successfully updated the camp: ${camp.title}!`);
    res.redirect(`/camps/${camp._id}`);
};

module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    await Camp.findByIdAndDelete(id);
    res.redirect('/camps');
};