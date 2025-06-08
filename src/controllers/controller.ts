import { Request, Response } from "express";
import { createContact, findContactsByEmailOrPhone } from "../services/service";
import { Contact } from "../services/types";

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (
    (!email && !phoneNumber) ||
    (email && typeof email !== "string") ||
    (phoneNumber && typeof phoneNumber !== "string")
  ) {
    res.status(400).json({
      message: "At least one of email or phone number (as string) is required.",
    });
    return;
  }

  const contactData = await findContactsByEmailOrPhone(email, phoneNumber);

  if (contactData && contactData?.length === 0) {
    const data: Contact = {
      email: email ?? null,
      phoneNumber: phoneNumber ?? null,
      linkedId: null,
      linkPrecedence: "primary",
    };

    await createContact(data);

    const getContactData = await findContactsByEmailOrPhone(email, phoneNumber);
    const contact = getContactData?.[0];

    const response = {
      contact: {
        primaryContatctId: contact?.id,
        emails: [contact?.email],
        phoneNumbers: [contact?.phoneNumber],
        secondaryContactIds: [],
      },
    };

    res.status(200).json(response);
    return;
  } else if (contactData && contactData?.length > 0) {
    
  }

  res.status(200).json({ message: "Hello!" });
};
