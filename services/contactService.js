const pool = require("../db.js");

const identifyContact = async ({ email, phoneNumber }) => {
  if (!email && !phoneNumber) {
    throw new Error("Email or Phone number required");
  }

  // Step 1: Find matching contacts
  const { rows: existingContacts } = await pool.query(
    `
    SELECT * FROM contact 
    WHERE (email = $1 OR phonenumber = $2) AND deletedat IS NULL
    `,
    [email, phoneNumber]
  );

  // Step 2: If matches found
  if (existingContacts.length > 0) {
    const allContacts = [...existingContacts];

    // Step 3: Find the oldest primary
    const primary = allContacts
      .filter((c) => c.linkprecedence === "primary")
      .sort((a, b) => new Date(a.createdat) - new Date(b.createdat))[0];

    // Step 4: Update other primaries to secondary
    for (const contact of allContacts) {
      if (contact.id !== primary.id && contact.linkprecedence === "primary") {
        await pool.query(
          `UPDATE contact SET linkprecedence = 'secondary', linkedid = $1, updatedat = NOW() WHERE id = $2`,
          [primary.id, contact.id]
        );
        contact.linkprecedence = "secondary";
        contact.linkedid = primary.id;
      }
    }

    // Step 5: Check if the current input is a new email/phone
    const isNew = !existingContacts.some(
      (c) => c.email === email && c.phonenumber === phoneNumber
    );

    if (isNew) {
      const insertResult = await pool.query(
        `INSERT INTO contact (email, phonenumber, linkedid, linkprecedence, createdat, updatedat)
         VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
         RETURNING *`,
        [email, phoneNumber, primary.id]
      );

      allContacts.push(insertResult.rows[0]);
    }

    // Step 6: Build response
    const emails = new Set();
    const phoneNumbers = new Set();
    const secondaryIds = [];

    for (const c of allContacts) {
      if (c.linkprecedence === "secondary") secondaryIds.push(c.id);
      if (c.email) emails.add(c.email);
      if (c.phonenumber) phoneNumbers.add(c.phonenumber);
    }

    return {
      contact: {
        primaryContactId: primary.id,
        emails: [...emails],
        phoneNumbers: [...phoneNumbers],
        secondaryContactIds: secondaryIds,
      },
    };
  }

  // Step 7: If no match at all, create new primary
  const { rows } = await pool.query(
    `INSERT INTO contact (email, phonenumber, linkprecedence, createdat, updatedat)
     VALUES ($1, $2, 'primary', NOW(), NOW())
     RETURNING *`,
    [email, phoneNumber]
  );

  return {
    contact: {
      primaryContactId: rows[0].id,
      emails: [rows[0].email].filter(Boolean),
      phoneNumbers: [rows[0].phonenumber].filter(Boolean),
      secondaryContactIds: [],
    },
  };
};

module.exports = { identifyContact };
