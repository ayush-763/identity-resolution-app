const { identifyContact } = require("../services/contactService.js");

async function identify(req, res) {
  try {
    const { email, phoneNumber } = req.body;
    const contact = await identifyContact({ email, phoneNumber });
    res.status(200).json({ contact });
  } catch (err) {
    console.error("Error in /identify: ", err);
    res.status(500).json("error: ", err.message);
  }
}

module.exports = { identify };
