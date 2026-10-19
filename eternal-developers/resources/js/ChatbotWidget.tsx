import { ArrowUpRight, Bot, ChevronDown, Send, Sparkles, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { buildWhatsAppUrl } from './whatsapp';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Service = { id: number; name: string; slug: string; summary: string; category: { name: string } };
type LeadForm = { name: string; email: string; phone: string; service_id: string; project_brief: string; budget_range: string; desired_timeline: string; consent: boolean };

const quickReplies = ['AI Services', 'Website Development', 'Mobile App Development', 'SEO, AEO & GEO', 'Business Automation', 'Other Enquiry'];
const opening: ChatMessage = { role: 'assistant', content: 'Hi! Welcome to Eternal Developers. How can we help you today?' };

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([opening]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [leadFormOpen, setLeadFormOpen] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [leadForm, setLeadForm] = useState<LeadForm>({ name: '', email: '', phone: '', service_id: '', project_brief: '', budget_range: '', desired_timeline: '', consent: false });
    const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
    const [leadSending, setLeadSending] = useState(false);
    const [leadSaved, setLeadSaved] = useState(false);
    const [emailStatus, setEmailStatus] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, leadFormOpen, leadSaved]);

    useEffect(() => {
        const closeForWhatsApp = (event: Event) => {
            if ((event as CustomEvent<string>).detail === 'whatsapp') setOpen(false);
        };

        window.addEventListener('contact-panel-open', closeForWhatsApp);
        return () => window.removeEventListener('contact-panel-open', closeForWhatsApp);
    }, []);

    useEffect(() => {
        if (!open || !leadFormOpen || services.length > 0) return;

        void fetch('/chatbot/services', { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((response) => response.ok ? response.json() : Promise.reject())
            .then((data: { services: Service[] }) => setServices(data.services))
            .catch(() => setServices([]));
    }, [open, leadFormOpen, services.length]);

    async function sendMessage(text: string): Promise<void> {
        const content = text.trim();
        if (!content || isSending) return;

        const nextMessages = [...messages, { role: 'user' as const, content }];
        setMessages(nextMessages);
        setDraft('');
        setIsSending(true);

        try {
            const response = await fetch('/chatbot/message', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({
                    message: content,
                    history: nextMessages.slice(-7, -1).map(({ role, content: messageContent }) => ({ role, content: messageContent })),
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message ?? 'The assistant is unavailable.');
            setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages([...nextMessages, { role: 'assistant', content: 'I’m unable to answer that right now, but the enquiry form and WhatsApp options are available below.' }]);
        } finally {
            setIsSending(false);
        }
    }

    function submitMessage(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        void sendMessage(draft);
    }

    function updateLeadField<Key extends keyof LeadForm>(key: Key, value: LeadForm[Key]): void {
        setLeadForm((current) => ({ ...current, [key]: value }));
        setLeadErrors((current) => ({ ...current, [key]: '' }));
    }

    async function submitLead(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setLeadSending(true);
        setLeadErrors({});

        try {
            const response = await fetch('/chatbot/lead', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ ...leadForm, service_id: leadForm.service_id || null }),
            });
            const data = await response.json();

            if (response.status === 422) {
                setLeadErrors(Object.fromEntries(Object.entries(data.errors ?? {}).map(([key, value]) => [key, Array.isArray(value) ? value[0] : String(value)])));
                return;
            }
            if (!response.ok) throw new Error(data.message ?? 'The enquiry could not be saved.');

            setLeadSaved(true);
            setEmailStatus(data.email_notification);
            setMessages((current) => [...current, { role: 'assistant', content: data.message }]);
        } catch {
            setLeadErrors({ form: 'We could not save the enquiry. Please try the contact form or WhatsApp instead.' });
        } finally {
            setLeadSending(false);
        }
    }

    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content;
    const handoffUrl = buildWhatsAppUrl({ service: leadForm.service_id ? services.find((item) => String(item.id) === leadForm.service_id)?.name ?? 'Other Enquiry' : 'Other Enquiry', project: lastUserMessage });

    return <div className="chatbot-widget">
        {open && <section className="chatbot-panel" role="dialog" aria-modal="false" aria-labelledby="chatbot-title">
            <header className="chatbot-header"><span className="chatbot-avatar"><Bot size={18} /></span><div><h2 id="chatbot-title">Eternal assistant</h2><p><i /> Service information · human-led</p></div><button type="button" aria-label="Minimize assistant" onClick={() => setOpen(false)}><ChevronDown size={19} /></button></header>
            <div className="chatbot-messages" ref={scrollRef} aria-live="polite">
                {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-message-row ${message.role}`}><span className="chat-message-avatar">{message.role === 'assistant' ? <Sparkles size={13} /> : <UserRound size={13} />}</span><p>{message.content}</p></div>)}
                {isSending && <div className="chat-thinking" role="status"><span /><span /><span /> Thinking</div>}
                {!leadFormOpen && !leadSaved && messages.length < 3 && <div className="chat-quick-replies">{quickReplies.map((reply) => <button key={reply} type="button" disabled={isSending} onClick={() => void sendMessage(reply)}>{reply}</button>)}</div>}
                {leadFormOpen && !leadSaved && <form className="chat-lead-form" onSubmit={submitLead}>
                    <p className="chat-form-heading">Send a project enquiry</p>
                    <label>Name<input value={leadForm.name} onChange={(event) => updateLeadField('name', event.target.value)} required maxLength={120} autoComplete="name" />{leadErrors.name && <small>{leadErrors.name}</small>}</label>
                    <label>Email<input type="email" value={leadForm.email} onChange={(event) => updateLeadField('email', event.target.value)} required maxLength={254} autoComplete="email" />{leadErrors.email && <small>{leadErrors.email}</small>}</label>
                    <label>Phone <span>Optional</span><input value={leadForm.phone} onChange={(event) => updateLeadField('phone', event.target.value)} maxLength={40} autoComplete="tel" /></label>
                    <label>Service<select value={leadForm.service_id} onChange={(event) => updateLeadField('service_id', event.target.value)}><option value="">Not sure yet</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
                    <label>Project brief<textarea rows={3} minLength={20} maxLength={6000} value={leadForm.project_brief} onChange={(event) => updateLeadField('project_brief', event.target.value)} required placeholder="What would you like to build or improve?" />{leadErrors.project_brief && <small>{leadErrors.project_brief}</small>}</label>
                    <div className="chat-form-row"><label>Budget <span>Optional</span><select value={leadForm.budget_range} onChange={(event) => updateLeadField('budget_range', event.target.value)}><option value="">Skip</option><option value="under-50k">Under ₹50,000</option><option value="50k-2l">₹50,000–₹2 lakh</option><option value="2l-5l">₹2–5 lakh</option><option value="5l-plus">₹5 lakh+</option><option value="not-sure">Not sure</option></select></label><label>Timeline <span>Optional</span><select value={leadForm.desired_timeline} onChange={(event) => updateLeadField('desired_timeline', event.target.value)}><option value="">Skip</option><option value="within-month">Within one month</option><option value="1-3-months">1–3 months</option><option value="3-6-months">3–6 months</option><option value="flexible">Flexible</option></select></label></div>
                    <label className="chat-consent"><input type="checkbox" checked={leadForm.consent} onChange={(event) => updateLeadField('consent', event.target.checked)} required /><span>I agree that Eternal Developers may use these details to respond to my enquiry.</span></label>
                    {leadErrors.consent && <small>{leadErrors.consent}</small>}{leadErrors.form && <small>{leadErrors.form}</small>}
                    <button className="chat-send-enquiry" type="submit" disabled={leadSending}>{leadSending ? 'Sending…' : 'Send an enquiry'} <Send size={13} /></button>
                    <p className="chat-form-privacy">Only this enquiry is saved; the chat transcript is not stored.</p>
                </form>}
                {leadSaved && <p className="chat-email-status">{emailStatus === 'failed' ? 'Your enquiry is saved. Email notifications are not configured yet.' : 'Your enquiry is saved for the team.'}</p>}
            </div>
            <footer className="chatbot-footer">
                {!leadSaved && <div className="chat-secondary-actions"><button type="button" onClick={() => { setLeadFormOpen(!leadFormOpen); setLeadErrors({}); }}>{leadFormOpen ? 'Back to chat' : 'Send an enquiry'}</button><a href={handoffUrl} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={12} /></a></div>}
                {!leadFormOpen && !leadSaved && <form className="chat-input-form" onSubmit={submitMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about a service…" aria-label="Message the assistant" maxLength={1000} /><button type="submit" aria-label="Send message" disabled={!draft.trim() || isSending}><Send size={15} /></button></form>}
                <p className="chat-disclaimer">Guidance is based on the published service catalog. Pricing and scope need team review.</p>
            </footer>
        </section>}
        <button className="chatbot-launcher" type="button" aria-expanded={open} aria-label={open ? 'Close AI assistant' : 'Ask our AI assistant'} onClick={() => { if (!open) window.dispatchEvent(new CustomEvent('contact-panel-open', { detail: 'chatbot' })); setOpen(!open); }}>{open ? <X size={18} /> : <Bot size={18} />}<span>{open ? 'Close assistant' : 'Ask our AI assistant'}</span></button>
    </div>;
}