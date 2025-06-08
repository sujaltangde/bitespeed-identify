
import { PrismaClient } from '@prisma/client';
import { Contact } from './types';

const prisma = new PrismaClient();


export const findContactsByEmailOrPhone = async (email?: string, phoneNumber?: string) => {

  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
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
    console.error('Error creating contact:', error);
    throw error;
  }
};

