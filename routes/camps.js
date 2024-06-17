const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const camps = require('../controllers/camps');
const {isLoggedIn, isAuthor, validateCamp} = require('../middleware');

router.get('/', catchAsync(camps.index));

router.get('/new', isLoggedIn, camps.renderNewCampForm);

router.post('/', validateCamp, isLoggedIn, catchAsync(camps.createCamp));

router.get('/:id', catchAsync(camps.showCamp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(camps.editCamp));

router.put('/:id', validateCamp, isLoggedIn, isAuthor, catchAsync(camps.updateCamp));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(camps.deleteCamp));

module.exports = router;