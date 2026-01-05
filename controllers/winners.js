const Winner = require("../models/Winner")
const Serial = require("../models/Serial")
const {payoutToUPI} = require("../services/payout")

const clearSerial = async (req, res) => {
  try {
    const { numbers } = req.body;
    console.log(numbers);
    
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ message: "numbers array is required" });
    }

    const results = [];

    for (const number of numbers) {
      try {

        // get serial
        const serial = await Serial.findOne({ number });
        if (!serial) {
          results.push({ number, status: "not_found" });
          continue;
        }

        if (serial.status === "cleared") {
          results.push({ number, status: "already_cleared" });
          continue;
        }

        if (!["claimed", "failed"].includes(serial.status)) {
          results.push({ number, status: "invalid_state" });
          continue;
        }

        // get winner
        const winner = await Winner.findOne({ number: serial._id });
        if (!winner) {
          results.push({ number, status: "winner_not_found" });
          continue;
        }

        // razorpay payout call
        try {
            console.log('trying to call');
            
          const payout = await payoutToUPI({
            amount: serial.price,
            upi: winner.upi,
            name: winner.name,
            referenceId: serial.number,
          });

          // SUCCESS (real or dummy)
          serial.status = "cleared";
          serial.clearedAt = new Date();
          serial.payoutID = payout.id;

          winner.status = "paid";
          winner.payoutID = payout.id;

          await serial.save();
          await winner.save();

          results.push({ number, status: "paid" });

        } catch (err) {
          const code = err?.error?.code;

          // Dummy success for unverified account
            serial.status = "failed";
            winner.status = "failed";
            winner.reason = err.message

            await serial.save();
            await winner.save();

            results.push({
              number,
              status: "failed",
              reason: err.message,
            });
        }
      } catch (innerErr) {
        results.push({
          number,
          status: "error",
          reason: innerErr.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. read winners
const readWinners = async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.body; 
        let query = {};

        // Convert page/limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const winners = await Winner.find()
            .populate("number", "number status price claimedAt clearedAt")
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Winner.countDocuments(query);

        return res.status(200).json({
            winners,
            total,
            currentPage: pageNumber,
            totalPages: Math.ceil(total / limitNumber),
            message: "Winners retrieved"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 2. Export CSV - winner 

module.exports = {clearSerial, readWinners}

