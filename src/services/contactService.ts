import { ContactDataAccess } from '../dataAccess/contactDataAccess';
import { Contact, CreateContactData } from '../dataAccess/interfaces/contact';

export interface ContactIdentifyRequest {
  phoneNumber?: string;
  email?: string;
}

export interface ContactIdentifyResponse {
  contact: ContactListResponse;
}

export interface ContactListResponse {
  primaryContactId: number;
  emails: string[]; // first element being email of primary contact
  phoneNumbers: string[]; // first element being phoneNumber of primary contact
  secondaryContactIds: number[]; // Array of all Contact IDs that are "secondary" to the primary contact
}

export class ContactService {
  private contactDataAccess: ContactDataAccess;

  constructor() {
    this.contactDataAccess = new ContactDataAccess();
  }

  async identifyContactByEmail(request: ContactIdentifyRequest): Promise<ContactIdentifyResponse> {
    try {
        const contact = await this.contactDataAccess.getContactsByEmail(request.email!);

        if(!contact) {
          const newContact = await this.createContact(request.email!);
          var response: ContactIdentifyResponse = {
            contact: {
              primaryContactId: newContact.id,
              emails: [newContact.email!],
              phoneNumbers: [],
              secondaryContactIds: []
            }
          }
          return response;

        } else {
          var primaryContact = await this.contactDataAccess.getContactById(contact.linkedId ? contact.linkedId : contact.id);
          var linkedContacts = await this.contactDataAccess.getContactsByPrimaryContactId(primaryContact!.id);
          var response: ContactIdentifyResponse = {
            contact: mapToContactListResponse(primaryContact!, linkedContacts)
          }
          return response;
        }
      } catch (error) {
        console.error('Error in ContactService.identifyContactByEmail:', error);
        throw error;
    }
  }

  async identifyContactByPhoneNumber(request: ContactIdentifyRequest): Promise<ContactIdentifyResponse> {
    try {
      const contact = await this.contactDataAccess.getContactsByPhoneNumber(request.phoneNumber!);

      if (!contact) {
        const newContact = await this.createContact(undefined, request.phoneNumber!);
        var response: ContactIdentifyResponse = {
          contact: {
            primaryContactId: newContact.id,
            emails: [],
            phoneNumbers: [newContact.phoneNumber!],
            secondaryContactIds: []
          }
        }
        return response;
      } else {
        var primaryContact = await this.contactDataAccess.getContactById(contact.linkedId ? contact.linkedId : contact.id);
        var linkedContacts = await this.contactDataAccess.getContactsByPrimaryContactId(primaryContact!.id);
        
        return {
          contact: mapToContactListResponse(primaryContact!, linkedContacts)
        };
      }
    } catch (error) {
      console.error('Error in ContactService.identifyContactByPhoneNumber:', error);
      throw error;
    }
  }

  async createContact(email?: string, phoneNumber?: string): Promise<Contact> {
    try {
      let contactData: CreateContactData = {
        email: email ? email : undefined,
        phoneNumber: phoneNumber ? phoneNumber : undefined,
        linkPrecedence: 'primary',
      };
      const newContact = await this.contactDataAccess.createContact(contactData);
      return newContact;
    } catch (error) {
      console.error('Error in ContactService.createContact:', error);
      throw error;
    }
  }
}

function mapToContactListResponse(primaryContact: Contact, linkedContacts: Contact[]): ContactListResponse {
  const emails: string[] = [];
  const phoneNumbers: string[] = [];
  
  if (primaryContact.email) emails.push(primaryContact.email);
  if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);
  
  linkedContacts.forEach(contact => {
    if (contact.email && !emails.includes(contact.email)) {
      emails.push(contact.email);
    }
    if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
      phoneNumbers.push(contact.phoneNumber);
    }
  });
  
  return {
    primaryContactId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds: linkedContacts.map(contact => contact.id)
  };
} 