const { copyFileSync } = require('node:fs');
copyFileSync('node_modules/jszip/dist/jszip.min.js', 'docs/jszip.min.js');
copyFileSync('node_modules/jszip/LICENSE.markdown', 'docs/JSZip-LICENSE.markdown');
console.log('JSZip and its license copied to docs/.');
