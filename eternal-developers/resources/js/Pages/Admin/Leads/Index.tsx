import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowDownToLine, ArrowUpRight, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';

type Service = { id: number; name: string };
type Delivery = { id: number; status: string; attempts: number; last_error: string | null; sent_at: string | null };
type Lead = { id: number; name: string; email: string; phone: string | null; company: string | null; project_brief: string; source: string; status: string; created_at: string; service: { name: string } | null; notification_deliveries: Delivery[] };
type Filters = { q?: string; status?: string; source?: string; service_id?: string; from?: string; to?: string };
type Page<T> = { data: T[]; current_page: number; last_page: number; total: number; links: Array<{ url: string | null; label: string; active: boolean }> };

const sourceLabels: Record<string, string> = {
    website_contact_form: 'Website form',
    service_page: 'Service page',
    quote_request: 'Quote request',
    ai_chatbot: 'AI chatbot',
    whatsapp_initiated: 'WhatsApp initiated',
    other: 'Other',
};

export default function LeadIndex({ leads, services, filters, counts }: { leads: Page<Lead>; services: Service[]; filters: Filters; counts: { new: number; open: number; failedNotifications: number } }) {
    const form = useForm({ q: filters.q ?? '', status: filters.status ?? '', source: filters.source ?? '', service_id: filters.service_id ?? '', from: filters.from ?? '', to: filters.to ?? '' });
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value).map(([key, value]) => [key, String(value)])).toString();

    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/admin/leads', Object.fromEntries(Object.entries(form.data).filter(([, value]) => value)), { preserveState: true, replace: true });
    }

    return <AdminLayout>
        <Head title="Leads & Enquiries · Eternal Developers" />
        <section className="admin-page-heading"><div><p className="eyebrow">Simple lead management</p><h1>Leads & Enquiries</h1><p>Review the latest project requests and choose the next action.</p></div><a className="admin-export" href={`/admin/leads/export${query ? `?${query}` : ''}`}><ArrowDownToLine size={15} /> Export CSV</a></section>
        <section className="admin-stats"><article><span>New enquiries</span><strong>{counts.new}</strong></article><article><span>Open leads</span><strong>{counts.open}</strong></article><article className={counts.failedNotifications ? 'has-alert' : ''}><span>Failed email alerts</span><strong>{counts.failedNotifications}</strong></article></section>
        <form className="admin-filters" onSubmit={search}>
            <label className="admin-search"><Search size={15} /><input placeholder="Search name, email, company or brief" value={form.data.q} onChange={(event) => form.setData('q', event.target.value)} /></label>
            <label>Status<select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}><option value="">All statuses</option>{['new', 'contacted', 'qualified', 'converted', 'closed'].map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Source<select value={form.data.source} onChange={(event) => form.setData('source', event.target.value)}><option value="">All sources</option>{Object.entries(sourceLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label>Service<select value={form.data.service_id} onChange={(event) => form.setData('service_id', event.target.value)}><option value="">All services</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
            <label>From<input type="date" value={form.data.from} onChange={(event) => form.setData('from', event.target.value)} /></label>
            <label>To<input type="date" value={form.data.to} onChange={(event) => form.setData('to', event.target.value)} /></label>
            <button className="admin-filter-submit" type="submit">Apply filters</button>
        </form>
        <div className="admin-table-wrap">
            <table className="admin-table"><thead><tr><th>Enquiry</th><th>Service</th><th>Source</th><th>Received</th><th>Status</th><th>Email alert</th><th /></tr></thead>
                <tbody>{leads.data.map((lead) => {
                    const delivery = lead.notification_deliveries.find((item) => item.status !== 'sent') ?? lead.notification_deliveries.at(-1);
                    return <tr key={lead.id}><td><Link className="admin-lead-name" href={`/admin/leads/${lead.id}`}>{lead.name}<small>{lead.email}{lead.company ? ` · ${lead.company}` : ''}</small></Link></td><td>{lead.service?.name ?? 'Not selected'}</td><td>{sourceLabels[lead.source] ?? lead.source}</td><td>{new Date(lead.created_at).toLocaleString()}</td><td><span className={`status-badge status-${lead.status}`}>{lead.status}</span></td><td><span className={`delivery-badge delivery-${delivery?.status ?? 'missing'}`}>{delivery?.status ?? 'not sent'}</span></td><td><Link className="admin-open-link" href={`/admin/leads/${lead.id}`} aria-label={`Open lead ${lead.id}`}><ArrowUpRight size={16} /></Link></td></tr>;
                })}</tbody>
            </table>
            {leads.data.length === 0 && <div className="admin-empty"><p>No enquiries match these filters.</p><button type="button" onClick={() => router.get('/admin/leads')}>Clear filters</button></div>}
        </div>
        <nav className="admin-pagination" aria-label="Lead pages">{leads.links.map((link, index) => <button key={`${index}-${link.label}`} type="button" disabled={!link.url} className={link.active ? 'active' : ''} onClick={() => link.url && router.visit(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>
        <p className="admin-result-count">{leads.total} total {leads.total === 1 ? 'enquiry' : 'enquiries'}</p>
    </AdminLayout>;
}