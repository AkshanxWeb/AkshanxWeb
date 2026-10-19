import { Head, useForm } from '@inertiajs/react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import type { FormEvent } from 'react';

export default function AdminLogin() {
    const form = useForm({ email: '', password: '' });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/admin/login');
    }

    return (
        <main className="admin-login-page">
            <Head title="Admin sign in · Eternal Developers" />
            <form className="admin-login-form" onSubmit={submit}>
                <div className="admin-login-mark"><LockKeyhole size={19} /></div>
                <p className="eyebrow">Eternal Developers / Private</p>
                <h1>Lead inbox</h1>
                <p className="admin-login-copy">Sign in to review and manage project enquiries.</p>
                <label>Email address<input autoComplete="username" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} required /></label>
                <label>Password<input autoComplete="current-password" type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required /></label>
                {form.errors.email && <p className="admin-error" role="alert">{form.errors.email}</p>}
                {form.errors.password && <p className="admin-error" role="alert">{form.errors.password}</p>}
                <button className="button button-dark" type="submit" disabled={form.processing}>{form.processing ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={16} /></button>
            </form>
        </main>
    );
}