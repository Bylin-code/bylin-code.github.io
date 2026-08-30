(() => {
  'use strict';

  const state = {
    templates: [],
    projects: [],
    current: null,
    dirty: false,
    loadedSlug: null,
  };

  const el = {
    form: document.querySelector('#project-form'),
    list: document.querySelector('#project-list'),
    search: document.querySelector('#project-search'),
    newProject: document.querySelector('#new-project'),
    templatePicker: document.querySelector('#template-picker'),
    slots: document.querySelector('#image-slots'),
    slotTemplate: document.querySelector('#image-slot-template'),
    body: document.querySelector('#project-body'),
    youtubeUrl: document.querySelector('#youtube-url'),
    addYoutube: document.querySelector('#add-youtube'),
    previewWrap: document.querySelector('#project-preview-wrap'),
    preview: document.querySelector('#project-preview'),
    previewName: document.querySelector('#preview-name'),
    openProject: document.querySelector('#open-project'),
    saveStatus: document.querySelector('#save-status'),
    saveDraft: document.querySelector('#save-draft'),
    exportProject: document.querySelector('#export-project'),
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]));

  function blankProject() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      slug: '', layout: state.templates[0]?.id || 'project-2p', title: '', description: '',
      date: today, client: '', role: '', skills: '', thumbnail: '', featured: false,
      display: true, gallery: [], body: '', isNew: true,
    };
  }

  function normalizeProject(project) {
    const normalized = { ...blankProject(), ...clone(project) };
    normalized.gallery = Array.isArray(normalized.gallery) ? normalized.gallery.map((item) => ({
      image: item.image || '', caption: item.caption || '', alt: item.alt || '', preview: item.image || '',
    })) : [];
    normalized.body = htmlToMarkdown(normalized.body || '');
    return normalized;
  }

  async function init() {
    try {
      const response = await fetch('./project-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Project data returned ${response.status}`);
      const data = await response.json();
      state.templates = data.templates || [];
      state.projects = (data.projects || []).map(normalizeProject);
      renderTemplates();
      renderProjectList();
      loadProject(state.projects[0] || blankProject());
    } catch (error) {
      console.error(error);
      document.querySelector('#editor-notice').textContent =
        'The editor could not load project data. Start Jekyll and open /admin/ through http://localhost:4000 instead of opening this HTML file directly.';
    }
  }

  function renderProjectList(query = '') {
    const needle = query.trim().toLowerCase();
    const projects = state.projects.filter((project) => project.title.toLowerCase().includes(needle));
    el.list.innerHTML = '';
    projects.forEach((project) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = project.slug === state.loadedSlug ? 'active' : '';
      button.innerHTML = `${escapeHtml(project.title)}<small>${escapeHtml(templateFor(project.layout)?.label || project.layout)}</small>`;
      button.addEventListener('click', () => {
        if (!confirmDiscard()) return;
        loadProject(project);
      });
      el.list.append(button);
    });
    if (!projects.length) el.list.innerHTML = '<p class="save-status">No matching projects.</p>';
  }

  function renderTemplates() {
    el.templatePicker.innerHTML = '';
    state.templates.forEach((template) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'template-card';
      button.dataset.layout = template.id;
      button.innerHTML = `
        <span class="template-sketch">${'<span></span>'.repeat(template.image_count)}</span>
        <strong>${escapeHtml(template.label)}</strong>
        <small>${escapeHtml(template.description)}</small>`;
      button.addEventListener('click', () => selectTemplate(template.id));
      el.templatePicker.append(button);
    });
  }

  function loadProject(project) {
    const source = normalizeProject(project);
    const draft = readDraft(source.slug);
    state.current = draft ? normalizeProject({ ...source, ...draft }) : source;
    state.loadedSlug = source.slug || null;
    writeForm();
    setDirty(false, draft ? 'Browser draft loaded' : 'No unsaved changes');
    renderProjectList(el.search.value);
  }

  function writeForm() {
    const fields = ['title', 'slug', 'date', 'description', 'role', 'client', 'skills', 'body'];
    fields.forEach((name) => { el.form.elements[name].value = state.current[name] || ''; });
    el.form.elements.display.checked = Boolean(state.current.display);
    el.form.elements.featured.checked = Boolean(state.current.featured);
    updateSelectedTemplate();
    renderSlots();
    renderPreview();
  }

  function readForm() {
    const data = new FormData(el.form);
    ['title', 'slug', 'date', 'description', 'role', 'client', 'skills', 'body'].forEach((name) => {
      state.current[name] = String(data.get(name) || '');
    });
    state.current.slug = slugify(state.current.slug || state.current.title);
    state.current.display = el.form.elements.display.checked;
    state.current.featured = el.form.elements.featured.checked;
    syncGalleryFields();
  }

  function selectTemplate(layout) {
    if (state.current.layout === layout) return;
    // Keep the full gallery in editor state. A smaller layout merely hides its
    // extra slots; switching back restores their images, captions, and alt text.
    state.current.layout = layout;
    updateSelectedTemplate();
    renderSlots();
    changed();
  }

  function updateSelectedTemplate() {
    document.querySelectorAll('.template-card').forEach((card) => {
      card.classList.toggle('selected', card.dataset.layout === state.current.layout);
    });
  }

  function renderSlots() {
    const count = templateFor(state.current.layout)?.image_count || 0;
    while (state.current.gallery.length < count) state.current.gallery.push({ image: '', preview: '', caption: '', alt: '' });
    el.slots.innerHTML = '';

    for (let index = 0; index < count; index += 1) {
      const item = state.current.gallery[index];
      const slot = el.slotTemplate.content.firstElementChild.cloneNode(true);
      slot.dataset.index = index;
      slot.querySelector('.slot-name').textContent = index === 0 && state.current.layout === 'project-7p'
        ? 'Image 1 · Hero image' : `Image ${index + 1}`;
      slot.querySelector('.image-caption').value = stripCaptionHtml(item.caption);
      slot.querySelector('.image-alt').value = item.alt || '';
      slot.querySelector('.thumbnail-choice input').checked = Boolean(item.image && item.image === state.current.thumbnail);
      const drop = slot.querySelector('.image-drop');
      const img = slot.querySelector('img');
      if (item.preview || item.image) {
        drop.classList.add('has-image');
        img.src = item.preview || item.image;
        img.alt = item.alt || '';
      }
      slot.querySelector('.image-input').addEventListener('change', (event) => uploadImage(event, index));
      slot.querySelector('.remove-image').addEventListener('click', () => removeImage(index));
      slot.querySelector('.thumbnail-choice input').addEventListener('change', () => {
        syncGalleryFields();
        state.current.thumbnail = state.current.gallery[index].image;
        changed();
      });
      slot.querySelectorAll('input[type="text"], .image-caption, .image-alt').forEach((input) => input.addEventListener('input', changed));
      el.slots.append(slot);
    }
  }

  function uploadImage(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
      window.alert('Please choose a JPG, PNG, GIF, or WebP image.');
      return;
    }
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const filename = slugify(file.name.replace(/\.[^.]+$/, '')) || `image-${index + 1}`;
    const projectSlug = slugify(el.form.elements.slug.value || el.form.elements.title.value || 'new-project');
    const path = `/assets/images/my-projects/${projectSlug}/${filename}.${extension}`;
    if (state.current.gallery[index]?.preview?.startsWith('blob:')) URL.revokeObjectURL(state.current.gallery[index].preview);
    state.current.gallery[index] = {
      ...state.current.gallery[index], image: path, preview: URL.createObjectURL(file), fileName: file.name,
    };
    if (!state.current.thumbnail) state.current.thumbnail = path;
    renderSlots();
    changed('Image selected locally');
  }

  function removeImage(index) {
    const item = state.current.gallery[index];
    if (item?.preview?.startsWith('blob:')) URL.revokeObjectURL(item.preview);
    if (state.current.thumbnail === item.image) state.current.thumbnail = '';
    state.current.gallery[index] = { image: '', preview: '', caption: '', alt: '' };
    renderSlots();
    changed();
  }

  function syncGalleryFields() {
    el.slots.querySelectorAll('.image-slot').forEach((slot) => {
      const index = Number(slot.dataset.index);
      state.current.gallery[index].caption = slot.querySelector('.image-caption').value;
      state.current.gallery[index].alt = slot.querySelector('.image-alt').value;
    });
  }

  function renderPreview() {
    if (!state.current) return;
    readForm();
    const project = state.current;
    const count = templateFor(project.layout)?.image_count || 0;
    const gallery = project.gallery.slice(0, count);
    const stats = [
      project.date && `<div class="project-date"><strong>Date</strong><span>${escapeHtml(longDate(project.date))}</span></div>`,
      project.client && `<div class="project-client"><strong>Client</strong><span>${escapeHtml(project.client)}</span></div>`,
      project.role && `<div class="project-role"><strong>Role</strong><span>${escapeHtml(project.role)}</span></div>`,
      project.skills && `<div class="project-skills"><strong>Skills</strong><span>${escapeHtml(project.skills)}</span></div>`,
    ].filter(Boolean).join('');
    const body = markdownPreview(project.body);
    const contents = exactLayoutMarkup(project, gallery, stats, body);
    el.preview.srcdoc = `<!doctype html><html><head><meta charset="utf-8">
      <meta name="viewport" content="width=1440">
      <link rel="stylesheet" href="/assets/css/main.css">
      <style>
        html,body{margin:0;min-height:0;background:var(--color-base-bg,#fffefa)}
        body{padding-top:0!important}.section{padding-top:70px;padding-bottom:70px}
        .gallery-masonry{display:grid!important;grid-template-columns:1fr 1fr;align-items:start}
        .gallery-masonry .gallery-item{position:static!important;width:100%!important}
        .gallery-L-left,.gallery-L-right{display:flex!important}
        .admin-empty-image{display:grid;place-items:center;min-height:260px;background:#ece9e1;color:#777}
        .preview-video{position:relative;display:grid;place-items:center;aspect-ratio:16/9;margin:30px 0;background:#171421;color:white}
        .preview-video:before{content:'▶';display:grid;place-items:center;width:70px;height:48px;border-radius:12px;background:red}
        .preview-video small{position:absolute;bottom:14px}
      </style></head><body class="page-project"><main>${contents}</main></body></html>`;
    el.previewName.textContent = project.title || 'Untitled project';
    el.openProject.href = project.slug ? `/projects/${encodeURIComponent(project.slug)}/` : '#';
  }

  function projectIntro(project, stats, statsClass = 'mt-4') {
    return `${project.title ? `<div class="project-heading"><h1>${escapeHtml(project.title)}</h1></div>` : ''}
      ${project.description ? `<div class="project-description">${escapeHtml(project.description)}</div>` : ''}
      <div class="${statsClass}">${stats}</div>`;
  }

  function galleryItem(item, index, hero = false) {
    const source = item.preview || item.image;
    const image = source
      ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(item.alt || '')}" loading="lazy">`
      : `<span class="admin-empty-image">Image ${index + 1}</span>`;
    return `<div class="gallery-item"><div class="gallery-image${hero ? ' gallery-hero-image' : ''}">${image}</div>
      ${item.caption ? `<div class="gallery-caption">${formatCaption(item.caption)}</div>` : ''}</div>`;
  }

  function galleryMarkup(items, className, offset = 0, hero = false) {
    return `<div class="gallery ${className}">${items.map((item, index) => galleryItem(item, index + offset, hero)).join('')}</div>`;
  }

  function exactLayoutMarkup(project, gallery, stats, body) {
    const layout = project.layout;
    const sectionStart = '<div class="section"><div class="container">';
    const sectionEnd = '</div></div>';
    if (layout === 'project-2p') {
      const intro = projectIntro(project, stats, 'project-stats mt-3');
      return `${sectionStart}<div class="row justify-content-center"><div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div></div>
        <div class="col-12 col-md-6 mt-6 mt-md-0">${galleryMarkup(gallery, 'gallery-single-column')}</div></div>${sectionEnd}`;
    }
    if (layout === 'project-3p') {
      const intro = projectIntro(project, stats, 'mt-3');
      return `${sectionStart}<div class="row"><div class="col-12 col-md-6 mb-6 mb-md-0">${galleryMarkup(gallery, 'gallery-single-column')}</div>
        <div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div></div></div>${sectionEnd}`;
    }
    if (layout === 'project-4p') {
      const intro = projectIntro(project, stats, 'mt-4');
      return `${sectionStart}<div class="row mb-6"><div class="col">${galleryMarkup(gallery.slice(0, 2), 'gallery-two-column')}</div></div>
        <div class="row"><div class="col-12 col-md-6">${intro}</div><div class="col-12 col-md-6"><div class="content">${body}</div></div></div>
        <div class="row mt-6"><div class="col">${galleryMarkup(gallery.slice(2), 'gallery-two-column', 2)}</div></div>${sectionEnd}`;
    }
    if (layout === 'project-5p') {
      const intro = projectIntro(project, stats, 'mt-4');
      return `${sectionStart}<div class="row"><div class="col-12 col-md-6">${galleryMarkup(gallery.slice(0, 3), 'gallery-L-left')}</div>
        <div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div>
        ${galleryMarkup(gallery.slice(3), 'gallery-L-right mt-4', 3)}</div></div>${sectionEnd}`;
    }
    if (layout === 'project-7p') {
      const intro = projectIntro(project, stats, 'mt-4');
      return `${sectionStart}${galleryMarkup(gallery.slice(0, 1), 'gallery-hero', 0, true)}
        <div class="row mt-6"><div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div></div>
        <div class="col-12 col-md-6">${galleryMarkup(gallery.slice(1), 'gallery-two-column', 1)}</div></div>${sectionEnd}`;
    }
    const intro = projectIntro(project, stats, 'mt-4');
    return `${sectionStart}<div class="row"><div class="col-12 col-md-6 mb-4">${intro}</div><div class="col-12 col-md-6 mb-4"><div class="content">${body}</div></div></div>
      <div class="row"><div class="col">${galleryMarkup(gallery, 'gallery-masonry')}</div></div>${sectionEnd}`;
  }

  function formatCaption(caption) {
    const safe = escapeHtml(stripCaptionHtml(caption));
    return safe.replace(/^(Fig\s+\d+:)/i, '<strong>$1</strong>');
  }

  function longDate(value) {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  }

  function sizePreview() {
    const width = 1440;
    const available = el.previewWrap.clientWidth;
    const scale = Math.min(1, available / width);
    const documentHeight = el.preview.contentDocument?.documentElement?.scrollHeight || 900;
    el.preview.style.width = `${width}px`;
    el.preview.style.height = `${documentHeight}px`;
    el.preview.style.transform = `scale(${scale})`;
    el.previewWrap.style.height = `${Math.ceil(documentHeight * scale)}px`;
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

  function addYoutube() {
    const id = youtubeId(el.youtubeUrl.value);
    if (!id) {
      window.alert('Paste a valid YouTube or youtu.be URL.');
      return;
    }
    insertAtCursor(el.body, `\n\n{% include youtube.html id="${id}" %}\n\n`);
    el.youtubeUrl.value = '';
    changed('YouTube video added');
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

  function formatText(type) {
    const textarea = el.body;
    const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    const formats = {
      bold: [`**${selected || 'bold text'}**`, 2], italic: [`*${selected || 'italic text'}*`, 1],
      heading: [`## ${selected || 'Heading'}`, 3], link: [`[${selected || 'link text'}](https://example.com)`, 1],
      list: [`- ${selected || 'List item'}`, 2],
    };
    const [text] = formats[type];
    insertAtCursor(textarea, text);
    changed();
  }

  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    textarea.setRangeText(text, start, textarea.selectionEnd, 'end');
    textarea.focus();
  }

  function saveDraft() {
    readForm();
    const key = draftKey(state.current.slug || 'new-project');
    const safeProject = clone(state.current);
    safeProject.gallery.forEach((item) => {
      if (item.preview?.startsWith('blob:')) item.preview = '';
      delete item.fileName;
    });
    try {
      localStorage.setItem(key, JSON.stringify(safeProject));
      setDirty(false, 'Draft saved in this browser');
    } catch (_) {
      window.alert('The browser could not save this draft. Download the Markdown instead.');
    }
  }

  function readDraft(slug) {
    if (!slug) return null;
    try { return JSON.parse(localStorage.getItem(draftKey(slug)) || 'null'); } catch (_) { return null; }
  }

  function exportProject() {
    readForm();
    if (!el.form.reportValidity()) return;
    const yaml = projectMarkdown(state.current);
    const blob = new Blob([yaml], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${state.current.slug}.md`;
    link.click();
    URL.revokeObjectURL(link.href);
    setDirty(false, 'Markdown downloaded');
  }

  function projectMarkdown(project) {
    const count = templateFor(project.layout)?.image_count || project.gallery.length;
    const gallery = project.gallery.slice(0, count).filter((item) => item.image);
    const lines = [
      '---', `layout: ${project.layout}`, `title: ${yamlString(project.title)}`,
      `description: ${yamlString(project.description)}`, `date: ${project.date}`,
      `featured: ${project.featured}`, `display: ${project.display}`,
    ];
    if (project.client) lines.push(`client: ${yamlString(project.client)}`);
    if (project.role) lines.push(`role: ${yamlString(project.role)}`);
    if (project.skills) lines.push(`skills: ${yamlString(project.skills)}`);
    if (project.thumbnail) lines.push(`thumbnail: ${yamlString(project.thumbnail)}`);
    lines.push('gallery:');
    gallery.forEach((item) => {
      lines.push(`  - image: ${yamlString(item.image)}`);
      if (item.alt) lines.push(`    alt: ${yamlString(item.alt)}`);
      lines.push(`    caption: ${yamlString(item.caption || '')}`);
    });
    lines.push('---', project.body.trim(), '');
    return lines.join('\n');
  }

  function yamlString(value) { return JSON.stringify(String(value || '')); }
  function templateFor(id) { return state.templates.find((template) => template.id === id); }
  function slugify(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function stripCaptionHtml(value = '') { return String(value).replace(/<\/?strong>/g, ''); }
  function draftKey(slug) { return `bradylin-project-draft:${slug}`; }
  function setDirty(dirty, message) { state.dirty = dirty; el.saveStatus.textContent = message || (dirty ? 'Unsaved changes' : 'No unsaved changes'); }
  function changed(message) { readForm(); setDirty(true, message || 'Unsaved changes'); renderPreview(); }
  function confirmDiscard() { return !state.dirty || window.confirm('Discard the unsaved changes in the current editor?'); }

  el.form.addEventListener('input', (event) => {
    if (event.target.name === 'title' && state.current.isNew && !el.form.elements.slug.dataset.edited) {
      el.form.elements.slug.value = slugify(event.target.value);
    }
    if (event.target.name === 'slug') el.form.elements.slug.dataset.edited = 'true';
    changed();
  });
  el.search.addEventListener('input', () => renderProjectList(el.search.value));
  el.newProject.addEventListener('click', () => { if (confirmDiscard()) loadProject(blankProject()); });
  el.saveDraft.addEventListener('click', saveDraft);
  el.exportProject.addEventListener('click', exportProject);
  el.addYoutube.addEventListener('click', addYoutube);
  el.preview.addEventListener('load', sizePreview);
  new ResizeObserver(sizePreview).observe(el.previewWrap);
  document.querySelectorAll('[data-format]').forEach((button) => button.addEventListener('click', () => formatText(button.dataset.format)));
  window.addEventListener('beforeunload', (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });

  init();
})();
