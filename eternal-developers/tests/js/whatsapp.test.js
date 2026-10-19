import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from '../../resources/js/whatsapp.js';

describe('WhatsApp enquiry link', () => {
    it('uses the official international click-to-chat destination', () => {
        const url = new URL(buildWhatsAppUrl({ service: 'Website Development' }));

        assert.equal(url.origin, 'https://wa.me');
        assert.equal(url.pathname, `/${WHATSAPP_NUMBER}`);
        assert.equal(WHATSAPP_NUMBER, '918957252371');
    });

    it('encodes visitor-provided text and includes only supplied details', () => {
        const url = buildWhatsAppUrl({
            service: 'Website Development',
            name: 'Mira & Co',
            project: 'A site for tea? 50% online orders',
            budget: '₹15,000–₹50,000',
        });
        const parsed = new URL(url);
        const message = parsed.searchParams.get('text');

        assert.ok(url.includes('%26'));
        assert.ok(message?.includes('My name is Mira & Co.'));
        assert.ok(message?.includes('A site for tea? 50% online orders'));
        assert.ok(message?.includes('Budget: ₹15,000–₹50,000.'));
        assert.ok(!message?.includes('Timeline:'));
        assert.ok(!message?.includes('undefined'));
    });
});