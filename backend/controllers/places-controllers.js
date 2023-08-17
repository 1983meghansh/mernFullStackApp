//this file would have only middleware functions related to fetching places.
const uuid = require('uuid').v4;
uuid();
const { validationResult } = require('express-validator');
const mongoose=require('mongoose');
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');
const fs = require('fs');

let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    }
  ];
const getPlaceById=async(req, res, next) => {
     // { pid: 'p1' }
    //trying to get places which are of specific place id specified in the url
    const placeId = req.params.pid; // { pid: 'p1' }
    //extract the unique identifier of the place rerquested

    let place;
    try {
      place = await Place.findById(placeId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not find a place.',
        500
      );
      return next(error);
    }
  
    if (!place) {
      const error = new HttpError(
        'Could not find a place for the provided id.',
        404
      );
      return next(error);
    }
  
    res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place } // => { place } => { place: place }
  }

  const getPlacesByUserId=async(req, res, next) => {
    const userId = req.params.uid;
    //get a places of a particular user with user id specified.
    let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
  }


  const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const { title, description, address} = req.body;
  
    // let coordinates;
    // try {
    //   coordinates = await getCoordsForAddress(address);
    // } catch (error) {
    //   return next(error);
    // }
  
    // const title = req.body.title;
    const createdPlace = new Place({
      title,
      description,
      address,
      location:{
        "lat":34.444,
        "lng":45.555
      },
      image: req.file.path,
      creator:req.userData.userId
    });

    let user;
    try {
      user = await User.findById(req.userData.userId);
    } catch (err) {
      const error = new HttpError('Creating place failed, please try again', 500);
      return next(error);
    }
  
    if (!user) {
      const error = new HttpError('Could not find user for provided id', 404);
      return next(error);
    }
  
    console.log(user);

    try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });//this would save the new place in the database in the current session and also create a new place id for that new place
    user.places.push(createdPlace);//add the current place id to the place field of the user.
    await user.save({ session: sess }); //save the updated user
    await sess.commitTransaction(); //once all the tasks are successfull then they are saved to the database , else rolled back
    } catch (err) {
      const error = new HttpError(
        'Creating place failed, please try again.',
        500
      );
      return next(error);
    }
    
    res.status(201).json({ place: createdPlace });
  };

  const updatePlace=async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next( new HttpError('Invalid inputs passed, please check your data.', 422));
    }
  
    const { title, description } = req.body;
    const placeId = req.params.pid;
  
    let place;
    try {
      place = await Place.findById(placeId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update place.',
        500
      );
      return next(error);
    }
    if(place.creator.toString()!==req.userData.userId)
    {
      const error = new HttpError(
        'You are not allowed to edit this place',401
        
      );
      return next(error);
    }

    place.title = title;
    place.description = description;
  
    try {
      await place.save();
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not update place.',
        500
      );
      return next(error);
    }
  
    res.status(200).json({ place: place.toObject({ getters: true }) });
  };

  const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
  
    let place;
    try {
      place = await Place.findById(placeId).populate('creator');
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, could not delete place.',
        500
      );
      return next(error);
    }
  
    if (!place) {
      const error = new HttpError('Could not find place for this id.', 404);
      return next(error);
    }

    if(place.creator.id!==req.userData.userId)
    {
      const error = new HttpError(
        'You are not allowed to delete this place',401
        
      );
      return next(error);
    }

  const imagePath=place.image;
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await place.deleteOne({ session: sess });
      place.creator.places.pull(place);
      await place.creator.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        'Something went wrrrrrong, could not delete place.',
        500
      );
      return next(error);
    }
    fs.unlink(imagePath, err => {
      console.log(err);
    });
  
    res.status(200).json({ message: 'Deleted place.' });
  };
  
  


  //we need to export the functions from this file so that they can be linked to the routes which are registered in a different file.

  exports.getPlaceById=getPlaceById;
  exports.getPlacesByUserId=getPlacesByUserId;
  exports.createPlace=createPlace;
  exports.updatePlace=updatePlace;
  exports.deletePlace=deletePlace;

