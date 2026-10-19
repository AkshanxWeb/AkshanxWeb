import { Head, Link } from '@inertiajs/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Bot, Braces, ChevronRight, Code2, Layers3, MoveUpRight, Search, Sparkles, Workflow } from 'lucide-react';
import SiteLayout from '../Layouts/SiteLayout';

type Service = { id: number; name: string; slug: string; summary: string; category: { name: string; slug: string } };
type Category = { id: number; name: string; slug: string; summary: string; services_count: number };

export default function Home({ featuredServices, categories }: { featuredServices: Service[]; categories: Category[] }) {
    return (
        <SiteLayout>
            <Head title="Digital products, built with intent" />
            <section className="hero">
                <div className="hero-image" aria-hidden="true" />
                <div className="hero-wash" aria-hidden="true" />
                <div className="hero-content page-width">
                    <div className="hero-copy">
                        <p className="eyebrow eyebrow-light"><span className="live-dot" /> Independent digital studio · India & beyond</p>
                        <h1>Your vision.<br />Our code.<br /><em>Smarter with AI.</em></h1>
                        <p className="hero-intro">We build thoughtful software, useful AI, and digital experiences that help ambitious businesses move forward.</p>
                        <div className="hero-actions">
                            <Link className="button button-lime" href="/contact">Start a project <ArrowUpRight size={17} /></Link>
                            <Link className="text-link text-link-light" href="/services">Explore services <ArrowRight size={17} /></Link>
                        </div>
                    </div>
                    <div className="hero-side-note">
                        <div className="orbit-art" aria-hidden="true">
                            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                            <div className="orbit-core"><Sparkles size={25} strokeWidth={1.6} /></div>
                            <span className="orbit-node node-a"><Code2 size={16} /></span>
                            <span className="orbit-node node-b"><Bot size={16} /></span>
                            <span className="orbit-node node-c"><Workflow size={16} /></span>
                        </div>
                        <p>Good technology<br />starts with a better question.</p>
                    </div>
                    <a className="hero-scroll" href="#intro"><ArrowDown size={16} /> Scroll to explore</a>
                    <span className="hero-index">01 / 05</span>
                </div>
            </section>

            <section className="intro-section page-width" id="intro">
                <div className="section-label"><span>01</span> A more considered kind of digital partner</div>
                <div className="intro-grid">
                    <h2>Complex ideas,<br /><span>made useful.</span></h2>
                    <div className="intro-copy">
                        <p>Eternal Developers helps businesses build intelligent digital experiences, automate operations, and grow through custom software, artificial intelligence, cloud solutions, and digital growth.</p>
                        <Link className="text-link" href="/about">Get to know our approach <ArrowRight size={17} /></Link>
                    </div>
                </div>
                <div className="capability-strip">
                    <span><Braces size={17} /> Product engineering</span>
                    <span><Sparkles size={17} /> Practical AI</span>
                    <span><Workflow size={17} /> Business automation</span>
                    <span><Search size={17} /> Digital growth</span>
                </div>
            </section>

            <section className="services-section">
                <div className="page-width">
                    <div className="section-heading">
                        <div><p className="eyebrow">What we do</p><h2>Technology with<br /><span>a job to do.</span></h2></div>
                        <Link className="text-link" href="/services">All services <ArrowRight size={17} /></Link>
                    </div>
                    <div className="services-grid">
                        {featuredServices.map((service, index) => (
                            <Link className={`service-tile tile-${index + 1}`} href={`/services/${service.slug}`} key={service.id}>
                                <span className="tile-number">0{index + 1}</span>
                                <span className="tile-icon">{index % 3 === 0 ? <Code2 /> : index % 3 === 1 ? <Sparkles /> : <Layers3 />}</span>
                                <span className="tile-category">{service.category.name}</span>
                                <strong>{service.name}</strong>
                                <span className="tile-summary">{service.summary}</span>
                                <span className="tile-arrow"><ArrowUpRight size={18} /></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ai-section page-width" id="capabilities">
                <div className="ai-visual">
                    <div className="ai-visual-top"><span>INTELLIGENCE / 001</span><span className="ai-status"><i /> HUMAN-LED</span></div>
                    <div className="ai-signal signal-one" /><div className="ai-signal signal-two" />
                    <div className="ai-visual-center"><Sparkles size={34} /><span>human<br />judgment</span></div>
                    <div className="ai-chip chip-one">Context</div><div className="ai-chip chip-two">Boundaries</div><div className="ai-chip chip-three">Useful output</div>
                    <div className="ai-visual-bottom"><span>AI should make good work better.</span><span>↗</span></div>
                </div>
                <div className="ai-copy">
                    <p className="eyebrow">A practical AI point of view</p>
                    <h2>More signal.<br /><span>Less theatre.</span></h2>
                    <p>AI earns its place when it solves a real problem. We design assistants, integrations, and automation around your context, with clear limits and people in control.</p>
                    <ul className="check-list"><li>Grounded in approved information</li><li>Human review for consequential actions</li><li>Designed with privacy and cost in mind</li></ul>
                    <Link className="text-link" href="/services?category=ai-products">Explore AI services <ArrowRight size={17} /></Link>
                </div>
            </section>

            <section className="categories-section page-width">
                <div className="section-heading section-heading-tight">
                    <div><p className="eyebrow">A connected toolkit</p><h2>One team. <span>Many disciplines.</span></h2></div>
                    <p>Bring us a clear brief or an early question. We’ll help find the right starting point.</p>
                </div>
                <div className="category-list">
                    {categories.map((category, index) => (
                        <Link key={category.id} className="category-row" href={`/services?category=${category.slug}`}>
                            <span className="category-count">0{index + 1}</span><strong>{category.name}</strong><span className="category-summary">{category.summary}</span><span className="category-services">{category.services_count} services</span><ChevronRight size={18} />
                        </Link>
                    ))}
                </div>
            </section>

            <section className="process-section">
                <div className="page-width">
                    <div className="section-label"><span>02</span> How good work gets made</div>
                    <div className="process-heading"><h2>Clear thinking.<br /><span>Steady progress.</span></h2><p>No mystery process. We bring structure to the work, keep decisions visible, and make room to adjust as we learn.</p></div>
                    <div className="process-steps">
                        {[
                            ['01', 'Listen closely', 'We start with the people, goals, constraints, and evidence behind the brief.'],
                            ['02', 'Shape the work', 'We make scope, assumptions, risks, and next steps clear before committing.'],
                            ['03', 'Build together', 'We share working progress and invite useful feedback at the right moments.'],
                            ['04', 'Make it last', 'We test, hand over, and help your team understand what comes next.'],
                        ].map(([number, title, body]) => <article className="process-step" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
                    </div>
                </div>
            </section>

            <section className="closing-cta page-width">
                <div><p className="eyebrow">Have a challenge in mind?</p><h2>Let’s make the<br /><span>next thing real.</span></h2></div>
                <div className="closing-right"><p>Tell us what you’re trying to change. We’ll help turn it into a useful first conversation.</p><Link className="button button-dark" href="/contact">Tell us about it <MoveUpRight size={17} /></Link></div>
            </section>
        </SiteLayout>
    );
}