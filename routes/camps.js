const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const camps = require('../controllers/camps');
const {isLoggedIn, isAuthor, validateCamp} = require('../middleware');
const multer  = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});


router.route('/')
    .get(catchAsync(camps.index))
    .post( isLoggedIn, upload.array('image'), catchAsync(camps.createCamp)); 


router.get('/new', isLoggedIn, camps.renderNewCampForm);

//router.post('/', validateCamp, isLoggedIn, catchAsync(camps.createCamp));

//router.get('/:id', catchAsync(camps.showCamp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(camps.editCamp));

//router.put('/:id', validateCamp, isLoggedIn, isAuthor, catchAsync(camps.updateCamp));

router.route('/:id')
    .get(catchAsync(camps.showCamp))
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCamp, catchAsync(camps.updateCamp))
    .delete( isLoggedIn, isAuthor, catchAsync(camps.deleteCamp));

//router.delete('/:id', isLoggedIn, isAuthor, catchAsync(camps.deleteCamp));

module.exports = router;