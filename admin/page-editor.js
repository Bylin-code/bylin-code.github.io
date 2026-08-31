(() => {
  'use strict';

  const state = { pages: [], current: null, dirty: new Set(), crop: null };
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    pageEditor: $('#page-editor'), projectEditor: $('.editor-pane'), projectPreview: $('.preview-pane'),
    title: $('#page-editor-title'), fields: $('#page-fields'), images: $('#page-images'), form: $('#page-form'),
    preview: $('#page-preview'), previewWrap: $('#page-preview-wrap'), previewName: $('#page-preview-name'), openPage: $('#open-page'),
    savePageDraft: $('#save-page-draft'), publishPages: $('#publish-pages'),
    saveProjectDraft: $('#save-draft'), exportProject: $('#export-project'), publishProject: $('#publish-project'), newProject: $('#new-project'),
    saveStatus: $('#save-status'),
    cropDialog: $('#page-crop-dialog'), cropTitle: $('#page-crop-title'), cropStage: $('#page-crop-stage'),
    cropSource: $('#page-crop-source'), cropBox: $('#page-crop-box'), cropPreset: $('#page-crop-preset'),
    cropWidth: $('#page-crop-width'), cropHeight: $('#page-crop-height'), cropSize: $('#page-crop-size'),
    resetCrop: $('#page-reset-crop'), applyCrop: $('#page-apply-crop'),
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]));
  const yamlString = (value) => JSON.stringify(String(value || ''));
  const pageLabels = { home: 'Home', about: 'About', resume: 'Resume' };
  const pageUrls = { home: '/', about: '/about/', resume: '/resume/' };

  async function init() {
    try {
      const response = await fetch('./project-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Page data returned ${response.status}`);
      const data = await response.json();
      state.pages = (data.pages || []).map(normalizePage);
      document.querySelectorAll('[data-page-editor]').forEach((button) => button.addEventListener('click', () => openPageEditor(button.dataset.pageEditor)));
      $('#back-to-projects').addEventListener('click', closePageEditor);
      elements.form.addEventListener('input', readPageForm);
      elements.savePageDraft.addEventListener('click', saveDraft);
      elements.publishPages.addEventListener('click', publishPages);
      elements.preview.addEventListener('load', sizePreview);
      new ResizeObserver(sizePreview).observe(elements.previewWrap);
      bindCropEvents();
    } catch (error) {
      console.error(error);
      document.querySelectorAll('[data-page-editor]').forEach((button) => { button.disabled = true; });
    }
  }

  function normalizePage(page) {
    const normalized = clone(page);
    if (normalized.id === 'about') normalized.body = htmlToMarkdown(normalized.body || '');
    normalized.images = (normalized.images || []).map((image) => ({
      ...image, preview: image.path, original: image.path, uploadData: '',
    }));
    const draft = readDraft(normalized.id);
    if (draft) {
      Object.assign(normalized, draft);
      normalized.images = (draft.images || normalized.images).map((image) => ({ ...image, preview: image.path, original: image.path, uploadData: '' }));
      state.dirty.add(normalized.id);
    }
    return normalized;
  }

  function openPageEditor(id) {
    const page = state.pages.find((item) => item.id === id);
    if (!page) return;
    state.current = page;
    elements.projectEditor.hidden = true;
    elements.projectPreview.hidden = true;
    elements.pageEditor.hidden = false;
    elements.saveProjectDraft.hidden = true;
    elements.exportProject.hidden = true;
    elements.publishProject.hidden = true;
    elements.newProject.disabled = true;
    elements.savePageDraft.hidden = false;
    elements.publishPages.hidden = false;
    document.querySelectorAll('[data-page-editor]').forEach((button) => button.classList.toggle('active', button.dataset.pageEditor === id));
    renderPageForm();
    updateStatus();
  }

  function closePageEditor() {
    elements.pageEditor.hidden = true;
    elements.projectEditor.hidden = false;
    elements.projectPreview.hidden = false;
    elements.saveProjectDraft.hidden = false;
    elements.exportProject.hidden = false;
    elements.publishProject.hidden = false;
    elements.newProject.disabled = false;
    elements.savePageDraft.hidden = true;
    elements.publishPages.hidden = true;
    document.querySelectorAll('[data-page-editor]').forEach((button) => button.classList.remove('active'));
  }

  const field = (name, label, value, options = {}) => `<label class="field${options.wide === false ? '' : ' field-wide'}">${escapeHtml(label)}${options.textarea
    ? `<textarea name="${name}" rows="${options.rows || 3}">${escapeHtml(value || '')}</textarea>`
    : `<input name="${name}" value="${escapeHtml(value || '')}">`}</label>`;

  function renderPageForm() {
    const page = state.current;
    elements.title.textContent = pageLabels[page.id];
    elements.previewName.textContent = pageLabels[page.id];
    elements.openPage.href = pageUrls[page.id];
    if (page.id === 'home') {
      elements.fields.innerHTML = `<section class="page-field-section"><p class="eyebrow">Hero</p><h2>Opening section</h2><div class="field-grid">
        ${field('title', 'Headline', page.title, { textarea: true, rows: 2 })}${field('description', 'Introduction', page.description, { textarea: true, rows: 4 })}${field('cta_text', 'Projects prompt', page.cta_text)}
        </div></section><section class="page-field-section"><p class="eyebrow">Projects</p><h2>Featured work section</h2><div class="field-grid">
        ${field('latest_works_heading', 'Heading', page.latest_works_heading)}${field('latest_works_sub_heading', 'Subheading', page.latest_works_sub_heading)}${field('more_projects_text', 'More projects button', page.more_projects_text)}
        </div></section><section class="page-field-section"><p class="eyebrow">Contact</p><h2>Bottom action section</h2><div class="field-grid">
        ${field('actions_heading', 'Heading', page.actions_heading)}${field('actions_sub_heading', 'Subheading', page.actions_sub_heading)}${field('resume_text', 'Resume button', page.resume_text, { wide: false })}${field('contact_text', 'Contact button', page.contact_text, { wide: false })}${field('about_text', 'About button', page.about_text, { wide: false })}
        </div></section>`;
    } else if (page.id === 'about') {
      elements.fields.innerHTML = `<section class="page-field-section"><p class="eyebrow">Copy</p><h2>About text</h2>${field('body', 'Markdown', page.body, { textarea: true, rows: 18 })}</section>`;
    } else {
      elements.fields.innerHTML = `<section class="page-field-section"><p class="eyebrow">Document</p><h2>Resume PDF</h2><div class="page-pdf-control"><strong>${escapeHtml(page.resume_file.split('/').pop())}</strong><input name="resume_pdf" type="file" accept="application/pdf"><small>Choose a PDF to replace the document. Its position and viewer stay unchanged.</small></div></section>`;
      elements.fields.querySelector('[name="resume_pdf"]').addEventListener('change', selectPdf);
    }
    renderPageImages();
    renderPreview();
  }

  function readPageForm(event) {
    if (!state.current) return;
    if (event?.target?.name === 'resume_pdf') return;
    new FormData(elements.form).forEach((value, key) => {
      if (key !== 'resume_pdf') state.current[key] = String(value || '');
    });
    markDirty();
    renderPreview();
  }

  function renderPageImages() {
    elements.images.innerHTML = '';
    state.current.images.forEach((image, index) => {
      const card = document.createElement('article');
      card.className = 'page-image-card';
      card.innerHTML = `<div class="image-drop has-image"><img src="${escapeHtml(image.preview || image.path)}" alt="${escapeHtml(image.alt || '')}"><div class="image-empty"><span>+</span><strong>Replace image</strong></div><input class="image-input" type="file" accept="image/jpeg,image/png,image/gif,image/webp"></div>
        <div class="page-image-fields"><h3>${escapeHtml(image.label || `Image ${index + 1}`)}</h3>
        ${state.current.id === 'home' ? '' : `<label class="field">Caption<input class="page-image-caption" value="${escapeHtml(image.caption || '')}"></label>`}
        <label class="field">Alt text<input class="page-image-alt" value="${escapeHtml(image.alt || '')}"></label>
        <div class="page-image-actions"><button class="button button-secondary page-crop-button" type="button">Crop image</button></div></div>`;
      card.querySelector('.image-input').addEventListener('change', (event) => selectImage(event, index));
      card.querySelector('.page-crop-button').addEventListener('click', () => openCrop(index));
      card.querySelector('.page-image-alt').addEventListener('input', (event) => { image.alt = event.target.value; markDirty(); renderPreview(); });
      card.querySelector('.page-image-caption')?.addEventListener('input', (event) => { image.caption = event.target.value; markDirty(); renderPreview(); });
      elements.images.append(card);
    });
  }

  async function selectImage(event, index) {
    const file = event.target.files[0];
    if (!file || !/^image\/(jpeg|png|gif|webp)$/.test(file.type)) return window.alert('Choose a JPG, PNG, GIF, or WebP image.');
    try {
      const source = URL.createObjectURL(file);
      const imageElement = await loadImage(source);
      const canvas = document.createElement('canvas');
      canvas.width = imageElement.naturalWidth; canvas.height = imageElement.naturalHeight;
      canvas.getContext('2d').drawImage(imageElement, 0, 0);
      URL.revokeObjectURL(source);
      const data = canvas.toDataURL('image/jpeg', .92);
      Object.assign(state.current.images[index], { preview: data, original: data, uploadData: data });
      renderPageImages(); markDirty('Image selected locally'); renderPreview();
    } catch (_) { window.alert('This image could not be opened.'); }
  }

  function selectPdf(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) return window.alert('Choose a PDF file.');
    const reader = new FileReader();
    reader.onload = () => {
      state.current.resume_file = `/assets/files/${slugify(file.name.replace(/\.pdf$/i, ''))}.pdf`;
      state.current.pdfData = String(reader.result);
      markDirty('Resume PDF selected locally');
      renderPageForm();
    };
    reader.readAsDataURL(file);
  }

  function markDirty(message = '') {
    state.dirty.add(state.current.id);
    updateStatus(message);
  }

  function updateStatus(message = '') {
    const count = state.dirty.size;
    elements.saveStatus.textContent = message || (count ? `${count} unpublished page${count === 1 ? '' : 's'}` : 'No unpublished page changes');
    elements.publishPages.textContent = count > 1 ? `Publish ${count} pages` : 'Publish page';
  }

  function renderPreview() {
    const page = state.current;
    if (!page) return;
    const image = (item, caption = true) => `<figure style="margin:0 0 24px"><img src="${escapeHtml(item.preview || item.path)}" alt="${escapeHtml(item.alt || '')}" style="display:block;width:100%;height:auto;border-radius:4px">${caption && item.caption ? `<figcaption style="margin-top:7px;color:#6f6980;font-size:14px">${escapeHtml(item.caption)}</figcaption>` : ''}</figure>`;
    let content = '';
    if (page.id === 'home') {
      content = `<div class="section pt-6"><div class="container"><div class="row"><div class="col-12 col-md-5">${image(page.images[0], false)}</div><div class="col-12 col-md-7"><h1>${escapeHtml(page.title)}</h1><div class="content">${markdownPreview(page.description)}</div><p>${escapeHtml(page.cta_text)}</p></div></div></div></div>
        <div class="section"><div class="container"><h2>${escapeHtml(page.latest_works_heading)}</h2><p>${escapeHtml(page.latest_works_sub_heading)}</p><div style="height:260px;background:#f1eee8;border-radius:4px"></div><p>${escapeHtml(page.more_projects_text)} →</p></div></div>
        <div class="section"><div class="container"><h2>${escapeHtml(page.actions_heading)}</h2><p>${escapeHtml(page.actions_sub_heading)}</p><p>${escapeHtml(page.resume_text)} · ${escapeHtml(page.contact_text)} · ${escapeHtml(page.about_text)}</p></div></div>`;
    } else if (page.id === 'about') {
      content = `<div class="section pt-6"><div class="container"><div class="row"><div class="col-12 col-md-6"><div class="content">${markdownPreview(page.body)}</div></div><div class="col-12 col-md-6">${image(page.images[0])}</div></div></div></div>`;
    } else {
      const pdf = page.pdfData || page.resume_file;
      content = `<div class="section pt-4"><div class="container"><div class="row"><div class="col-12 col-lg-8"><object data="${escapeHtml(pdf)}#view=FitH" type="application/pdf" style="width:100%;height:900px;background:#eee"></object></div><div class="col-12 col-lg-4">${page.images.map((item) => image(item)).join('')}</div></div></div></div>`;
    }
    elements.preview.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1440"><link rel="stylesheet" href="/assets/css/main.css"><style>html,body{margin:0;background:#fffefa}.section{padding-top:50px;padding-bottom:50px}h1{font-size:48px}</style></head><body>${content}</body></html>`;
  }

  function markdownPreview(markdown = '') {
    let output = escapeHtml(markdown);
    output = output.replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>');
    output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return output.split(/\n{2,}/).map((block) => /^<h/.test(block) ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`).join('');
  }

  function htmlToMarkdown(value) {
    if (!/<(?:p|div|h[1-6]|ul|ol|strong|em|a)\b/i.test(value)) return String(value || '').trim();
    const container = document.createElement('div'); container.innerHTML = value;
    function convert(node) {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const children = [...node.childNodes].map(convert).join(''); const tag = node.tagName.toLowerCase();
      if (tag === 'strong' || tag === 'b') return `**${children}**`;
      if (tag === 'em' || tag === 'i') return `*${children}*`;
      if (tag === 'a') return `[${children}](${node.getAttribute('href') || ''})`;
      if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${children}\n\n`;
      if (tag === 'li') return `- ${children.trim()}\n`;
      if (tag === 'br') return '\n';
      if (tag === 'p') return `${children.trim()}\n\n`;
      return children;
    }
    return [...container.childNodes].map(convert).join('').replace(/\n{3,}/g, '\n\n').trim();
  }

  function sizePreview() {
    const width = 1440; const scale = Math.min(1, elements.previewWrap.clientWidth / width);
    const height = elements.preview.contentDocument?.documentElement?.scrollHeight || 900;
    elements.preview.style.width = `${width}px`; elements.preview.style.height = `${height}px`; elements.preview.style.transform = `scale(${scale})`;
    elements.previewWrap.style.height = `${Math.ceil(height * scale)}px`;
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = source; });
  }

  async function openCrop(index) {
    const item = state.current.images[index]; const source = item.original || item.preview || item.path;
    try {
      const image = await loadImage(source);
      state.crop = { index, image, source, rect: { x: 0, y: 0, width: 1, height: 1 }, drag: null };
      elements.cropTitle.textContent = `Crop ${item.label}`; elements.cropSource.src = source;
      elements.cropWidth.value = image.naturalWidth; elements.cropHeight.value = image.naturalHeight;
      elements.cropSize.textContent = `Original image: ${image.naturalWidth} × ${image.naturalHeight} pixels`;
      elements.cropPreset.value = 'custom'; renderCropBox(); elements.cropDialog.showModal();
    } catch (_) { window.alert('This image could not be opened in the crop editor.'); }
  }

  function cropRatio() {
    const preset = elements.cropPreset.value;
    if (preset === 'free') return null;
    if (preset === 'custom') return state.crop.image.naturalWidth / state.crop.image.naturalHeight;
    const [w, h] = preset.split(':').map(Number); return w / h;
  }

  function resetCrop() {
    if (!state.crop) return;
    state.crop.rect = { x: 0, y: 0, width: 1, height: 1 };
    elements.cropPreset.value = 'custom'; elements.cropWidth.value = state.crop.image.naturalWidth; elements.cropHeight.value = state.crop.image.naturalHeight; renderCropBox();
  }

  function setCropPreset() {
    const crop = state.crop; if (!crop) return;
    if (elements.cropPreset.value === 'free') { crop.rect = { x: .1, y: .1, width: .8, height: .8 }; }
    else {
      const ratio = cropRatio(); const normalized = ratio * crop.image.naturalHeight / crop.image.naturalWidth;
      let width = 1; let height = 1 / normalized; if (height > 1) { height = 1; width = normalized; }
      crop.rect = { x: (1 - width) / 2, y: (1 - height) / 2, width, height };
      const sizes = { '1:1': [1200, 1200], '4:3': [1600, 1200], '3:2': [1800, 1200], '16:9': [1920, 1080] };
      if (sizes[elements.cropPreset.value]) [elements.cropWidth.value, elements.cropHeight.value] = sizes[elements.cropPreset.value];
    }
    renderCropBox();
  }

  function renderCropBox() {
    if (!state.crop) return; const rect = state.crop.rect;
    elements.cropBox.style.left = `${rect.x * 100}%`; elements.cropBox.style.top = `${rect.y * 100}%`; elements.cropBox.style.width = `${rect.width * 100}%`; elements.cropBox.style.height = `${rect.height * 100}%`;
  }

  function beginCrop(event) {
    if (!state.crop) return; const handle = event.target.closest('[data-handle]')?.dataset.handle || '';
    state.crop.drag = { handle, startX: event.clientX, startY: event.clientY, rect: { ...state.crop.rect } };
    elements.cropBox.setPointerCapture(event.pointerId); event.preventDefault();
  }

  function moveCrop(event) {
    const crop = state.crop; if (!crop?.drag) return;
    const drag = crop.drag; const dx = (event.clientX - drag.startX) / elements.cropSource.clientWidth; const dy = (event.clientY - drag.startY) / elements.cropSource.clientHeight;
    if (!drag.handle) {
      crop.rect.x = clamp(drag.rect.x + dx, 0, 1 - drag.rect.width); crop.rect.y = clamp(drag.rect.y + dy, 0, 1 - drag.rect.height);
    } else {
      let left = drag.rect.x; let top = drag.rect.y; let right = left + drag.rect.width; let bottom = top + drag.rect.height;
      if (drag.handle.includes('w')) left = clamp(left + dx, 0, right - .03); if (drag.handle.includes('e')) right = clamp(right + dx, left + .03, 1);
      if (drag.handle.includes('n')) top = clamp(top + dy, 0, bottom - .03); if (drag.handle.includes('s')) bottom = clamp(bottom + dy, top + .03, 1);
      if (cropRatio()) {
        const normalized = cropRatio() * crop.image.naturalHeight / crop.image.naturalWidth;
        let width = right - left; let height = width / normalized;
        if (top + height > 1) { height = 1 - top; width = height * normalized; }
        if (drag.handle.includes('w')) left = right - width; else right = left + width;
        if (drag.handle.includes('n')) top = bottom - height; else bottom = top + height;
      }
      crop.rect = { x: left, y: top, width: right - left, height: bottom - top };
    }
    renderCropBox();
  }

  function applyCrop() {
    const crop = state.crop; if (!crop) return;
    const width = Math.max(1, Math.min(12000, Number(elements.cropWidth.value) || crop.image.naturalWidth));
    const height = Math.max(1, Math.min(12000, Number(elements.cropHeight.value) || crop.image.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const rect = crop.rect;
    canvas.getContext('2d').drawImage(crop.image, rect.x * crop.image.naturalWidth, rect.y * crop.image.naturalHeight, rect.width * crop.image.naturalWidth, rect.height * crop.image.naturalHeight, 0, 0, width, height);
    const data = canvas.toDataURL('image/jpeg', .92); Object.assign(state.current.images[crop.index], { preview: data, original: data, uploadData: data });
    elements.cropDialog.close(); renderPageImages(); markDirty('Crop applied'); renderPreview();
  }

  function bindCropEvents() {
    elements.cropPreset.addEventListener('change', setCropPreset); elements.resetCrop.addEventListener('click', resetCrop); elements.applyCrop.addEventListener('click', applyCrop);
    elements.cropBox.addEventListener('pointerdown', beginCrop); elements.cropBox.addEventListener('pointermove', moveCrop);
    elements.cropBox.addEventListener('pointerup', () => { if (state.crop) state.crop.drag = null; });
    elements.cropBox.addEventListener('pointercancel', () => { if (state.crop) state.crop.drag = null; });
  }

  function pageMarkdown(page) {
    if (page.id === 'home') return ['---', 'layout: home', 'body_classes: page-home', 'permalink: "/"', `title: ${yamlString(page.title)}`, `description: ${yamlString(page.description)}`, `cta_text: ${yamlString(page.cta_text)}`, 'meta_description: "Brady Lin - Full-Stack Mechatronics Engineer"', 'meta_title: Brady Lin - Full-Stack Mechatronics Engineer', '', 'latest_works:', `  heading: ${yamlString(page.latest_works_heading)}`, `  sub_heading: ${yamlString(page.latest_works_sub_heading)}`, '', 'projects:', '  heading: ""', '  sub_heading: ""', '  limit: 4', "  sort: 'date'", `  view_more_button_text: ${yamlString(page.more_projects_text)}`, '  view_more_button_link: "/projects"', '  columns: 2', '', 'actions:', `  heading: ${yamlString(page.actions_heading)}`, `  sub_heading: ${yamlString(page.actions_sub_heading)}`, `  resume_text: ${yamlString(page.resume_text)}`, '  resume_link: "/resume/"', `  contact_text: ${yamlString(page.contact_text)}`, '  contact_link: "/contact"', `  about_text: ${yamlString(page.about_text)}`, '  about_link: "/about"', '', '---', ''].join('\n');
    if (page.id === 'about') return ['---', 'layout: about', 'title: ""', 'permalink: "/about/"', 'weight: 1', 'featured: true', 'thumbnail: "/assets/images/gen/projects/project-1-1-thumbnail.webp"', 'image: "/assets/images/gen/projects/project-1-2.webp"', 'gallery:', `  - image: ${yamlString(page.images[0].path)}`, `    alt: ${yamlString(page.images[0].alt)}`, `    caption: ${yamlString(page.images[0].caption)}`, 'gallery_limit: 2', '---', String(page.body || '').trim(), ''].join('\n');
    const lines = ['---', 'layout: resume', 'title: Resume', 'permalink: "/resume/"', `resume_file: ${yamlString(page.resume_file)}`, 'experience_gallery:'];
    page.images.forEach((item) => lines.push(`  - image: ${yamlString(item.path)}`, `    alt: ${yamlString(item.alt)}`, `    caption: ${yamlString(item.caption)}`));
    lines.push('---', ''); return lines.join('\n');
  }

  function saveDraft() {
    if (!state.current) return; const safe = clone(state.current);
    safe.images.forEach((image) => { image.preview = image.path; image.original = image.path; image.uploadData = ''; }); delete safe.pdfData;
    try { localStorage.setItem(`bradylin-page-draft:${safe.id}`, JSON.stringify(safe)); updateStatus('Page draft saved in this browser; selected files remain available until this tab closes'); }
    catch (_) { window.alert('The browser could not save this draft.'); }
  }

  function readDraft(id) { try { return JSON.parse(localStorage.getItem(`bradylin-page-draft:${id}`) || 'null'); } catch (_) { return null; } }
  function githubConfig() { try { const config = JSON.parse(sessionStorage.getItem('bradylin-github-publishing') || 'null'); return config?.token && config?.owner && config?.repo && config?.branch ? config : null; } catch (_) { return null; } }

  async function githubApi(path, options = {}) {
    const config = githubConfig(); if (!config) throw new Error('GitHub is not connected. Open GitHub settings first.');
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}${path}`, { ...options, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${config.token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(options.headers || {}) } });
    const data = response.status === 204 ? null : await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(data?.message || `GitHub returned ${response.status}`); error.status = response.status; throw error; } return data;
  }

  async function createBlob(content, encoding = 'utf-8') { const result = await githubApi('/git/blobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, encoding }) }); return result.sha; }
  const dataBase64 = (data) => String(data).split(',')[1] || '';

  async function commit(entries, message) {
    const config = githubConfig();
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const ref = await githubApi(`/git/ref/heads/${encodeURIComponent(config.branch)}`); const parent = await githubApi(`/git/commits/${ref.object.sha}`);
      const tree = await githubApi('/git/trees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base_tree: parent.tree.sha, tree: entries }) });
      const next = await githubApi('/git/commits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, tree: tree.sha, parents: [ref.object.sha] }) });
      try { await githubApi(`/git/refs/heads/${encodeURIComponent(config.branch)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sha: next.sha, force: false }) }); return; }
      catch (error) { if (error.status !== 422 || attempt === 3) throw error; }
    }
  }

  async function publishPages() {
    const pages = state.pages.filter((page) => state.dirty.has(page.id)); if (!pages.length) return updateStatus('There are no unpublished page changes');
    if (!githubConfig()) return window.alert('Open GitHub settings and connect your token before publishing.');
    elements.publishPages.disabled = true;
    try {
      const entries = [];
      for (const page of pages) {
        entries.push({ path: `content/pages/${page.id}.md`, mode: '100644', type: 'blob', sha: await createBlob(pageMarkdown(page)) });
        for (const image of page.images.filter((item) => item.uploadData)) entries.push({ path: image.path.replace(/^\//, ''), mode: '100644', type: 'blob', sha: await createBlob(dataBase64(image.uploadData), 'base64') });
        if (page.pdfData) entries.push({ path: page.resume_file.replace(/^\//, ''), mode: '100644', type: 'blob', sha: await createBlob(dataBase64(page.pdfData), 'base64') });
      }
      await commit(entries, pages.length === 1 ? `Update page: ${pageLabels[pages[0].id]}` : `Update pages: ${pages.map((page) => pageLabels[page.id]).join(', ')}`);
      pages.forEach((page) => { state.dirty.delete(page.id); localStorage.removeItem(`bradylin-page-draft:${page.id}`); page.images.forEach((image) => { image.preview = image.path; image.original = image.path; image.uploadData = ''; }); delete page.pdfData; });
      updateStatus(`${pages.length} page${pages.length === 1 ? '' : 's'} published; GitHub Pages is rebuilding`); renderPageImages(); renderPreview();
    } catch (error) { console.error(error); window.alert(`Publishing failed: ${error.message}\n\nNothing was partially published.`); updateStatus('Publishing failed'); }
    finally { elements.publishPages.disabled = false; }
  }

  function slugify(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  window.addEventListener('beforeunload', (event) => { if (state.dirty.size) { event.preventDefault(); event.returnValue = ''; } });
  init();
})();
