const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const petSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    minlength: [2, 'Pet name must be at least 2 characters long']
  },
  petType: {
    type: String,
    required: [true, 'Pet type is required'],
    enum: ['cat', 'dog', 'rabbit', 'parrot'],
    message: '{VALUE} is not a valid pet type'
  },
  petAge: {
    type: Number,
    required: [true, 'Pet age is required'],
    min: [0, 'Pet age cannot be negative']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Pet image is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

petSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
