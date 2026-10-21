const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const YAML = require('yaml');
function shared(fetch) {
  const context = { window: { AdminVendor: YAML }, TextDecoder, Uint8Array, atob, fetch,
    sessionStorage: { getItem: () => JSON.stringify({ owner: 'owner', repo: 'repo', branch: 'main', token: 'test' }) } };
  vm.runInNewContext(fs.readFileSync('admin/shared.js', 'utf8'), context);
  return context.window.AdminShared;
}
function frontmatter(source) { return YAML.parse(source.split(/^---\s*$/m)[1]); }
test('editing home preserves unknown metadata, nested settings, comments and body', () => {
  const source = fs.readFileSync('content/pages/home.md', 'utf8').replace('  limit: 4', '  limit: 8').replace('\nprojects:', '\ncustom_setting: keep-me\nprojects:') + '\nUntouched body.\n';
  const result = shared().pageMarkdown({ id: 'home', title: 'New title', description: 'Description', cta_text: 'Prompt', latest_works_heading: 'Work', latest_works_sub_heading: 'Sub', more_projects_text: 'More', actions_heading: 'Connect', actions_sub_heading: 'Sub', resume_text: 'Resume', contact_text: 'Contact', about_text: 'About', images: [{ path: '/photo.jpg', alt: 'Portrait' }] }, source);
  const data = frontmatter(result);
  assert.equal(data.projects.limit, 8);
  assert.equal(data.custom_setting, 'keep-me');
  assert.equal(data.meta_title, frontmatter(source).meta_title);
  assert.equal(data.actions.resume_link, '/resume/');
  assert.match(result, /# date \| weight/);
  assert.match(result, /Untouched body\.\n$/);
  assert.equal(data.profile_alt, 'Portrait');
});
test('editing about keeps additional gallery entries and image metadata', () => {
  const source = '---\nlayout: about\ncustom: true\ngallery:\n  - image: /one.jpg\n    credit: Photographer\n  - image: /two.jpg\n---\nOld body\n';
  const result = shared().pageMarkdown({ id: 'about', body: 'New body', images: [{ path: '/new.jpg', alt: 'New', caption: 'Caption' }] }, source);
  const data = frontmatter(result);
  assert.equal(data.custom, true);
  assert.equal(data.gallery[0].credit, 'Photographer');
  assert.equal(data.gallery[1].image, '/two.jpg');
  assert.match(result, /New body\n$/);
});
test('editing resume preserves body, title and per-image fields', () => {
  const source = '---\ntitle: Custom resume\nresume_file: /old.pdf\nexperience_gallery:\n  - image: /old.jpg\n    credit: Owner\n---\nKeep body\n';
  const result = shared().pageMarkdown({ id: 'resume', resume_file: '/new.pdf', images: [{ path: '/new.jpg', alt: 'Alt', caption: 'Caption' }] }, source);
  assert.equal(frontmatter(result).title, 'Custom resume');
  assert.equal(frontmatter(result).experience_gallery[0].credit, 'Owner');
  assert.match(result, /Keep body\n$/);
});
test('invalid YAML fails before publishing', () => {
  assert.throws(() => shared().pageMarkdown({ id: 'home' }, '---\nbad: [\n---\n'), /Invalid page YAML/);
});
test('publishing retries only a non-fast-forward update and never force pushes', async () => {
  let refs = 0, updates = 0;
  const api = shared(async (url, options = {}) => {
    let data;
    if (url.includes('/git/ref/heads/')) data = { object: { sha: `parent${++refs}` } };
    else if (url.includes('/git/commits/')) data = { tree: { sha: 'base' } };
    else if (url.endsWith('/git/trees')) data = { sha: 'tree' };
    else if (url.endsWith('/git/commits')) data = { sha: 'commit' };
    else if (options.method === 'PATCH') {
      assert.equal(JSON.parse(options.body).force, false);
      if (++updates === 1) return { ok: false, status: 422, json: async () => ({ message: 'Update is not a fast forward' }) };
      data = {};
    } else throw new Error(url);
    return { ok: true, status: 200, json: async () => data };
  });
  await api.commitChanges([], 'Test');
  assert.equal(refs, 2);
  assert.equal(updates, 2);
});
test('page source decoding preserves Unicode and selects the configured branch', async () => {
  const source = '---\ntitle: "Brady — 你好"\n---\n';
  const api = shared(async (url) => {
    assert.match(url, /\/contents\/content\/pages\/home\.md\?ref=main$/);
    return { ok: true, status: 200, json: async () => ({ encoding: 'base64', content: Buffer.from(source).toString('base64') }) };
  });
  assert.equal(await api.readPageSource('home'), source);
});
