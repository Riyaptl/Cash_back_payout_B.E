const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const authenticateUser = require("../middlewares/JwtAuth");
const { readSerials, csvImportSerial, createSerial, claimSerial, checkSerial, createCSV } = require("../controllers/serials");


// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure "uploads" folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get("/createCSV", createCSV);
router.post("/csv-import", upload.single("file"), csvImportSerial);
router.post("/", authenticateUser, createSerial);
router.post("/check", checkSerial);
router.post("/claim", claimSerial);
router.post("/read", authenticateUser, readSerials);

module.exports = router;