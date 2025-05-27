const express = require("express");
const { identify } = require("../controllers/contact");
const router = express.Router();

router.post("/identify", identify);

module.exports = router;
