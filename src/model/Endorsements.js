const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
});

const Endorsement = mongoose.model('Endorsement', endorsementSchema);

module.exports = Endorsement;
