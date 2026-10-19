# Eternal Developers

Laravel 13, React, TypeScript, Inertia, and Tailwind application for the Eternal Developers agency website and enquiry workflow.

## Local setup

Requirements: PHP 8.3+, Composer, Node.js, npm, and SQLite or MySQL.

```bash
composer install
cp .env.example .env
php artisan key:generate
npm install
php artisan migrate --seed
npm run dev
```

In another terminal, run `php artisan serve`. The local SQLite database is stored at `database/database.sqlite` and is ignored by Git.

## Database connection

Laravel connects through `.env`; do not add passwords to source files or SQL queries. For local MySQL, configure:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

Use the database host and credentials provided by the hosting environment. Keep `.env` out of version control. Schema changes belong in `database/migrations/` and lead access belongs in Eloquent.

The read-only query [database/queries/all_leads.sql](database/queries/all_leads.sql) lists lead entries for an authorized database client. It contains no connection credentials.

## Enquiries, email, and queue

The public contact form persists a lead before dispatching its notification. Configure the recipient and an actual mail transport in the local/server `.env`:

```dotenv
LEAD_NOTIFICATION_EMAIL=your-company-inbox@example.com
APP_URL=https://eternaldeveloper.com
MAIL_MAILER=smtp
MAIL_SCHEME=smtp
MAIL_HOST=your-mail-host
MAIL_PORT=587
MAIL_USERNAME=your-mail-user
MAIL_PASSWORD=your-mail-password
MAIL_FROM_ADDRESS=verified-sender@example.com
MAIL_FROM_NAME="Eternal Developers"
QUEUE_CONNECTION=database
```

Never commit real mail credentials. Run a queue worker where supported:

```bash
php artisan queue:work --tries=3
```

Local `.env.example` uses the Laravel log mailer and intentionally leaves the recipient blank. In this state, the lead is saved and its notification is recorded as failed; no email is sent. Configure `LEAD_NOTIFICATION_EMAIL` and the production mail transport before relying on email alerts.

## Lead administrator

The current lead inbox uses one environment-configured administrator and session login. Generate a bcrypt hash locally without putting the password in source control:

```bash
php -r 'echo password_hash(readline("Admin password: "), PASSWORD_BCRYPT).PHP_EOL;'
```

Set the result in the private `.env`:

```dotenv
LEAD_ADMIN_EMAIL=your-admin-email@example.com
LEAD_ADMIN_PASSWORD_HASH=your-generated-bcrypt-hash
```

Open `/admin/login`. Admin routes fail closed unless both values are configured. The dashboard currently supports searching/filtering, status changes, notes, CSV export, contact actions, and failed notification retries. This is a single-admin setup, not multi-user roles or Filament.

## AI assistant

The assistant works with a catalog-grounded, no-key fallback and does not store conversation transcripts. An optional OpenAI-compatible provider can be enabled with server-only environment values:

```dotenv
AI_CHAT_API_KEY=your-provider-key
AI_CHAT_ENDPOINT=https://api.openai.com/v1/chat/completions
AI_CHAT_MODEL=gpt-4o-mini
AI_CHAT_TIMEOUT=12
```

Provider failures fall back to the guided responses. No provider key is included in this repository. Review provider terms, privacy, retention, and cost controls before production use.

## Verification

```bash
npm run typecheck
npm run build
npm run test:frontend
php artisan test
```

## Current scope and limitations

- The public agency site, service catalog, contact form, WhatsApp enquiry handoff, and fallback/optional AI chat are implemented.
- Lead notification email is not operational until a recipient, mail transport, and queue worker/hosting strategy are configured.
- Admin access requires a private admin email and bcrypt password hash in the environment.
- WhatsApp click initiation is tracked separately; opening WhatsApp is not treated as a submitted lead.
- No live Hostinger deployment, DNS change, or production database change is performed by this project setup.
<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
