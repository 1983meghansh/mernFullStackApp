// const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator'); //3rd party package to verifyemail

// const Schema = mongoose.Schema;


// const userSchema = new Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true, minlength: 6 },
//     image: { type: String, required: true },
//     places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place'}]
// });

// userSchema.plugin(uniqueValidator);//create a new user only if the email doesnt exists already

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);


