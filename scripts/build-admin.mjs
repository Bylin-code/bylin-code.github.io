import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await build({
  entryPoints: ['scripts/admin-vendor.mjs'], outfile: 'admin/vendor.js',
  bundle: true, minify: true, platform: 'browser', legalComments: 'eof',
  banner: { js: '/* YAML and LiquidJS licenses: admin/licenses/. Rebuild with npm run build:admin. */' },
});
await mkdir('admin/licenses', { recursive: true });
for (const name of ['yaml', 'liquidjs']) {
  await copyFile(`node_modules/${name}/LICENSE`, `admin/licenses/${name}.txt`);
}
