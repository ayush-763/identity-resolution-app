const pool = require("../db");

async function identifyContact({ email, phoneNumber }) {
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "email or phoneNumber is required" });
  }

  try {
    const { rows: matchedContacts } = await pool.query(
      `
      SELECT * FROM contact
      WHERE (email = $1 OR phoneNumber = $2)
      AND deletedat IS NULL
    `,
      [email, phoneNumber]
    );

    if (matchedContacts.length === 0) {
      const { rows: inserted } = await pool.query(
        `
        INSERT INTO contact (email, phoneNumber, linkedid, linkprecedence, createdat, updatedat, deletedat)
        VALUES ($1, $2, NULL, 'primary', NOW(), NOW(), NULL)
        RETURNING *
      `,
        [email, phoneNumber]
      );

      return {
        contact: {
          primaryContactId: inserted[0].id,
          emails: [inserted[0].email],
          phoneNumbers: [inserted[0].phonenumber],
          secondaryContactIds: [],
        },
      };
    }

    const allRelatedIds = new Set();
    const emailsToSearch = new Set();
    const phonesToSearch = new Set();

    for (const contact of matchedContacts) {
      allRelatedIds.add(contact.id);
      if (contact.linkedid) {
        allRelatedIds.add(contact.linkedid);
      }
      if (contact.email) emailsToSearch.add(contact.email);
      if (contact.phonenumber) phonesToSearch.add(contact.phonenumber);
    }

    const { rows: newContacts } = await pool.query(
      `
  SELECT * FROM contact
  WHERE (email = ANY($1::text[]) OR phoneNumber = ANY($2::text[]))
  AND deletedat IS NULL
`,
      [[...emailsToSearch], [...phonesToSearch]]
    );

    for (const contact of newContacts) {
      allRelatedIds.add(contact.id);
      if (contact.linkedid) allRelatedIds.add(contact.linkedid);
    }

    const { rows: expandedContacts } = await pool.query(
      `
      SELECT * FROM contact
      WHERE (id = ANY($1::int[]) OR linkedid = ANY($1::int[]))
      AND deletedat IS NULL
    `,
      [Array.from(allRelatedIds)]
    );

    const primaryContact = expandedContacts
      .filter((c) => c.linkprecedence === "primary")
      .sort((a, b) => new Date(a.createdat) - new Date(b.createdat))[0];

    for (const contact of expandedContacts) {
      if (
        contact.id !== primaryContact.id &&
        contact.linkedid !== primaryContact.id
      ) {
        await pool.query(
          `
          UPDATE contact
          SET linkprecedence = 'secondary', linkedid = $1, updatedat = NOW()
          WHERE id = $2
        `,
          [primaryContact.id, contact.id]
        );
      }
    }

    const { rows: finalContacts } = await pool.query(
      `
      SELECT * FROM contact
      WHERE (id = $1 OR linkedid = $1)
      AND deletedat IS NULL
    `,
      [primaryContact.id]
    );

    const emails = new Set();
    const phoneNumbers = new Set();
    const secondaryContactIds = [];

    for (const c of finalContacts) {
      if (c.email) emails.add(c.email);
      if (c.phonenumber) phoneNumbers.add(c.phonenumber);
      if (c.linkprecedence === "secondary") secondaryContactIds.push(c.id);
    }

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: [...emails],
        phoneNumbers: [...phoneNumbers],
        secondaryContactIds,
      },
    };
  } catch (error) {
    console.error("Error querying contacts:", error);
    return { error: "Internal server error" };
  }
}

module.exports = { identifyContact };
