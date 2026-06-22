#!/usr/bin/env node
// Generate doc-source/docs-map.yaml from public/category.json.
// Top-level entries become menus; their `categories` become pages (status: pending).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteBase = 'https://mogumogu.dev';

const categories = JSON.parse(readFileSync(join(root, 'public/category.json'), 'utf8'));

// Preserve source order; `position` encodes it so output is deterministic per input.
const menus = categories.map((menu, index) => ({
  slug: menu.link,
  label: { en: menu.name_en, ko: menu.name_ko, ja: menu.name_ja },
  position: index + 1,
  pages: (menu.categories ?? []).map((page) => ({
    slug: page.link,
    label: page.name_en,
    url: `${siteBase}/${menu.link}/${page.link}`,
    status: 'pending',
  })),
}));

writeFileSync(join(root, 'doc-source/docs-map.yaml'), toYaml(menus), 'utf8');

// Hand-rolled serializer to avoid a runtime dependency. Every string value is
// double-quoted, so Unicode labels need no special casing.
function toYaml(menus) {
  const quote = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const lines = ['menus:'];
  for (const menu of menus) {
    lines.push(`  - slug: ${quote(menu.slug)}`);
    lines.push(`    label:`);
    lines.push(`      en: ${quote(menu.label.en)}`);
    lines.push(`      ko: ${quote(menu.label.ko)}`);
    lines.push(`      ja: ${quote(menu.label.ja)}`);
    lines.push(`    position: ${menu.position}`);
    lines.push(`    pages:`);
    for (const page of menu.pages) {
      lines.push(`      - slug: ${quote(page.slug)}`);
      lines.push(`        label: ${quote(page.label)}`);
      lines.push(`        url: ${quote(page.url)}`);
      lines.push(`        status: ${quote(page.status)}`);
    }
  }
  return lines.join('\n') + '\n';
}
