import { chromium } from 'playwright';
import { serve } from './serve-build.mjs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const fixtures = JSON.parse(execFileSync('bundle', ['exec', 'ruby', 'scripts/preview-fixtures.rb'], { encoding: 'utf8' }));
const { server, url } = await serve(resolve(process.argv[2] || '_site'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${url}/admin/`);
  await page.waitForFunction(() => document.querySelector('#project-preview').contentDocument?.querySelector('.gallery-item'));
  const differences = await page.evaluate(async (fixtures) => {
    const canonical = (html) => {
      const el = document.createElement('div'); el.innerHTML = html;
      // Compare layout and text, ignoring indentation and equivalent HTML serialization.
      const walk = (node) => node.nodeType === Node.TEXT_NODE
        ? (node.textContent.trim() ? node.textContent.replace(/\s+/g, ' ').trim() : null)
        : [node.tagName, [...node.attributes].map((attr) => [attr.name, attr.value]), [...node.childNodes].map(walk).filter(Boolean)];
      return JSON.stringify([...el.childNodes].map(walk).filter(Boolean));
    };
    const differences = [];
    for (const { page: project, html } of fixtures) {
      const preview = await window.renderProjectPreview(project, '<p>Fixture body</p>');
      if (canonical(html) !== canonical(preview)) differences.push(`${project.gallery_style}/${project.gallery_flip}/${project.gallery_count}`);
    }
    return differences;
  }, fixtures);
  assert.deepEqual(differences, [], 'Project preview must match Jekyll across all styles, flips and image counts');
  // Exercise the actual page editor UI and draft storage without sending GitHub writes.
  for (const id of ['home', 'about', 'resume']) {
    await page.locator(`[data-page-editor="${id}"]`).click();
    await page.locator('#page-images .page-image-alt').first().fill(`Test ${id}`);
    await page.locator('#save-page-draft').click();
    assert.equal(await page.evaluate((id) => JSON.parse(localStorage.getItem(`bradylin-page-draft:${id}`)).images[0].alt, id), `Test ${id}`);
  }
  await page.evaluate(async () => {
    const data = await fetch('./project-data.json').then((response) => response.json());
    const project = data.projects[0];
    const draft = { ...project, layout: 'project-4p' };
    delete draft.gallery_style;
    localStorage.setItem(`bradylin-project-draft:${project.slug}`, JSON.stringify(draft));
  });
  await page.reload();
  await page.waitForSelector('.template-card.selected[data-style="rows"]');
  assert.deepEqual(errors, [], 'No editor JavaScript errors');
  console.log(`${fixtures.length} Jekyll/preview comparisons plus page-editor and legacy-draft flows passed.`);
} finally { await browser.close(); server.close(); }
