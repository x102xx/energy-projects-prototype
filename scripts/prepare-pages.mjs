import { mkdir, copyFile, writeFile } from 'node:fs/promises';
await mkdir('docs', { recursive:true });
await copyFile('portable-site/index.html','docs/index.html');
await writeFile('docs/.nojekyll','');
console.log('GitHub Pages artifact prepared: docs/index.html');
