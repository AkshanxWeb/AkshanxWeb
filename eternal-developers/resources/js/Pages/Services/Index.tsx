import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import type { FormEvent } from 'react';
import SiteLayout from '../../Layouts/SiteLayout';

type Category = { name: string; slug: string };
type Service = { id: number; name: string; slug: string; summary: string; category: Category };

export default function ServicesIndex({ services, categories, filters }: { services: Service[]; categories: Category[]; filters: { q?: string; category?: string } }) {
    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.get('/services', { q: data.get('q') || undefined, category: filters.category || undefined }, { preserveState: true, replace: true });
    }

    return (
        <SiteLayout>
            <Head title="Services" />
            <section className="page-hero page-width">
                <p className="eyebrow">A connected toolkit</p>
                <h1>Services for<br /><span>what comes next.</span></h1>
                <p className="page-lede">Software, AI, design, and digital growth. Start with the challenge; we’ll help shape the right scope.</p>
            </section>
            <section className="catalog-section page-width">
                <div className="catalog-toolbar">
                    <form className="catalog-search" onSubmit={submitSearch}>
                        <Search size={18} /><input name="q" defaultValue={filters.q} placeholder="Find a service" aria-label="Find a service" /><button type="submit" aria-label="Search services"><ArrowRight size={17} /></button>
                    </form>
                    <div className="category-filters" aria-label="Filter by category">
                        <Link className={!filters.category ? 'filter-chip selected' : 'filter-chip'} href="/services">All services</Link>
                        {categories.map((category) => <Link key={category.slug} className={filters.category === category.slug ? 'filter-chip selected' : 'filter-chip'} href={`/services?category=${category.slug}${filters.q ? `&q=${encodeURIComponent(filters.q)}` : ''}`}>{category.name}</Link>)}
                    </div>
                </div>
                <p className="result-count">{services.length} {services.length === 1 ? 'service' : 'services'} to explore</p>
                {services.length > 0 ? <div className="catalog-grid">{services.map((service, index) => <Link className="catalog-card" href={`/services/${service.slug}`} key={service.id}><span className="catalog-card-index">{String(index + 1).padStart(2, '0')}</span><span className="tile-category">{service.category.name}</span><h2>{service.name}</h2><p>{service.summary}</p><span className="catalog-link">Explore service <ArrowUpRight size={16} /></span></Link>)}</div> : <div className="empty-state"><Search size={22} /><h2>No exact match yet.</h2><p>Try a broader term or browse all services.</p><Link className="text-link" href="/services">Clear filters <X size={16} /></Link></div>}
            </section>
            <section className="catalog-cta page-width"><p>Not sure what fits?</p><Link className="text-link" href="/contact">Tell us what you need to solve <ArrowRight size={17} /></Link></section>
        </SiteLayout>
    );
}