/* Sync pdf-reader web build output into Chronnote desktop renderer public assets.
 *
 * Expected layout:
 *   chronnote-reader/build/web/**  (output of `npm run build`)
 *   apps/desktop-renderer/public/web/**  (static assets consumed by PDFCore.vue)
 *
 * This script intentionally only copies static dist files. The chronnote-reader
 * source code itself is not referenced by the Electron/Vite builds and will not
 * be included in the application bundle.
 */

const fs = require('fs');
const path = require('path');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    ensureDirSync(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursiveSync(srcPath, destPath);
    }
  } else {
    ensureDirSync(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

function main() {
  const rootDir = path.resolve(__dirname, '..', '..');
  const srcDir = path.resolve(__dirname, '..', 'build', 'web');
  const destDir = path.resolve(rootDir, 'apps', 'desktop-renderer', 'public', 'web');

  if (!fs.existsSync(srcDir)) {
    console.error(
      `[sync-to-chronnote] Source directory not found: ${srcDir}\n` +
        'Please run `npm run build` in chronnote-reader first.'
    );
    process.exit(1);
  }

  // Clean existing web assets (these are generated reader assets only)
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  copyRecursiveSync(srcDir, destDir);

  console.log(
    `[sync-to-chronnote] Synced pdf-reader dist from ${srcDir} to ${destDir}`
  );
}

main();

