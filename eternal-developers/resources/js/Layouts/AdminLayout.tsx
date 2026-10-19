import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, LogOut } from 'lucide-react';

export default function AdminLayout({ children, title = 'Leads & Enquiries' }: { children: React.ReactNode; title?: string }) {
    return (
        <div className="admin-shell">
            <Head title={`${title} · Eternal Developers`} />
            <header className="admin-header">
                <Link className="admin-brand" href="/admin/leads"><span className="brand-mark">e<span>.</span></span><span><strong>Leads & Enquiries</strong><small>Eternal Developers</small></span></Link>
                <div className="admin-header-actions"><Link href="/" className="admin-back"><ArrowLeft size={15} /> View website</Link><button type="button" className="admin-logout" onClick={() => router.post('/admin/logout')}><LogOut size={15} /> Sign out</button></div>
            </header>
            <main className="admin-main">{children}</main>
        </div>
    );
}