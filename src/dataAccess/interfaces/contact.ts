// Contact Data Access Interfaces

export interface CreateContactData {
    phoneNumber?: string;
    email?: string;
    linkedId?: number;
    linkPrecedence: 'primary' | 'secondary';
}

export interface UpdateContactData {
    phoneNumber?: string;
    email?: string;
    linkedId?: number;
    linkPrecedence?: 'primary' | 'secondary';
    deletedAt?: Date;
}