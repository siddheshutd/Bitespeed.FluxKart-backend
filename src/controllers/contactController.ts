import { ContactService } from "../services/contactService";
import { Request, Response } from 'express';
import { ContactIdentifyResponse } from "../services/contactService";
import { IdentifyRequestSchema } from "../request-schemas/identify.request-schema";

export class ContactController {
    private contactService: ContactService;

    constructor() {
        this.contactService = new ContactService();
    }
    async identify(req: Request, res: Response): Promise<void> {
        try {
            const validationResult = IdentifyRequestSchema.safeParse(req.body);

            if(!validationResult.success) {
                res.status(400).json({
                    error: "Validation failed",
                    details: validationResult.error.errors
                });
            }

            const { email, phoneNumber } = validationResult.data!;

            let result: ContactIdentifyResponse;    
            if(email && phoneNumber) {
                result = await this.contactService.identifyContactByEmailAndPhoneNumber(email, phoneNumber.toString());
            } else if(email) {
                result = await this.contactService.identifyContactByEmail(email);
            } else {
                result = await this.contactService.identifyContactByPhoneNumber(phoneNumber!.toString());
            }

             res.status(200).json(result);
        } catch (error) {
            console.error('Error in ContactController.identify:', error);
             res.status(500).json({ 
                error: 'Internal server error',
                message: (error as Error).message
            });
        }
    }
} 