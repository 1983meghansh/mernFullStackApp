const express = require('express');
const placesControllers=require('../controllers/places-controllers');
const HttpError = require('../models/http-error');
const {check} = require('express-validator');
const router = express.Router();
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');



//this file would have all the mappings and the paths we are using
router.get('/:pid',placesControllers.getPlaceById);

//express has a pointer to the function it should execute for us when the request reaches this route(/:pid)

router.get('/user/:uid',placesControllers.getPlacesByUserId);
router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);


router.patch('/:pid',
[
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
placesControllers.updatePlace
);

router.delete('/:pid',placesControllers.deletePlace)


module.exports = router;
