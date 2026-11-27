// Calls Vite's build API directly, instead of spawning node_modules/.bin/vite as a
// shell command. This avoids relying on that shim file's executable permission bit,
// which is what was failing on Vercel. `node build.js` only ever needs `node` itself
// to be executable, which every platform guarantees.
import { build } from 'vite';

try {
  await build();
  console.log('Build finished.');
} catch (err) {
  console.error(err);
  process.exit(1);
}
