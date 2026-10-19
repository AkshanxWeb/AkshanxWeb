export const WHATSAPP_NUMBER = '918957252371';

export function buildWhatsAppUrl(enquiry) {
    const message = [
        'Hello Eternal Developers!',
        enquiry.name ? `My name is ${enquiry.name}.` : '',
        `I am interested in your ${enquiry.service} service.`,
        enquiry.project ? `Project details: ${enquiry.project}` : '',
        enquiry.budget ? `Budget: ${enquiry.budget}.` : '',
        enquiry.timeline ? `Timeline: ${enquiry.timeline}.` : '',
        'Please share the available options and next steps.',
        'I found your services through eternaldeveloper.com.',
    ].filter(Boolean).join('\n\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}