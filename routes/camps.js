const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const camps = require('../controllers/camps');
const { isLoggedIn, isAuthor, validateCamp } = require('../middlewares');
const multer = require('multer');
const { storage } = require('../cloudinary');

const upload = multer({ storage });

const handleUpload = (redirectPath) => (req, res, next) => {
    upload.array('image')(req, res, (err) => {
        if (err) {
            req.flash('error', err.message || 'Image upload failed. Check your Cloudinary configuration.');
            return res.redirect(redirectPath(req));
        }
        next();
    });
};

router.route('/')
    .get(catchAsync(camps.index))
    .post(
        isLoggedIn,
        handleUpload(() => '/camps/new'),
        validateCamp,
        catchAsync(camps.createCamp)
    );

router.get('/new', isLoggedIn, camps.renderNewCampForm);

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(camps.editCamp));

router.route('/:id')
    .get(catchAsync(camps.showCamp))
    .put(
        isLoggedIn,
        isAuthor,
        handleUpload((req) => `/camps/${req.params.id}/edit`),
        validateCamp,
        catchAsync(camps.updateCamp)
    )
    .delete(isLoggedIn, isAuthor, catchAsync(camps.deleteCamp));

module.exports = router;
