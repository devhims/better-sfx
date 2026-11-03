// Generate the category guides bundled with the installable skill.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

/** @type {import('../types/sfx.js').CatalogEntry[]} */
const catalog = JSON.parse(readFileSync('dist/catalog.json', 'utf8'));
const directory = 'skills/better-sfx/references/categories';
mkdirSync(directory, { recursive: true });

// A set can be browsed as a whole, or one action at a time alongside standalone sounds.
/** @type {Record<string, string>} */
const actionCategory = {
  click: 'clicks', hover: 'clicks', toggle: 'toggles', notify: 'notifications',
  success: 'success', error: 'errors', open: 'transitions', close: 'transitions',
  send: 'messages', delete: 'app actions',
};

for (const category of new Set(catalog.map(sound => sound.category))) {
  const sounds = catalog.filter(sound => sound.category === category ||
    (sound.set && sound.action && actionCategory[sound.action] === category));
  const title = category[0].toUpperCase() + category.slice(1);
  const rows = sounds.map(sound => `- \`${sound.id}\` (${sound.duration}s). ${sound.description}`);
  const slug = category.replaceAll(' ', '-');
  writeFileSync(`${directory}/${slug}.md`, [`# ${title}`, '', ...rows, ''].join('\n'));
}
