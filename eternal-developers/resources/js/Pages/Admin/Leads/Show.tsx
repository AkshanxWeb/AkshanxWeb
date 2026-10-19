import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Copy, ExternalLink, Mail, MessageCircle, RotateCcw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

type Delivery = { id: number; channel: string; status: string; attempts: number; last_error: string | null; sent_at: string | null };
type Lead = { id: number; name: string; email: string; phone: string | null; company: string | null; project_brief: string; budget_range: string | null; desired_timeline: string | null; source: string; status: string; internal_notes: string | null; created_at: string; service: { name: string } | null; notification_deliveries: Delivery[] };
export default function LeadShow({ lead, statuses }: { lead: Lead; statuses: string[] }) {
    const { flash, errors } = usePage().props;
    const [copied, setCopied] = useState('');
    const statusForm = useForm({ status: lead.status });
    const noteForm = useForm({ note: '' });
    const resendForm = useForm({});
    const delivery = lead.notification_deliveries.find((item) => item.channel === 'email');
    const waMessage = `Hello Eternal Developers!\n\nI am following up about ${lead.service?.name ?? 'a project enquiry'}.\n\nProject details: ${lead.project_brief}\n\nPlease share the next steps.`;
    const whatsappUrl = `https://wa.me/918957252371?${new URLSearchParams({ text: waMessage })}`;

    async function copy(value: string, label: string) {
        await navigator.clipboard.writeText(value);
        setCopied(label);
        window.setTimeout(() => setCopied(''), 1600);
    }

    function saveNote(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        noteForm.post(`/admin/leads/${lead.id}/notes`, { preserveScroll: true, onSuccess: () => noteForm.reset() });
    }

    return <AdminLayout title={`Lead #${lead.id}`}>
        <Head title={`Lead #${lead.id} · Leads & Enquiries`} />
        <Link className="admin-back-link" href="/admin/leads"><ArrowLeft size={15} /> All enquiries</Link>
        <section className="lead-detail-heading"><div><p className="eyebrow">Enquiry #{lead.id} · {new Date(lead.created_at).toLocaleString()}</p><h1>{lead.name}</h1><p>{lead.service?.name ?? 'Service not selected'} · {lead.source.replaceAll('_', ' ')}</p></div><span className={`status-badge status-${lead.status}`}>{lead.status}</span></section>
        {flash?.success && <p className="admin-success" role="status"><Check size={15} />{flash.success}</p>}
        {errors?.notification && <p className="admin-error" role="alert">{errors.notification}</p>}
        <div className="lead-detail-grid">
            <section className="lead-detail-main">
                <article className="admin-panel"><p className="eyebrow">Project brief</p><p className="lead-brief">{lead.project_brief}</p></article>
                <article className="admin-panel"><p className="eyebrow">Internal notes</p>{lead.internal_notes && <pre className="lead-notes">{lead.internal_notes}</pre>}<form className="admin-note-form" onSubmit={saveNote}><label htmlFor="lead-note">Add a note</label><textarea id="lead-note" rows={3} maxLength={4000} value={noteForm.data.note} onChange={(event) => noteForm.setData('note', event.target.value)} required /><button className="admin-filter-submit" type="submit" disabled={noteForm.processing}>Add note</button>{noteForm.errors.note && <small className="field-error">{noteForm.errors.note}</small>}</form></article>
            </section>
            <aside className="lead-detail-side">
                <article className="admin-panel"><p className="eyebrow">Contact</p><div className="lead-contact-row"><Mail size={15} /><a href={`mailto:${lead.email}`}>{lead.email}</a><button type="button" title="Copy email" onClick={() => copy(lead.email, 'email')}>{copied === 'email' ? <Check size={15} /> : <Copy size={15} />}</button></div>{lead.phone && <div className="lead-contact-row"><MessageCircle size={15} /><a href={`tel:${lead.phone}`}>{lead.phone}</a><button type="button" title="Copy phone" onClick={() => copy(lead.phone!, 'phone')}>{copied === 'phone' ? <Check size={15} /> : <Copy size={15} />}</button></div>}{lead.company && <p className="lead-company">{lead.company}</p>}<a className="admin-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Open WhatsApp <ExternalLink size={13} /></a></article>
                <article className="admin-panel"><p className="eyebrow">Lead status</p><form className="admin-status-form" onSubmit={(event) => { event.preventDefault(); statusForm.patch(`/admin/leads/${lead.id}`, { preserveScroll: true }); }}><select value={statusForm.data.status} onChange={(event) => statusForm.setData('status', event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select><button className="admin-filter-submit" type="submit" disabled={statusForm.processing}>Save status</button></form></article>
                <article className="admin-panel"><p className="eyebrow">Email notification</p><span className={`delivery-badge delivery-${delivery?.status ?? 'missing'}`}>{delivery?.status ?? 'not sent'}</span>{delivery?.last_error && <p className="delivery-error">{delivery.last_error}</p>}{delivery?.status === 'failed' && <button className="admin-retry" type="button" disabled={resendForm.processing} onClick={() => resendForm.post(`/admin/leads/${lead.id}/notification`, { preserveScroll: true })}><RotateCcw size={14} /> {resendForm.processing ? 'Queuing…' : 'Retry email'}</button>}</article>
                <article className="admin-panel lead-meta"><p className="eyebrow">Details</p><span>Budget<strong>{lead.budget_range ?? 'Not provided'}</strong></span><span>Timeline<strong>{lead.desired_timeline ?? 'Not provided'}</strong></span></article>
            </aside>
        </div>
    </AdminLayout>;
}