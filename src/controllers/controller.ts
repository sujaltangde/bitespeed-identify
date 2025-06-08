import { Request, Response } from "express";
import {
  checkIfContactExists,
  createContact,
  findAllLinkedContacts,
  findContactByEmailOrPhoneByPrecedence,
  findContactById,
  findContactsByEmailOrPhone,
  updateContactById,
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
        linkedId: primaryContact?.id,
        linkPrecedence: "secondary",
      };

      const exists = await checkIfContactExists(data);

      if (!exists) {
        await createContact(data);
      }

      const secondaryContacts = await findAllLinkedContacts(primaryContact?.id);

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
      const sortedPrimaries = primaryContacts.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      const oldestPrimaryContact = sortedPrimaries[0];
      const newestPrimaryContact = sortedPrimaries[sortedPrimaries?.length - 1];

      const data = {
        linkedId: oldestPrimaryContact?.id,
        linkPrecedence: "secondary",
      };

      await updateContactById(newestPrimaryContact?.id, data);

      const newContactData: Contact = {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkedId: oldestPrimaryContact?.id,
        linkPrecedence: "secondary",
      };

      const exists = await checkIfContactExists(newContactData);

      if (!exists) {
        await createContact(newContactData);
      }

      const secondaryContacts = await findAllLinkedContacts(
        oldestPrimaryContact?.id
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
          primaryContatctId: oldestPrimaryContact?.id,
          emails: [oldestPrimaryContact?.email, ...secondaryEmails],
          phoneNumbers: [
            oldestPrimaryContact?.phoneNumber,
            ...secondaryPhoneNumbers,
          ],
          secondaryContactIds: [...secondaryContactsIds],
        },
      };

      res.status(200).json(response);
      return;
    } else {
      const relatedContact = contactData?.[0];

      const data: Contact = {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkedId: relatedContact?.linkedId,
        linkPrecedence: "secondary",
      };

      const exists = await checkIfContactExists(data);

      if (!exists) {
        await createContact(data);
      }

      const primaryContact: any = await findContactById(
        relatedContact?.linkedId
      );

      const secondaryContacts = await findAllLinkedContacts(primaryContact?.id);

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
    }
  }

  res.status(200).json({ message: "Hello!" });
};
