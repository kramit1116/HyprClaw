#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Suppress the punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.code !== 'DEP0040') {
        console.warn(warning);
    }
});

// Get the directory of this script
const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = join(__dirname, 'dist', 'cli.js');

// Load and run the actual CLI
import(cliPath).catch(err => {
    console.error(err);
    process.exit(1);
});
