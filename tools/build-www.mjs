// Copies the web app into www/, which Capacitor bundles into the iOS and
// Android apps. The repo root itself is what GitHub Pages serves.
import { cpSync, rmSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const www = new URL('www/', root);
rmSync(www, { recursive: true, force: true });
for (const f of ['index.html', 'style.css', 'manifest.webmanifest', 'js', 'icons'])
  cpSync(new URL(f, root), new URL(f, www), { recursive: true });
console.log('www/ built');
