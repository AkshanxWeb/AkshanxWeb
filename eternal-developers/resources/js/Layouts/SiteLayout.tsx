import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

type LayoutProps = {
    children: React.ReactNode;
    eyebrow?: string;
};

export default function SiteLayout({ children }: LayoutProps) {
    const { url } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const nav = [
        { label: 'Services', href: '/services' },
        { label: 'Approach', href: '/about' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'FAQs', href: '/faqs' },
    ];

    return (
        <div className="site-shell">
            <header className="site-header">
                <Link className="brand" href="/" aria-label="Eternal Developers home">
                    <span className="brand-mark" aria-hidden="true">e<span>.</span></span>
                    <span className="brand-name">eternal<span>developers</span></span>
                </Link>
                <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
                <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
                    {nav.map((item) => (
                        <Link key={item.href} href={item.href} className={url.startsWith(item.href) ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                            {item.label}
                        </Link>
                    ))}
                    <Link className="nav-cta" href="/contact" onClick={() => setMenuOpen(false)}>
                        Start a project <ArrowUpRight size={15} />
                    </Link>
                </nav>
            </header>
            <main>{children}</main>
            <footer className="site-footer">
                <div className="footer-top">
                    <div>
                        <Link className="brand brand-footer" href="/">
                            <span className="brand-mark" aria-hidden="true">e<span>.</span></span>
                            <span className="brand-name">eternal<span>developers</span></span>
                        </Link>
                        <p className="footer-note">Your Vision. Our Code. Smarter with AI.</p>
                    </div>
                    <div className="footer-links">
                        <Link href="/services">Services</Link>
                        <Link href="/about">Our approach</Link>
                        <Link href="/pricing">Pricing approach</Link>
                        <Link href="/faqs">FAQs</Link>
                        <Link href="/contact">Contact</Link>
                    </div>
                    <Link className="footer-contact" href="/contact">Tell us what you're building <ArrowUpRight size={16} /></Link>
                </div>
                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} Eternal Developers</span>
                    <span>Built for useful work, made to grow.</span>
                </div>
            </footer>
        </div>
    );
}