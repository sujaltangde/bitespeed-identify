import { PrismaClient } from "@prisma/client";
import { Contact, LinkPrecedence } from "./types";

const prisma = new PrismaClient();

export const findContactsByEmailOrPhone = async (
  email?: string,
  phoneNumber?: string
) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

export const createContact = async (data: Contact) => {
  try {
    const newContact = await prisma.contact.create({
      data,
    });

    return newContact;
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

export const findContactByEmailOrPhoneByPrecedence = async (
  email?: string,
  phoneNumber?: string,
  linkPrecedence?: LinkPrecedence
) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        AND: [
          {
            OR: [
              email ? { email } : undefined,
              phoneNumber ? { phoneNumber } : undefined,
            ].filter(Boolean) as any,
          },
          { linkPrecedence },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return contacts;
  } catch (error) {
    console.error("Error fetching primary contacts:", error);
    throw error;
  }
};

export const findAllLinkedContacts = async (id: number) => {
  const contacts = await prisma.contact.findMany({
    where: {
      linkedId: id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return contacts;
};

export const updateContactById = async (id: number, data: any) => {
  try {
    const updatedContact = await prisma.contact.update({
      where: { id },
      data,
    });

    return updatedContact;
  } catch (error) {
    console.error(`Error updating contact with id ${id}:`, error);
    throw error;
  }
};

export const findContactById = async (id: any) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    return contact;
  } catch (error) {
    console.error(`Error fetching contact with id ${id}:`, error);
    throw error;
  }
};

export const checkIfContactExists = async (
  data: Contact
) => {
  try {
    const existingContact = await prisma.contact.findFirst({
      where: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        linkedId: data.linkedId,
        linkPrecedence: data.linkPrecedence,
      },
    });

    return !!existingContact; // returns true if exists, false if not
  } catch (error) {
    console.error("Error checking existing contact:", error);
    throw error;
  }
};
