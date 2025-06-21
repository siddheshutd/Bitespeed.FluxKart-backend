import prisma from '../lib/prisma';
import { CreateContactData, UpdateContactData } from './interfaces/contact';

export class ContactDataAccess {

  async getContactById(id: number) {
    return await prisma.contact.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async getContactsByPrimaryContactId(primaryContactId: number) {
    return await prisma.contact.findMany({
      where: {
        linkedId: primaryContactId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  } 

  async getContactsByPhoneNumberOrEmail(phoneNumber: string, email: string) {
    return await prisma.contact.findMany({
      where: {
        OR: [
          { phoneNumber },
          { email },
        ],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getContactsByEmail(email: string) {
    return await prisma.contact.findFirst({
      where: {
        email,
        deletedAt: null,
      }
    });
  }

  async getContactsByPhoneNumber(phoneNumber: string) {
    return await prisma.contact.findFirst({
      where: {
        phoneNumber,
        deletedAt: null,
      },
    });
  } 

  async createContact(data: CreateContactData) {
    return await prisma.contact.create({
      data,
    });
  }

  async updateContact(id: number, data: UpdateContactData) {
    return await prisma.contact.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async updateContactsByLinkedId(oldLinkedId: number, newLinkedId: number) {
    return await prisma.contact.updateMany({
      where: { linkedId: oldLinkedId },
      data: { linkedId: newLinkedId },
    });
  }
} 