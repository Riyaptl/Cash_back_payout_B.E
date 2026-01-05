const mongoose = require("mongoose");

const SerialSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: String,
  },
  status: {
    type: String,
    enum: ["unclaimed", "claimed", "cleared", "checked", "failed", "processing"],
    default: "unclaimed"
  },
  winner: {
    type:mongoose.Schema.Types.ObjectId,
    ref: "Winner",
  },
  claimedAt: {
    type: Date
  },
  clearedAt: {
    type: Date
  },
  failedAt: {
    type:Date
  },
  checkedAt: {
    type: Date
  },
  payoutID: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Serial", SerialSchema);
