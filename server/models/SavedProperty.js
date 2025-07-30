const mongoose = require("mongoose");

const SavedPropertySchema = new mongoose.Schema({
  userId: String,
  propertyId: String,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("SavedProperty", SavedPropertySchema);
