import { Request, Response } from "express";
import {
  createContact,
  findContactByEmailOrPhoneByPrecedence,
  findContactsByEmailOrPhone,
} from "../services/service";
import { Contact, ContactSchemaType } from "../services/types";

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
    const primaryContacts = await findContactByEmailOrPhoneByPrecedence(
      email,
      phoneNumber,
      "primary"
    );

    if (primaryContacts && primaryContacts?.length === 1) {
      const primaryContact = primaryContacts?.[0];

      if (
        primaryContact.email === email &&
        primaryContact.phoneNumber === phoneNumber
      ) {
        const response = {
          contact: {
            primaryContatctId: primaryContact?.id,
            emails: [primaryContact?.email],
            phoneNumbers: [primaryContact?.phoneNumber],
            secondaryContactIds: [],
          },
        };

        res.status(200).json(response);
        return;
      }

      const data: Contact = {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkedId: null,
        linkPrecedence: "secondary",
      };

      await createContact(data);

      const secondaryContacts = await findContactByEmailOrPhoneByPrecedence(
        email,
        phoneNumber,
        "secondary"
      );

      const secondaryContactsIds: number[] = [];
      const secondaryEmails: (string | null)[] = [];
      const secondaryPhoneNumbers: (string | null)[] = [];

      secondaryContacts?.forEach((item: ContactSchemaType) => {
        secondaryContactsIds.push(item?.id);
        secondaryEmails.push(item?.email);
        secondaryPhoneNumbers.push(item?.phoneNumber);
      });

      const response = {
        contact: {
          primaryContatctId: primaryContact?.id,
          emails: [primaryContact?.email, ...secondaryEmails],
          phoneNumbers: [primaryContact?.phoneNumber, ...secondaryPhoneNumbers],
          secondaryContactIds: [...secondaryContactsIds],
        },
      };

      res.status(200).json(response);
      return;
    } else if (primaryContacts && primaryContacts?.length > 1) {
      // console.log(primaryContacts)
    }
  }

  res.status(200).json({ message: "Hello!" });
};
