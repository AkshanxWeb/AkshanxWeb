import { ArrowUpRight, Check, ChevronLeft, Copy, MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buildWhatsAppUrl } from './whatsapp';

const services = [
    'AI Services & AI Integration',
    'Website Development',
    'Mobile App Development',
    'SEO, AEO & GEO',
    'Digital Marketing',
    'Business Automation',
    'Cloud & Software Solutions',
    'Other Enquiry',
];

export default function WhatsAppWidget() {
    const [open, setOpen] = useState(false);
    const [service, setService] = useState('');
    const [name, setName] = useState('');
    const [project, setProject] = useState('');
    const [budget, setBudget] = useState('');
    const [timeline, setTimeline] = useState('');
    const [fallbackUrl, setFallbackUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const closeForChatbot = (event: Event) => {
            if ((event as CustomEvent<string>).detail === 'chatbot') setOpen(false);
        };

        window.addEventListener('contact-panel-open', closeForChatbot);
        return () => window.removeEventListener('contact-panel-open', closeForChatbot);
    }, []);

    function continueToWhatsApp(): void {
        const selectedService = service || 'Other Enquiry';
        const url = buildWhatsAppUrl({ service: selectedService, name, project, budget, timeline });
        setFallbackUrl(url);

        const popup = window.open(url, '_blank');
        if (popup) popup.opener = null;

        void fetch('/contact/whatsapp-initiation', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ service: selectedService }),
        }).catch(() => undefined);
    }

    async function copyMessage(): Promise<void> {
        const url = buildWhatsAppUrl({ service: service || 'Other Enquiry', name, project, budget, timeline });
        try {
            await navigator.clipboard.writeText(new URL(url).searchParams.get('text') ?? '');
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return <div className="whatsapp-widget">
        {open && <section className="whatsapp-panel" role="dialog" aria-modal="false" aria-labelledby="whatsapp-title">
            <header className="whatsapp-panel-header"><span className="whatsapp-symbol"><MessageCircle size={17} /></span><div><h2 id="whatsapp-title">How can we help you?</h2><p>Choose a service to start your enquiry on WhatsApp.</p></div><button type="button" aria-label="Close WhatsApp panel" onClick={() => setOpen(false)}><X size={18} /></button></header>
            <div className="whatsapp-panel-content">
                {!service ? <>
                    <div className="whatsapp-service-list">{services.map((item) => <button type="button" key={item} onClick={() => setService(item)}>{item}<ArrowUpRight size={14} /></button>)}</div>
                    <button className="whatsapp-unsure" type="button" onClick={() => setService("I'm not sure — help me choose")}>I’m not sure — help me choose</button>
                    <button className="whatsapp-unsure" type="button" onClick={() => setService('Talk to the team')}>Talk to the team</button>
                </> : <>
                    <button type="button" className="whatsapp-change-service" onClick={() => { setService(''); setFallbackUrl(''); }}><ChevronLeft size={14} /> Change service</button>
                    <p className="whatsapp-selected-service">{service}</p>
                    <p className="whatsapp-optional-note">Add a little context, or continue without filling anything in.</p>
                    <label>Your name <span>Optional</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
                    <label>Project details <span>Optional</span><textarea rows={3} maxLength={1200} value={project} onChange={(event) => setProject(event.target.value)} placeholder="What are you hoping to build or improve?" /></label>
                    <div className="whatsapp-form-row"><label>Budget <span>Optional</span><select value={budget} onChange={(event) => setBudget(event.target.value)}><option value="">Skip</option><option>Under ₹50,000</option><option>₹50,000–₹2 lakh</option><option>₹2–5 lakh</option><option>₹5 lakh+</option><option>Not sure yet</option></select></label><label>Timeline <span>Optional</span><select value={timeline} onChange={(event) => setTimeline(event.target.value)}><option value="">Skip</option><option>Within one month</option><option>1–3 months</option><option>3–6 months</option><option>Flexible</option></select></label></div>
                    <button className="button button-dark whatsapp-continue" type="button" onClick={continueToWhatsApp}>Continue to WhatsApp <ArrowUpRight size={16} /></button>
                    <p className="whatsapp-disclaimer">WhatsApp opens with a draft. Review and send it there; opening WhatsApp does not submit an enquiry to this website.</p>
                    {fallbackUrl && <div className="whatsapp-fallback"><a href={fallbackUrl} target="_blank" rel="noreferrer">Open WhatsApp manually <ArrowUpRight size={13} /></a><button type="button" onClick={copyMessage}>{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy message'}</button></div>}
                </>}
            </div>
        </section>}
        <button className="whatsapp-launcher" type="button" aria-expanded={open} aria-label={open ? 'Close WhatsApp enquiry panel' : 'Chat on WhatsApp'} onClick={() => { if (!open) window.dispatchEvent(new CustomEvent('contact-panel-open', { detail: 'whatsapp' })); setOpen(!open); }}>
            {open ? <X size={19} /> : <MessageCircle size={19} />}<span>{open ? 'Close' : 'Chat on WhatsApp'}</span>
        </button>
    </div>;
}