const mongoose = require("mongoose");

const WinnerSchema = new mongoose.Schema({
  number: {
    type:mongoose.Schema.Types.ObjectId,
        ref: "Serial",
  },
  name: {
    type: String,
  },
  upi: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["paid", "unpaid", "failed", "processing"],
    default: "unpaid"
  },
  payoutID: {
    type: String
  },
  reason: {
    type: String
  },
  clearedAt: {
    type: Date
  },
  failedAt: {
    type:Date
  },
}, { timestamps: true });

module.exports = mongoose.model("Winner", WinnerSchema);
