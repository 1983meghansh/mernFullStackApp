const express=require('express');
const bodyParser=require('body-parser');
const placesRoutes=require('./routes/places-routes');
const usersRoutes=require('./routes/users-routes');
const HttpError = require('./models/http-error');
const mongoose=require('mongoose');
const path = require('path');
const fs = require('fs');
const app=express();
app.use(bodyParser.json());
const cors=require('cors');

app.use(cors());
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});
// app.use(bodyParser.json()); //to parse the incoming request data (for post requests)

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

//   next();
// });

// app.use('/api/places',placesRoutes);  //this means the routes which we configured in the places-routes file are added as a middleware in app js file

// app.use('/api/users',usersRoutes);

// //a request which did not get a response before , 
// app.use((req,res,next)=>{
//   const error=new HttpError('could not find this route',404);
//   throw error;
// })

// app.use((error, req, res, next) => {
//     if (res.headerSent) {
//       return next(error);
//     }
//     res.status(error.code || 500)
//     res.json({message: error.message || 'An unknown error occurred!'});
//   });



mongoose.connect('mongodb+srv://meghanshmundra:myplaces12345@cluster0.bfulfaz.mongodb.net/?retryWrites=true&w=majority').then(()=>{
  app.listen(9000);
}).catch(err=>{
console.log(err);
})
  
