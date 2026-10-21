/* Shared editor services. UI state remains in each editor. */
(() => {
  'use strict';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]));
  function githubConfig() {
    try {
      const saved = JSON.parse(sessionStorage.getItem('bradylin-github-publishing') || 'null');
      return saved?.token && saved?.owner && saved?.repo && saved?.branch ? saved : null;
    } catch (_) { return null; }
  }

  async function githubApi(path, options = {}, configOverride = null) {
    const config = configOverride || githubConfig();
    if (!config) throw new Error('GitHub is not connected.');
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers || {}),
      },
    });
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.message || `GitHub returned ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function createBlob(content, encoding = 'utf-8') {
    const blob = await githubApi('/git/blobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, encoding }),
    });
    return blob.sha;
  }

  async function commitChanges(entries, message, onRetry = () => {}) {
    const config = githubConfig();
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const ref = await githubApi(`/git/ref/heads/${encodeURIComponent(config.branch)}`);
      const parentSha = ref.object.sha;
      const parent = await githubApi(`/git/commits/${parentSha}`);
      const tree = await githubApi('/git/trees', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_tree: parent.tree.sha, tree: entries }),
      });
      const commit = await githubApi('/git/commits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
      });
      try {
        await githubApi(`/git/refs/heads/${encodeURIComponent(config.branch)}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sha: commit.sha, force: false }),
        });
        return commit;
      } catch (error) {
        const branchMoved = error.status === 422 && /fast[ -]?forward/i.test(error.message || '');
        if (!branchMoved || attempt === maxAttempts) throw error;
        onRetry(`The branch changed while publishing; retrying (${attempt}/${maxAttempts - 1})…`);
      }
    }
    throw new Error('GitHub publishing could not update the branch.');
  }

  function markdownPreview(markdown = '') {
    let output = escapeHtml(markdown);
    output = output.replace(/\{%\s*include youtube\.html id=&quot;([^&]+)&quot;[^%]*%\}/g,
      '<div class="preview-video"><small>YouTube: $1</small></div>');
    output = output.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>');
    output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    output = output.replace(/^(?:- (.+)\n?)+/gm, (list) => `<ul>${list.split('\n').filter(Boolean).map((line) => `<li>${line.slice(2)}</li>`).join('')}</ul>`);
    return output.split(/\n{2,}/).map((block) => /^<(h|ul|div)/.test(block) ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`).join('');
  }

  function htmlToMarkdown(value) {
    if (!/<(?:p|div|h[1-6]|iframe|ul|ol|strong|em|a)\b/i.test(value)) return value.trim();
    const container = document.createElement('div');
    container.innerHTML = value;
    function convert(node) {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const children = [...node.childNodes].map(convert).join('');
      const tag = node.tagName.toLowerCase();
      if (tag === 'strong' || tag === 'b') return `**${children}**`;
      if (tag === 'em' || tag === 'i') return `*${children}*`;
      if (tag === 'a') return `[${children}](${node.getAttribute('href') || ''})`;
      if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${children}\n\n`;
      if (tag === 'li') return `- ${children.trim()}\n`;
      if (tag === 'ul' || tag === 'ol') return `${children}\n`;
      if (tag === 'br') return '\n';
      if (tag === 'iframe') {
        const id = youtubeId(node.getAttribute('src') || '');
        return id ? `{% include youtube.html id="${id}" %}\n\n` : '';
      }
      if (tag === 'p') return `${children.trim()}\n\n`;
      if (tag === 'div' && node.classList.contains('video-container')) return children;
      return children;
    }
    return [...container.childNodes].map(convert).join('').replace(/\n{3,}/g, '\n\n').trim();
  }

  function youtubeId(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.hostname.includes('youtu.be')) return parsed.pathname.split('/').filter(Boolean)[0] || '';
      if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1].split('/')[0];
      if (parsed.pathname.includes('/shorts/')) return parsed.pathname.split('/shorts/')[1].split('/')[0];
      return parsed.searchParams.get('v') || '';
    } catch (_) { return ''; }
  }

  function slugify(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function yamlString(value) { return JSON.stringify(String(value || '')); }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }

  function cropImage(image, rect, width, height, quality = .92, round = false) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const pixel = round ? Math.round : (value) => value;
    canvas.getContext('2d').drawImage(image,
      pixel(rect.x * image.naturalWidth), pixel(rect.y * image.naturalHeight),
      pixel(rect.width * image.naturalWidth), pixel(rect.height * image.naturalHeight),
      0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  }

  async function readPageSource(id) {
    const config = githubConfig();
    const file = await githubApi(`/contents/content/pages/${encodeURIComponent(id)}.md?ref=${encodeURIComponent(config.branch)}`);
    if (file.encoding !== 'base64' || !file.content) throw new Error('Page source could not be read.');
    return new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g, '')), (char) => char.charCodeAt(0)));
  }

  // Edit the YAML document instead of rebuilding it from a subset of fields.
  // This retains unknown settings, comments, and the unedited Markdown body.
  function pageMarkdown(page, source) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    if (!match) throw new Error('Page has no valid YAML front matter.');
    const doc = window.AdminVendor.parseDocument(match[1]);
    if (doc.errors.length) throw new Error(`Invalid page YAML: ${doc.errors[0].message}`);
    const set = (path, value) => doc.setIn(path, value);
    let body = match[2];
    if (page.id === 'home') {
      for (const key of ['title', 'description', 'cta_text']) set([key], page[key]);
      for (const key of ['heading', 'sub_heading']) set(['latest_works', key], page[`latest_works_${key}`]);
      set(['projects', 'view_more_button_text'], page.more_projects_text);
      for (const key of ['heading', 'sub_heading']) set(['actions', key], page[`actions_${key}`]);
      for (const key of ['resume_text', 'contact_text', 'about_text']) set(['actions', key], page[key]);
      set(['profile_image'], page.images[0].path);
      set(['profile_alt'], page.images[0].alt);
    } else if (page.id === 'about') {
      for (const [key, value] of Object.entries({ image: page.images[0].path, alt: page.images[0].alt, caption: page.images[0].caption })) {
        set(['gallery', 0, key], value);
      }
      body = `${String(page.body || '').trim()}\n`;
    } else if (page.id === 'resume') {
      set(['resume_file'], page.resume_file);
      page.images.forEach((image, index) => {
        for (const [key, value] of Object.entries({ image: image.path, alt: image.alt, caption: image.caption })) {
          set(['experience_gallery', index, key], value);
        }
      });
    } else throw new Error('Unknown page type.');
    return `---\n${doc.toString({ lineWidth: 0 })}---\n${body}`;
  }

  window.AdminShared = { clone, escapeHtml, githubConfig, githubApi, createBlob, commitChanges,
    markdownPreview, htmlToMarkdown, youtubeId, slugify, clamp, yamlString, loadImage, cropImage,
    readPageSource, pageMarkdown };
})();
