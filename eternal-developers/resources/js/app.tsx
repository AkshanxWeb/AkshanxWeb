import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/dm-sans';
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';

createInertiaApp({
    strictMode: true,
    pages: {
        path: './Pages',
        extension: '.tsx',
    },
});