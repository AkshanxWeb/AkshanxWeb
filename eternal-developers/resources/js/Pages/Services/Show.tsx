import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import SiteLayout from '../../Layouts/SiteLayout';

type Service = { id: number; name: string; slug: string; summary: string; description: string; pricing_type: string; delivery_estimate: string | null; category: { name: string; slug: string } };

export default function ServiceShow({ service, relatedServices }: { service: Service; relatedServices: Array<Pick<Service, 'id' | 'name' | 'slug' | 'summary'>> }) {
    return (
        <SiteLayout>
            <Head title={service.name}><meta name="description" content={service.summary} /></Head>
            <section className="detail-hero page-width">
                <Link className="back-link" href="/services"><ArrowLeft size={16} /> All services</Link>
                <p className="eyebrow">{service.category.name}</p>
                <h1>{service.name}<br /><span>built around your goals.</span></h1>
                <p className="page-lede">{service.summary}</p>
                <Link className="button button-dark" href={`/contact?service=${service.slug}`}>Discuss this service <ArrowUpRight size={17} /></Link>
            </section>
            <section className="detail-body page-width">
                <div className="detail-main"><p className="eyebrow">The work</p><h2>Start with the outcome.<br /><span>Then shape the right solution.</span></h2><p>{service.description}</p><p>Every engagement begins with a conversation about your requirements, existing systems, timeline, and constraints. We’ll clarify what is included before a quotation is approved.</p></div>
                <aside className="detail-aside"><p className="eyebrow">A considered start</p><ul className="detail-points"><li><Check size={16} /> Clear scope before commitment</li><li><Check size={16} /> Assumptions surfaced early</li><li><Check size={16} /> Human review of decisions</li></ul><div className="pricing-note"><span>Investment</span><strong>Custom scope</strong><small>We’ll provide a written quotation after understanding your brief.</small></div></aside>
            </section>
            {relatedServices.length > 0 && <section className="related-section page-width"><div className="section-heading"><div><p className="eyebrow">In the same toolkit</p><h2>Related services</h2></div></div><div className="related-list">{relatedServices.map((item) => <Link key={item.id} className="related-row" href={`/services/${item.slug}`}><span><strong>{item.name}</strong><small>{item.summary}</small></span><ArrowRight size={18} /></Link>)}</div></section>}
        </SiteLayout>
    );
}