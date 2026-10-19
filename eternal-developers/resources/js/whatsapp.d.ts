export type WhatsAppEnquiry = {
    service: string;
    name?: string;
    project?: string;
    budget?: string;
    timeline?: string;
};

export const WHATSAPP_NUMBER: string;
export function buildWhatsAppUrl(enquiry: WhatsAppEnquiry): string;