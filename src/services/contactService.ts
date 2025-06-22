import { ContactDataAccess } from '../dataAccess/contactDataAccess';
import { Contact, CreateContactData, UpdateContactData } from '../dataAccess/interfaces/contact';

export interface ContactIdentifyRequest {
  email?: string;
  phoneNumber?: number;
}

export interface ContactIdentifyResponse {
  contact: ContactListResponse;
}

export interface ContactListResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export class ContactService {
  private contactDataAccess: ContactDataAccess;

  constructor() {
    this.contactDataAccess = new ContactDataAccess();
  }

  async identifyContactByEmail(email: string): Promise<ContactIdentifyResponse> {
    try {
      const contact = await this.contactDataAccess.getContactsByEmail(email);

      if(!contact) { //If no existing contact found, create a new primary contact
        const newContact = await this.createContact('primary', email);
        return {contact: mapToContactListResponse(newContact, [])};

      } else { //Else directly process the response as we don't need to create a new contact
        const primaryContact = await this.resolvePrimaryContact(contact);
        return this.processIdentifyResponse(primaryContact!);
      }
    } catch (error) {
      console.error('Error in ContactService.identifyContactByEmail:', error);
      throw error;
    }
  }

  async identifyContactByPhoneNumber(phoneNumber: string): Promise<ContactIdentifyResponse> {
    try {
      const contact = await this.contactDataAccess.getContactsByPhoneNumber(phoneNumber);

      if (!contact) { //If no existing contact found, create a new primary contact
        const newContact = await this.createContact('primary', undefined, phoneNumber);
        return {contact: mapToContactListResponse(newContact, [])};
      } else { //Else directly process the response as we don't need to create a new contact
        const primaryContact = await this.resolvePrimaryContact(contact);
        return this.processIdentifyResponse(primaryContact!);
      }
    } catch (error) {
      console.error('Error in ContactService.identifyContactByPhoneNumber:', error);
      throw error;
    }
  }

  async identifyContactByEmailAndPhoneNumber(email: string, phoneNumber: string): Promise<ContactIdentifyResponse> {
    try {
      const contacts = await this.contactDataAccess.getContactsByPhoneNumberOrEmail(phoneNumber, email);

      if(contacts.length === 0) {//If no existing contacts found, create a new primary contact
        const newContact = await this.createContact('primary', email, phoneNumber);
        return {
          contact: mapToContactListResponse(newContact, [])
        };
      } else {
        //Check if there is an exact match
        const exactMatch = contacts.find(contact => 
          contact.email === email && contact.phoneNumber === phoneNumber
        );
        if(exactMatch) {
          const primaryContact = await this.resolvePrimaryContact(exactMatch);
          return this.processIdentifyResponse(primaryContact!); 
        }

        //Find out how many primary contacts are there
        const primaryContactIds = new Set<number>();
        contacts.forEach(contact => {
          if (contact.linkPrecedence === 'primary') {
            primaryContactIds.add(contact.id);
          } else {
            primaryContactIds.add(contact.linkedId!);
          }
        });
        
        const primaryIds = Array.from(primaryContactIds);
        if(primaryIds.length === 1) { //If there is only one primary contact, create a new secondary contact
          const primaryContactId = primaryIds[0];
          const newContact = await this.createContact('secondary', email, phoneNumber, primaryContactId);

          let primaryContact: Contact | null | undefined = contacts.find(contact => contact.id === primaryContactId);
          if(!primaryContact) {
            primaryContact = await this.contactDataAccess.getContactById(primaryContactId);
          }
          return this.processIdentifyResponse(primaryContact!);
        } 
        else { //If there are multiple primary contacts, demote the newer primary contact to secondary and update it's children
          const primaryContacts = await this.contactDataAccess.getContactsByIds(primaryIds);
          const primaryContact = primaryContacts[0];
          const newSecondaryContact = primaryContacts[1];

          var updatedContact: UpdateContactData = {
            linkedId: primaryContact.id,
            linkPrecedence: 'secondary'
          }
          //Update the new secondary contact to link to the primary contact
          await this.updateContact(newSecondaryContact.id, updatedContact);
          //Update all the children of secondary contact
          await this.contactDataAccess.updateContactsByLinkedId(newSecondaryContact.id, primaryContact.id);
          return this.processIdentifyResponse(primaryContact);
        }
      }
    } catch (error) {
      console.error('Error in ContactService.identifyContactByEmailAndPhoneNumber:', error);
      throw error;
    }
  }

  async processIdentifyResponse(primaryContact: Contact): Promise<ContactIdentifyResponse>{
    var linkedContacts = await this.contactDataAccess.getContactsByPrimaryContactId(primaryContact.id);
    return {
      contact: mapToContactListResponse(primaryContact, linkedContacts)
    };
  }

  private async resolvePrimaryContact(contact: Contact): Promise<Contact | null> {
    if (contact.linkPrecedence === 'primary') {
      return contact;
    }
    
    const primaryContactId = contact.linkedId || contact.id;
    return await this.contactDataAccess.getContactById(primaryContactId);
  }

  async createContact(precedence: 'primary' | 'secondary',email?: string, phoneNumber?: string, linkedId?: number): Promise<Contact> {
    try {
      let contactData: CreateContactData = {
        email: email ? email : undefined,
        phoneNumber: phoneNumber ? phoneNumber : undefined,
        linkedId: linkedId ? linkedId : undefined,
        linkPrecedence: precedence
      };
      const newContact = await this.contactDataAccess.createContact(contactData);
      return newContact;
    } catch (error) {
      console.error('Error in ContactService.createContact:', error);
      throw error;
    }
  }

  async updateContact(id: number, data: UpdateContactData): Promise<Contact> {
    try {
      const updatedContact = await this.contactDataAccess.updateContact(id, data);
      return updatedContact;
    } 
    catch (error) {
      console.error('Error in ContactService.updateContact:', error);
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