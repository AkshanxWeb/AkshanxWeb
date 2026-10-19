import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { FormEvent } from 'react';
import SiteLayout from '../Layouts/SiteLayout';

type Service = { id: number; name: string };
export default function Contact({ services, selectedServiceId }: { services: Service[]; selectedServiceId: number | null }) {
    const { flash } = usePage().props;
    const form = useForm({ name: '', email: '', company: '', phone: '', service_id: selectedServiceId as number | null, project_brief: '', budget_range: '', desired_timeline: '', consent: false, website: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/contact', { preserveScroll: true, onSuccess: () => form.reset('name', 'email', 'company', 'phone', 'project_brief', 'budget_range', 'desired_timeline', 'consent') });
    }

    return (
        <SiteLayout>
            <Head title="Start a project"><meta name="description" content="Tell Eternal Developers what you are trying to build or improve." /></Head>
            <section className="contact-layout page-width">
                <div className="contact-intro">
                    <Link className="back-link" href="/"><ArrowLeft size={16} /> Back home</Link>
                    <p className="eyebrow">Start a conversation</p>
                    <h1>Good work<br />starts with<br /><span>a good brief.</span></h1>
                    <p className="page-lede">Tell us what you’re trying to solve. This is a first conversation, not a commitment.</p>
                    <div className="contact-promise"><span className="promise-mark"><CheckCircle2 size={17} /></span><p><strong>What happens next</strong><br />We’ll review your note and follow up to understand the project before discussing scope or pricing.</p></div>
                    <p className="contact-email-label">Prefer to keep exploring?</p><Link className="text-link" href="/services">Browse the service catalog <ArrowUpRight size={16} /></Link>
                </div>
                <div className="contact-form-wrap">
                    {flash?.success ? <div className="form-success" role="status"><CheckCircle2 size={25} /><h2>Message received.</h2><p>{flash.success}</p><Link className="text-link" href="/services">Keep exploring <ArrowUpRight size={16} /></Link></div> : <form className="project-form" onSubmit={submit}>
                        <div className="form-heading"><span>PROJECT ENQUIRY / 01</span><span>~ 3 MIN</span></div>
                        <h2>Tell us a little<br />about the work.</h2>
                        <div className="form-row"><label>Your name<input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} autoComplete="name" required />{form.errors.name && <small className="field-error">{form.errors.name}</small>}</label><label>Work email<input type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} autoComplete="email" required />{form.errors.email && <small className="field-error">{form.errors.email}</small>}</label></div>
                        <div className="form-row"><label>Company <span className="optional">Optional</span><input value={form.data.company} onChange={(event) => form.setData('company', event.target.value)} autoComplete="organization" /></label><label>Phone <span className="optional">Optional</span><input value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} autoComplete="tel" /></label></div>
                        <label>What would you like help with?<select value={form.data.service_id ?? ''} onChange={(event) => form.setData('service_id', event.target.value ? Number(event.target.value) : null)}><option value="">I’m not sure yet</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
                        <label>What are you hoping to make or improve?<textarea rows={5} value={form.data.project_brief} onChange={(event) => form.setData('project_brief', event.target.value)} placeholder="A few sentences about the challenge, users, or outcome is a great start." required />{form.errors.project_brief && <small className="field-error">{form.errors.project_brief}</small>}</label>
                        <div className="form-row"><label>Budget range <span className="optional">Optional</span><select value={form.data.budget_range} onChange={(event) => form.setData('budget_range', event.target.value)}><option value="">Select a range</option><option value="under-50k">Under ₹50,000</option><option value="50k-2l">₹50,000–₹2 lakh</option><option value="2l-5l">₹2–5 lakh</option><option value="5l-plus">₹5 lakh+</option><option value="not-sure">Not sure yet</option></select></label><label>Ideal timeline <span className="optional">Optional</span><select value={form.data.desired_timeline} onChange={(event) => form.setData('desired_timeline', event.target.value)}><option value="">Select a timeline</option><option value="within-month">Within a month</option><option value="1-3-months">1–3 months</option><option value="3-6-months">3–6 months</option><option value="flexible">Flexible</option></select></label></div>
                        <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.data.website} onChange={(event) => form.setData('website', event.target.value)} /></label></div>
                        <label className="consent-row"><input type="checkbox" checked={form.data.consent} onChange={(event) => form.setData('consent', event.target.checked)} required /><span>I agree that Eternal Developers may use these details to respond to my enquiry.</span></label>
                        {form.errors.consent && <small className="field-error">{form.errors.consent}</small>}
                        <button className="button button-dark form-submit" type="submit" disabled={form.processing}>{form.processing ? 'Sending…' : 'Send project enquiry'} <ArrowUpRight size={17} /></button>
                        <p className="form-privacy">Please don’t include passwords, payment information, or sensitive personal data.</p>
                    </form>}
                </div>
            </section>
        </SiteLayout>
    );
}