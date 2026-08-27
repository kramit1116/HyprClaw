#!/usr/bin/env node

// Suppress the punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.code !== 'DEP0040') {
        console.warn(warning);
    }
});

// Load and run the actual CLI
import('./dist/cli.js').catch(err => {
    console.error(err);
    process.exit(1);
});
