const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const {connection} = require("./config/db")
const cors = require('cors');


const authRoute = require("./routes/auth")
const serialsRoute = require("./routes/serials")
const winnersRoute = require("./routes/winners")

// Express app
dotenv.config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://cash-back-9hbves677-riya-patels-projects-c855bf2c.vercel.app",
  "https://cash-back-iota.vercel.app",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function(origin, callback) {
    // console.log("In cors option Origin:", origin);
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);  
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// DB connection
connection()
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

// Auth Route
app.use("/api/auth", authRoute)
app.use("/api/serials", serialsRoute)
app.use("/api/winners", winnersRoute)

// webhook/cashfree/payout
app.use("/api/webhook/cashfree/payout", (req, res) => {
  res.status(200).send("OK");
});
