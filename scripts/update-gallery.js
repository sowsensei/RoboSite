/**
 * Обновить галерею: запустить после добавления фото в assets/gallery/photos/
 * Использование: node scripts/update-gallery.js
 */
const fs   = require('fs');
const path = require('path');

const photosDir    = path.join(__dirname, '..', 'assets', 'gallery', 'photos');
const manifestPath = path.join(__dirname, '..', 'assets', 'gallery', 'manifest.json');
const extensions   = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Сохраняем существующие подписи, чтобы не затереть их при обновлении
let captionMap = {};
try {
  const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  captionMap = Object.fromEntries((existing.photos || []).map(p => [p.file, p.caption]));
} catch {}

const files = fs.readdirSync(photosDir)
  .filter(f => extensions.includes(path.extname(f).toLowerCase()))
  .sort();

const manifest = {
  updated: new Date().toISOString().split('T')[0],
  photos: files.map(f => ({ file: f, caption: captionMap[f] || '' }))
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Готово: найдено ${files.length} фото → manifest.json обновлён.`);
