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

export interface Contact {
    id: number;
    phoneNumber: string | null;
    email: string | null;  
    linkedId: number | null;
    linkPrecedence: 'primary' | 'secondary';
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}