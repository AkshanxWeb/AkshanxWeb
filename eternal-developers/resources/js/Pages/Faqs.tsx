import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import SiteLayout from '../Layouts/SiteLayout';

const questions = [
    ['What kinds of projects do you take on?', 'The service catalog covers software, AI, automation, design, search growth, mobile, cloud, and business systems. A first conversation helps determine whether the work is a fit.'],
    ['How do you price a project?', 'Pricing depends on the agreed scope, requirements, and dependencies. You’ll receive a written quotation for review; no sample prices are presented as approved company rates.'],
    ['Do you guarantee search rankings or AI results?', 'No. Search visibility and AI-generated answers depend on factors outside any one team’s control. We focus on sound technical work, useful content, and measurable improvement.'],
    ['How do you use AI in client work?', 'AI is used where it can solve a defined problem. Sensitive or consequential actions should include human review, and project-specific provider and data handling choices are discussed before implementation.'],
    ['Can I start with an early-stage idea?', 'Yes. A brief can be a question, a workflow, or an outcome you want to improve. We can help clarify the problem before recommending a build.'],
    ['When does work begin?', 'Work begins after both sides agree to a written scope, quotation, and applicable terms. This site does not collect payment or approve a project automatically.'],
];

export default function Faqs() {
    return <SiteLayout><Head title="Frequently asked questions" /><section className="page-hero page-width"><p className="eyebrow">The useful details</p><h1>Good questions<br /><span>deserve clear answers.</span></h1><p className="page-lede">A few things worth knowing before we start a conversation.</p></section><section className="faq-list page-width">{questions.map(([question, answer], index) => <details key={question} className="faq-item"><summary><span className="faq-number">{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><span className="faq-plus" aria-hidden="true" /></summary><p>{answer}</p></details>)}</section><section className="faq-cta page-width"><p>Still have a question?</p><Link className="button button-dark" href="/contact">Ask us directly <ArrowUpRight size={17} /></Link></section></SiteLayout>;
}