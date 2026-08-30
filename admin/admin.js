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
    countPicker: document.querySelector('#image-count-picker'),
    countLabel: document.querySelector('#image-count-label'),
    flipControl: document.querySelector('#layout-flip-control'),
    flipInput: document.querySelector('#layout-flip'),
    flipHint: document.querySelector('#layout-flip-hint'),
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
    publishProject: document.querySelector('#publish-project'),
    githubSettings: document.querySelector('#github-settings'),
    githubDialog: document.querySelector('#github-dialog'),
    githubForm: document.querySelector('#github-form'),
    githubToken: document.querySelector('#github-token'),
    githubOwner: document.querySelector('#github-owner'),
    githubRepo: document.querySelector('#github-repo'),
    githubBranch: document.querySelector('#github-branch'),
    githubStatus: document.querySelector('#github-status'),
    thumbnailDrop: document.querySelector('#thumbnail-drop'),
    thumbnailInput: document.querySelector('#thumbnail-input'),
    thumbnailImage: document.querySelector('#thumbnail-image'),
    thumbnailCardTitle: document.querySelector('#thumbnail-card-title'),
    cropThumbnail: document.querySelector('#crop-thumbnail'),
    removeThumbnail: document.querySelector('#remove-thumbnail'),
    deleteProject: document.querySelector('#delete-project'),
    cropDialog: document.querySelector('#crop-dialog'),
    cropTitle: document.querySelector('#crop-title'),
    cropStage: document.querySelector('#crop-stage'),
    cropSource: document.querySelector('#crop-source'),
    cropBox: document.querySelector('#crop-box'),
    cropPreset: document.querySelector('#crop-preset'),
    cropWidth: document.querySelector('#crop-width'),
    cropHeight: document.querySelector('#crop-height'),
    cropSourceSize: document.querySelector('#crop-source-size'),
    resetCrop: document.querySelector('#reset-crop'),
    applyCrop: document.querySelector('#apply-crop'),
  };

  const cropState = { kind: null, index: -1, image: null, source: '', fixed: false, rect: { x: 0, y: 0, width: 1, height: 1 }, drag: null };
  let workspaceSequence = 0;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]));

  function blankProject() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      slug: '', layout: 'project', gallery_style: state.templates[0]?.id || 'editorial', gallery_count: 5, gallery_flip: false, title: '', description: '',
      date: today, client: '', role: '', skills: '', thumbnail: '', featured: false,
      display: true, gallery: [], body: '', isNew: true, thumbnailPreview: '', thumbnailOriginal: '',
    };
  }

  function normalizeProject(project) {
    const normalized = { ...blankProject(), ...clone(project) };
    const legacy = {
      'project-2p': ['split', 2, false], 'project-3p': ['split', 3, true],
      'project-4p': ['rows', 4], 'project-5p': ['editorial', 5],
      'project-6p': ['masonry', 6], 'project-7p': ['hero', 7],
    };
    if (!normalized.gallery_style && legacy[normalized.layout]) {
      [normalized.gallery_style, normalized.gallery_count, normalized.gallery_flip = false] = legacy[normalized.layout];
    }
    normalized.layout = 'project';
    normalized.gallery_count = Math.max(1, Math.min(10, Number(normalized.gallery_count) || normalized.gallery.length || 1));
    normalized.gallery = Array.isArray(normalized.gallery) ? normalized.gallery.map((item) => ({
      image: item.image || '', caption: stripCaptionPrefix(item.caption || ''), alt: item.alt || '', preview: item.image || '', original: item.image || '',
    })) : [];
    normalized.thumbnailPreview = normalized.thumbnailPreview || normalized.thumbnail || '';
    normalized.thumbnailOriginal = normalized.thumbnailOriginal || normalized.thumbnail || '';
    normalized.body = htmlToMarkdown(normalized.body || '');
    normalized._workspaceId = normalized._workspaceId || normalized.slug || `new-${workspaceSequence += 1}`;
    normalized._publishedSlug = normalized._publishedSlug || normalized.slug || '';
    normalized._pending = Boolean(normalized._pending);
    return normalized;
  }

  async function init() {
    try {
      const response = await fetch('./project-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Project data returned ${response.status}`);
      const data = await response.json();
      state.templates = data.templates || [];
      const deleted = deletedProjectSlugs();
      state.projects = (data.projects || [])
        .map(normalizeProject)
        .filter((project) => !deleted.includes(project.slug))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
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
      const pending = project._pending ? 'Unpublished · ' : '';
      button.innerHTML = `${escapeHtml(project.title || 'Untitled project')}<small>${pending}${escapeHtml(templateFor(project.gallery_style)?.label || project.gallery_style)} · ${project.gallery_count} image${project.gallery_count === 1 ? '' : 's'}</small>`;
      button.addEventListener('click', () => {
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
      button.dataset.style = template.id;
      button.innerHTML = `
        ${layoutSketch(template.id)}
        <strong>${escapeHtml(template.label)}</strong>
        <small>${escapeHtml(template.description)}</small>`;
      button.addEventListener('click', () => selectStyle(template.id));
      el.templatePicker.append(button);
    });
    el.countPicker.innerHTML = '';
    for (let count = 1; count <= 10; count += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = count;
      button.dataset.count = count;
      button.addEventListener('click', () => selectImageCount(count));
      el.countPicker.append(button);
    }
  }

  function loadProject(project) {
    let source = project._workspaceId ? project : normalizeProject(project);
    const draft = !source._pending && source.slug ? readDraft(source.slug) : null;
    if (draft) {
      source = normalizeProject({ ...source, ...draft, _workspaceId: source._workspaceId, _publishedSlug: source._publishedSlug });
      source._pending = true;
      const index = state.projects.findIndex((item) => item._workspaceId === source._workspaceId);
      if (index >= 0) state.projects[index] = source;
    }
    state.current = source;
    state.loadedSlug = source._publishedSlug || source.slug || null;
    writeForm();
    updatePendingStatus(draft ? 'Browser draft loaded' : '');
    renderProjectList(el.search.value);
  }

  function writeForm() {
    const fields = ['title', 'slug', 'date', 'description', 'role', 'client', 'skills', 'body'];
    fields.forEach((name) => { el.form.elements[name].value = state.current[name] || ''; });
    el.form.elements.display.checked = Boolean(state.current.display);
    el.form.elements.featured.checked = Boolean(state.current.featured);
    updateSelectedTemplate();
    updateFlipControl();
    updateSelectedCount();
    renderSlots();
    renderThumbnail();
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

  function selectStyle(style) {
    if (state.current.gallery_style === style) return;
    // Keep the full gallery in editor state. A smaller layout merely hides its
    // extra slots; switching back restores their images, captions, and alt text.
    state.current.gallery_style = style;
    updateSelectedTemplate();
    updateFlipControl();
    renderSlots();
    changed();
  }

  function updateSelectedTemplate() {
    document.querySelectorAll('.template-card').forEach((card) => {
      const selected = card.dataset.style === state.current.gallery_style;
      card.classList.toggle('selected', selected);
      card.classList.toggle('is-flipped', selected && Boolean(state.current.gallery_flip));
    });
  }

  function layoutSketch(style) {
    const text = '<i class="mini-text"><b></b><b></b><b></b><b></b></i>';
    const image = '<i class="mini-image"></i>';
    const sketches = {
      split: `<span class="template-sketch sketch-split"><span class="mini-copy">${text}</span><span class="mini-stack">${image}${image}${image}</span></span>`,
      rows: `<span class="template-sketch sketch-rows"><span class="mini-grid-two">${image}${image}</span><span class="mini-copy">${text}</span><span class="mini-grid-two">${image}${image}</span></span>`,
      editorial: `<span class="template-sketch sketch-editorial"><span class="mini-stack">${image}${image}${image}</span><span class="mini-editor-copy">${text}${image}${image}</span></span>`,
      masonry: `<span class="template-sketch sketch-masonry"><span class="mini-copy-wide">${text}${text}</span><span class="mini-masonry">${image}${image}${image}${image}</span></span>`,
      hero: `<span class="template-sketch sketch-hero">${image}<span class="mini-hero-lower"><span class="mini-copy">${text}</span><span class="mini-grid-two">${image}${image}${image}${image}</span></span></span>`,
      filmstrip: `<span class="template-sketch sketch-filmstrip"><span class="mini-copy-wide">${text}${text}</span>${image}<span class="mini-strip">${image}${image}${image}</span></span>`,
    };
    return sketches[style] || sketches.editorial;
  }

  function updateFlipControl() {
    const template = templateFor(state.current.gallery_style);
    const flippable = Boolean(template?.flippable);
    el.flipControl.hidden = !flippable;
    el.flipInput.checked = Boolean(state.current.gallery_flip);
    el.flipHint.textContent = template?.flip_description || 'Change the orientation of this layout.';
  }

  function selectImageCount(count) {
    if (state.current.gallery_count === count) return;
    state.current.gallery_count = count;
    updateSelectedCount();
    renderSlots();
    changed('Image count updated');
  }

  function updateSelectedCount() {
    el.countPicker.querySelectorAll('button').forEach((button) => button.classList.toggle('selected', Number(button.dataset.count) === state.current.gallery_count));
    el.countLabel.textContent = `${state.current.gallery_count} image${state.current.gallery_count === 1 ? '' : 's'}`;
  }

  function activeImageCount() { return Math.max(1, Math.min(10, Number(state.current.gallery_count) || 1)); }

  function renderSlots() {
    const count = activeImageCount();
    while (state.current.gallery.length < count) state.current.gallery.push({ image: '', preview: '', caption: '', alt: '' });
    el.slots.innerHTML = '';

    for (let index = 0; index < count; index += 1) {
      const item = state.current.gallery[index];
      const slot = el.slotTemplate.content.firstElementChild.cloneNode(true);
      slot.draggable = true;
      slot.dataset.index = index;
      slot.querySelector('.slot-name').textContent = index === 0 && ['hero', 'filmstrip'].includes(state.current.gallery_style)
        ? 'Image 1 · Hero image' : `Image ${index + 1}`;
      slot.querySelector('.image-caption').value = stripCaptionPrefix(item.caption);
      slot.querySelector('.image-caption').placeholder = `Caption for Fig ${index + 1}`;
      slot.querySelector('.image-alt').value = item.alt || '';
      const drop = slot.querySelector('.image-drop');
      const img = slot.querySelector('img');
      if (item.preview || item.image) {
        drop.classList.add('has-image');
        img.src = item.preview || item.image;
        img.alt = item.alt || '';
      }
      slot.querySelector('.image-input').addEventListener('change', (event) => uploadImage(event, index));
      slot.querySelector('.remove-image').addEventListener('click', () => removeImage(index));
      slot.querySelector('.crop-image').disabled = !(item.preview || item.image);
      slot.querySelector('.crop-image').addEventListener('click', () => openCrop('gallery', index));
      slot.querySelector('.move-up').disabled = index === 0;
      slot.querySelector('.move-down').disabled = index === count - 1;
      slot.querySelector('.move-up').addEventListener('click', () => reorderImage(index, index - 1));
      slot.querySelector('.move-down').addEventListener('click', () => reorderImage(index, index + 1));
      addDragEvents(slot, index);
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
    const source = URL.createObjectURL(file);
    state.current.gallery[index] = {
      ...state.current.gallery[index], image: path, preview: source,
      original: source, fileName: file.name,
    };
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

  function reorderImage(from, to) {
    if (to < 0 || to >= activeImageCount()) return;
    syncGalleryFields();
    const [item] = state.current.gallery.splice(from, 1);
    state.current.gallery.splice(to, 0, item);
    renderSlots();
    changed('Image order updated');
  }

  function addDragEvents(slot, index) {
    slot.addEventListener('dragstart', (event) => {
      syncGalleryFields();
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
      slot.classList.add('dragging');
    });
    slot.addEventListener('dragend', () => {
      document.querySelectorAll('.image-slot').forEach((item) => item.classList.remove('dragging', 'drag-over'));
    });
    slot.addEventListener('dragover', (event) => { event.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      slot.classList.remove('drag-over');
      const from = Number(event.dataTransfer.getData('text/plain'));
      if (Number.isInteger(from) && from !== index) reorderImage(from, index);
    });
  }

  function renderPreview() {
    if (!state.current) return;
    readForm();
    const project = state.current;
    const count = activeImageCount();
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
      ${item.caption ? `<div class="gallery-caption">${formatCaption(item.caption, index)}</div>` : ''}</div>`;
  }

  function galleryMarkup(items, className, offset = 0, hero = false) {
    return `<div class="gallery ${className}">${items.map((item, index) => galleryItem(item, index + offset, hero)).join('')}</div>`;
  }

  function exactLayoutMarkup(project, gallery, stats, body) {
    const style = project.gallery_style;
    const flipped = Boolean(project.gallery_flip);
    const sectionStart = '<div class="section"><div class="container">';
    const sectionEnd = '</div></div>';
    if (style === 'split') {
      const intro = projectIntro(project, stats, 'project-stats mt-3');
      const images = `<div class="col-12 col-md-6 mb-6 mb-md-0">${galleryMarkup(gallery, 'gallery-single-column')}</div>`;
      const copy = `<div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div></div>`;
      return `${sectionStart}<div class="row justify-content-center">${flipped ? `${images}${copy}` : `${copy}${images}`}</div>${sectionEnd}`;
    }
    if (style === 'rows') {
      const firstCount = Math.min(2, gallery.length);
      const intro = projectIntro(project, stats, 'mt-4');
      const firstRow = `<div class="row mb-6"><div class="col">${galleryMarkup(gallery.slice(0, firstCount), 'gallery-two-column')}</div></div>`;
      const copyRow = `<div class="row"><div class="col-12 col-md-6">${intro}</div><div class="col-12 col-md-6"><div class="content">${body}</div></div></div>`;
      return `${sectionStart}${flipped ? `${copyRow}${firstRow}` : `${firstRow}${copyRow}`}
        ${gallery.length > firstCount ? `<div class="row mt-6"><div class="col">${galleryMarkup(gallery.slice(firstCount), 'gallery-two-column', firstCount)}</div></div>` : ''}${sectionEnd}`;
    }
    if (style === 'editorial') {
      const firstCount = Math.ceil(gallery.length / 2);
      const intro = projectIntro(project, stats, 'mt-4');
      const images = `<div class="col-12 col-md-6">${galleryMarkup(gallery.slice(0, firstCount), 'gallery-L-left')}</div>`;
      const copy = `<div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div>${gallery.length > firstCount ? galleryMarkup(gallery.slice(firstCount), 'gallery-L-right mt-4', firstCount) : ''}</div>`;
      return `${sectionStart}<div class="row">${flipped ? `${copy}${images}` : `${images}${copy}`}</div>${sectionEnd}`;
    }
    if (style === 'hero') {
      const intro = projectIntro(project, stats, 'mt-4');
      const copy = `<div class="col-12 col-md-6">${intro}<div class="content mt-4">${body}</div></div>`;
      const supporting = `<div class="col-12 col-md-6">${galleryMarkup(gallery.slice(1), 'gallery-two-column', 1)}</div>`;
      return `${sectionStart}${galleryMarkup(gallery.slice(0, 1), 'gallery-hero', 0, true)}
        <div class="row mt-6">${flipped ? `${supporting}${copy}` : `${copy}${supporting}`}</div>${sectionEnd}`;
    }
    if (style === 'filmstrip') {
      const intro = projectIntro(project, stats, 'mt-4');
      const copyRow = `<div class="row mb-6"><div class="col-12 col-md-5">${intro}</div><div class="col-12 col-md-7"><div class="content">${body}</div></div></div>`;
      const lead = galleryMarkup(gallery.slice(0, 1), 'gallery-hero', 0, true);
      return `${sectionStart}${flipped ? `${lead}${copyRow}` : `${copyRow}${lead}`}
        ${gallery.length > 1 ? galleryMarkup(gallery.slice(1), 'gallery-three-column mt-4', 1) : ''}${sectionEnd}`;
    }
    if (style === 'masonry') {
      const intro = projectIntro(project, stats, 'mt-4');
      const copyRow = `<div class="row"><div class="col-12 col-md-6 mb-4">${intro}</div><div class="col-12 col-md-6 mb-4"><div class="content">${body}</div></div></div>`;
      const images = `<div class="row"><div class="col">${galleryMarkup(gallery, 'gallery-masonry')}</div></div>`;
      return `${sectionStart}${flipped ? `${images}${copyRow}` : `${copyRow}${images}`}${sectionEnd}`;
    }
    const intro = projectIntro(project, stats, 'mt-4');
    return `${sectionStart}<div class="row"><div class="col-12">${intro}<div class="content mt-4">${body}</div></div></div>${galleryMarkup(gallery, 'gallery-two-column mt-6')}${sectionEnd}`;
  }

  function formatCaption(caption, index) {
    return `<strong>Fig ${index + 1}:</strong> ${escapeHtml(stripCaptionPrefix(caption))}`;
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

  function renderThumbnail() {
    const source = state.current.thumbnailPreview || state.current.thumbnail;
    el.thumbnailDrop.classList.toggle('has-image', Boolean(source));
    el.thumbnailImage.src = source || '';
    el.thumbnailCardTitle.textContent = state.current.title || 'Project title';
    el.cropThumbnail.disabled = !source;
    el.removeThumbnail.disabled = !source;
  }

  function uploadThumbnail(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
      window.alert('Please choose a JPG, PNG, GIF, or WebP image.');
      return;
    }
    const source = URL.createObjectURL(file);
    const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const slug = slugify(el.form.elements.slug.value || el.form.elements.title.value || 'new-project');
    state.current.thumbnail = `/assets/images/my-projects/${slug}/thumbnail.${extension}`;
    state.current.thumbnailPreview = source;
    state.current.thumbnailOriginal = source;
    state.current.thumbnailFileName = file.name;
    renderThumbnail();
    changed('Thumbnail selected locally');
  }

  function removeThumbnail() {
    if (state.current.thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(state.current.thumbnailPreview);
    state.current.thumbnail = '';
    state.current.thumbnailPreview = '';
    state.current.thumbnailOriginal = '';
    delete state.current.thumbnailCroppedData;
    renderThumbnail();
    changed('Thumbnail removed');
  }

  async function openCrop(kind, index = -1) {
    const source = kind === 'thumbnail'
      ? state.current.thumbnailOriginal || state.current.thumbnailPreview || state.current.thumbnail
      : state.current.gallery[index]?.original || state.current.gallery[index]?.preview || state.current.gallery[index]?.image;
    if (!source) return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = source;
      });
    } catch (_) {
      window.alert('This image could not be opened in the crop editor.');
      return;
    }
    cropState.kind = kind;
    cropState.index = index;
    cropState.image = image;
    cropState.source = source;
    cropState.fixed = kind === 'thumbnail';
    el.cropTitle.textContent = kind === 'thumbnail' ? 'Crop project thumbnail (4:3)' : `Crop image ${index + 1}`;
    el.cropSource.src = source;
    el.cropSourceSize.textContent = `Original image: ${image.naturalWidth} × ${image.naturalHeight} pixels`;
    el.cropPreset.value = kind === 'thumbnail' ? '4:3' : 'custom';
    el.cropPreset.disabled = kind === 'thumbnail';
    el.cropWidth.value = kind === 'thumbnail' ? 1200 : image.naturalWidth;
    el.cropHeight.value = kind === 'thumbnail' ? 900 : image.naturalHeight;
    el.cropWidth.disabled = kind === 'thumbnail';
    el.cropHeight.disabled = kind === 'thumbnail';
    setCropPreset(kind === 'thumbnail' ? '4:3' : 'custom', true);
    el.cropDialog.showModal();
    requestAnimationFrame(renderCropBox);
  }

  function resetCropControls() {
    if (cropState.fixed) {
      setCropPreset('4:3');
    } else {
      el.cropPreset.value = 'custom';
      el.cropWidth.value = cropState.image.naturalWidth;
      el.cropHeight.value = cropState.image.naturalHeight;
      setCropPreset('custom', true);
    }
  }

  function cropDimensions() {
    return {
      width: Math.max(1, Math.min(12000, Number(el.cropWidth.value) || cropState.image?.naturalWidth || 1200)),
      height: Math.max(1, Math.min(12000, Number(el.cropHeight.value) || cropState.image?.naturalHeight || 900)),
    };
  }

  function presetRatio(preset = el.cropPreset.value) {
    if (preset === 'free') return null;
    if (preset === 'custom') {
      const output = cropDimensions();
      return output.width / output.height;
    }
    const [width, height] = preset.split(':').map(Number);
    return width / height;
  }

  function setCropPreset(preset, useFullImage = false) {
    if (!cropState.image) return;
    const image = cropState.image;
    if (preset === 'custom' && useFullImage) {
      cropState.rect = { x: 0, y: 0, width: 1, height: 1 };
      el.cropWidth.value = image.naturalWidth;
      el.cropHeight.value = image.naturalHeight;
      el.cropWidth.disabled = false;
      el.cropHeight.disabled = false;
    } else {
      el.cropWidth.disabled = cropState.fixed;
      el.cropHeight.disabled = cropState.fixed;
      if (preset === 'free') {
        cropState.rect = { x: .1, y: .1, width: .8, height: .8 };
        updateFreeformDimensions();
      } else {
        if (preset !== 'custom' && !cropState.fixed) {
          const standardSizes = { '1:1': [1200, 1200], '4:3': [1600, 1200], '3:2': [1800, 1200], '16:9': [1920, 1080], '21:9': [2100, 900] };
          [el.cropWidth.value, el.cropHeight.value] = standardSizes[preset];
        }
        cropState.rect = largestCenteredRect(presetRatio(preset));
      }
    }
    renderCropBox();
  }

  function largestCenteredRect(aspect) {
    const image = cropState.image;
    const normalizedRatio = aspect * image.naturalHeight / image.naturalWidth;
    let width = 1;
    let height = 1 / normalizedRatio;
    if (height > 1) { height = 1; width = normalizedRatio; }
    return { x: (1 - width) / 2, y: (1 - height) / 2, width, height };
  }

  function renderCropBox() {
    const rect = cropState.rect;
    el.cropBox.style.left = `${rect.x * 100}%`;
    el.cropBox.style.top = `${rect.y * 100}%`;
    el.cropBox.style.width = `${rect.width * 100}%`;
    el.cropBox.style.height = `${rect.height * 100}%`;
  }

  function updateFreeformDimensions() {
    if (!cropState.image || el.cropPreset.value !== 'free') return;
    el.cropWidth.value = Math.max(1, Math.round(cropState.rect.width * cropState.image.naturalWidth));
    el.cropHeight.value = Math.max(1, Math.round(cropState.rect.height * cropState.image.naturalHeight));
  }

  function applyCrop() {
    if (!cropState.image) return;
    const output = cropDimensions();
    const canvas = document.createElement('canvas');
    canvas.width = output.width;
    canvas.height = output.height;
    const rect = cropState.rect;
    canvas.getContext('2d').drawImage(
      cropState.image,
      Math.round(rect.x * cropState.image.naturalWidth),
      Math.round(rect.y * cropState.image.naturalHeight),
      Math.round(rect.width * cropState.image.naturalWidth),
      Math.round(rect.height * cropState.image.naturalHeight),
      0, 0, output.width, output.height,
    );
    const data = canvas.toDataURL('image/jpeg', 0.9);
    if (cropState.kind === 'thumbnail') {
      state.current.thumbnailPreview = data;
      state.current.thumbnailCroppedData = data;
      const slug = state.current.slug || 'new-project';
      state.current.thumbnail = `/assets/images/my-projects/${slug}/thumbnail.jpg`;
      renderThumbnail();
    } else {
      const item = state.current.gallery[cropState.index];
      item.preview = data;
      item.croppedData = data;
      item.image = item.image.replace(/\.[a-z0-9]+$/i, '.jpg');
      item.crop = { width: output.width, height: output.height, ...cropState.rect, preset: el.cropPreset.value };
      renderSlots();
    }
    el.cropDialog.close();
    changed('Crop applied');
  }

  function beginCropPointer(event) {
    if (!cropState.image) return;
    const handle = event.target.closest('[data-handle]')?.dataset.handle || '';
    cropState.drag = {
      mode: handle ? 'resize' : 'move', handle,
      startX: event.clientX, startY: event.clientY,
      rect: { ...cropState.rect },
    };
    el.cropBox.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveCropPointer(event) {
    const drag = cropState.drag;
    if (!drag) return;
    const imageWidth = el.cropSource.clientWidth;
    const imageHeight = el.cropSource.clientHeight;
    const dx = (event.clientX - drag.startX) / imageWidth;
    const dy = (event.clientY - drag.startY) / imageHeight;
    if (drag.mode === 'move') {
      cropState.rect.x = clamp(drag.rect.x + dx, 0, 1 - drag.rect.width);
      cropState.rect.y = clamp(drag.rect.y + dy, 0, 1 - drag.rect.height);
    } else {
      resizeCropRect(drag, dx, dy);
    }
    updateFreeformDimensions();
    renderCropBox();
  }

  function endCropPointer() { cropState.drag = null; }

  function resizeCropRect(drag, dx, dy) {
    const handle = drag.handle;
    const original = drag.rect;
    const minWidth = Math.min(.25, 36 / Math.max(1, el.cropSource.clientWidth));
    const minHeight = Math.min(.25, 36 / Math.max(1, el.cropSource.clientHeight));
    const ratio = presetRatio();
    if (!ratio) {
      let left = original.x;
      let top = original.y;
      let right = original.x + original.width;
      let bottom = original.y + original.height;
      if (handle.includes('w')) left = clamp(original.x + dx, 0, right - minWidth);
      if (handle.includes('e')) right = clamp(right + dx, left + minWidth, 1);
      if (handle.includes('n')) top = clamp(original.y + dy, 0, bottom - minHeight);
      if (handle.includes('s')) bottom = clamp(bottom + dy, top + minHeight, 1);
      cropState.rect = { x: left, y: top, width: right - left, height: bottom - top };
      return;
    }

    const normalizedRatio = ratio * cropState.image.naturalHeight / cropState.image.naturalWidth;
    if (handle.length === 1) {
      const centerX = original.x + original.width / 2;
      const centerY = original.y + original.height / 2;
      if (handle === 'e' || handle === 'w') {
        const anchorX = handle === 'e' ? original.x : original.x + original.width;
        let width = Math.max(minWidth, Math.abs((handle === 'e' ? original.x + original.width + dx : original.x + dx) - anchorX));
        let height = width / normalizedRatio;
        width = Math.min(width, handle === 'e' ? 1 - anchorX : anchorX, Math.min(centerY, 1 - centerY) * 2 * normalizedRatio);
        height = width / normalizedRatio;
        cropState.rect = { x: handle === 'e' ? anchorX : anchorX - width, y: centerY - height / 2, width, height };
      } else {
        const anchorY = handle === 's' ? original.y : original.y + original.height;
        let height = Math.max(minHeight, Math.abs((handle === 's' ? original.y + original.height + dy : original.y + dy) - anchorY));
        let width = height * normalizedRatio;
        height = Math.min(height, handle === 's' ? 1 - anchorY : anchorY, Math.min(centerX, 1 - centerX) * 2 / normalizedRatio);
        width = height * normalizedRatio;
        cropState.rect = { x: centerX - width / 2, y: handle === 's' ? anchorY : anchorY - height, width, height };
      }
      return;
    }

    const east = handle.includes('e');
    const south = handle.includes('s');
    const anchorX = east ? original.x : original.x + original.width;
    const anchorY = south ? original.y : original.y + original.height;
    const pointerX = clamp(east ? original.x + original.width + dx : original.x + dx, 0, 1);
    const pointerY = clamp(south ? original.y + original.height + dy : original.y + dy, 0, 1);
    let width = Math.max(minWidth, Math.abs(pointerX - anchorX));
    let heightFromWidth = width / normalizedRatio;
    const heightFromPointer = Math.max(minHeight, Math.abs(pointerY - anchorY));
    if (Math.abs(dy) > Math.abs(dx)) {
      heightFromWidth = heightFromPointer;
      width = heightFromWidth * normalizedRatio;
    }
    const maxWidth = east ? 1 - anchorX : anchorX;
    const maxHeight = south ? 1 - anchorY : anchorY;
    width = Math.min(width, maxWidth, maxHeight * normalizedRatio);
    const height = width / normalizedRatio;
    cropState.rect = {
      x: east ? anchorX : anchorX - width,
      y: south ? anchorY : anchorY - height,
      width, height,
    };
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function githubConfig() {
    try {
      const saved = JSON.parse(sessionStorage.getItem('bradylin-github-publishing') || 'null');
      return saved?.token && saved?.owner && saved?.repo && saved?.branch ? saved : null;
    } catch (_) { return null; }
  }

  function openGithubSettings(message = '') {
    const config = githubConfig() || { owner: 'Bylin-code', repo: 'bylin-code.github.io', branch: 'main', token: '' };
    el.githubToken.value = config.token;
    el.githubOwner.value = config.owner;
    el.githubRepo.value = config.repo;
    el.githubBranch.value = config.branch;
    el.githubStatus.textContent = message;
    el.githubDialog.showModal();
  }

  async function connectGithub(event) {
    event.preventDefault();
    const config = {
      token: el.githubToken.value.trim(), owner: el.githubOwner.value.trim(),
      repo: el.githubRepo.value.trim(), branch: el.githubBranch.value.trim(),
    };
    sessionStorage.setItem('bradylin-github-publishing', JSON.stringify(config));
    el.githubStatus.textContent = 'Checking repository access…';
    try {
      await githubApi(`/branches/${encodeURIComponent(config.branch)}`, {}, config);
      el.githubDialog.close();
      setDirty(state.dirty, `Connected to ${config.owner}/${config.repo} · ${config.branch}`);
    } catch (error) {
      sessionStorage.removeItem('bradylin-github-publishing');
      el.githubStatus.textContent = friendlyGithubError(error);
    }
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

  function friendlyGithubError(error) {
    if (error.status === 401) return 'GitHub rejected this token. Check that it is current and copied completely.';
    if (error.status === 403) return 'The token needs Contents: Read and write permission for this repository.';
    if (error.status === 404) return 'Repository or branch not found. Check the owner, repository, branch, and token access.';
    return error.message || 'GitHub publishing failed.';
  }

  function publishingError(error) {
    console.error(error);
    window.alert(`Publishing failed: ${friendlyGithubError(error)}\n\nNothing was partially published.`);
    setDirty(true, 'Publishing failed');
  }

  function setPublishing(busy, message = '') {
    el.publishProject.disabled = busy;
    el.githubSettings.disabled = busy;
    el.deleteProject.disabled = busy;
    el.publishProject.classList.toggle('is-busy', busy);
    const count = pendingProjects().length;
    el.publishProject.textContent = busy ? 'Publishing…' : (count > 1 ? `Publish ${count} projects` : 'Publish to GitHub');
    if (message) el.saveStatus.textContent = message;
  }

  async function sourceBase64(source) {
    const blob = await fetch(source).then((response) => {
      if (!response.ok) throw new Error(`Could not read an image selected for upload (${response.status}).`);
      return response.blob();
    });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Could not prepare an image for GitHub.'));
      reader.readAsDataURL(blob);
    });
  }

  async function createBlob(content, encoding = 'utf-8') {
    const blob = await githubApi('/git/blobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, encoding }),
    });
    return blob.sha;
  }

  async function commitChanges(entries, message) {
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
        el.saveStatus.textContent = `The branch changed while publishing; retrying (${attempt}/${maxAttempts - 1})…`;
      }
    }
    throw new Error('GitHub publishing could not update the branch.');
  }

  function isLocalImage(source = '') { return source.startsWith('blob:') || source.startsWith('data:'); }

  async function publishProject() {
    readForm();
    if (state.current._pending && !el.form.reportValidity()) return;
    if (!githubConfig()) { openGithubSettings('Connect once, then press Publish again.'); return; }
    const projects = pendingProjects();
    if (!projects.length) { setDirty(false, 'There are no unpublished project changes'); return; }
    const invalid = projects.find((project) => !project.title || !project.slug || !project.date || !project.description);
    if (invalid) {
      window.alert(`${invalid.title || 'An unpublished project'} is missing its title, URL name, date, or short description.`);
      loadProject(invalid);
      return;
    }
    const incomplete = projects.filter((project) => {
      const count = Math.max(1, Math.min(10, Number(project.gallery_count) || 1));
      return project.gallery.slice(0, count).some((item) => !item.image);
    });
    if (incomplete.length && !window.confirm(`${incomplete.map((project) => project.title).join(', ')} ${incomplete.length === 1 ? 'has' : 'have'} empty image slots. Publish anyway?`)) return;
    try {
      setPublishing(true, `Preparing ${projects.length} project${projects.length === 1 ? '' : 's'}…`);
      const entries = [];
      const images = [];
      for (const project of projects) {
        const markdownSha = await createBlob(projectMarkdown(project));
        entries.push({ path: `content/_projects/${project.slug}.md`, mode: '100644', type: 'blob', sha: markdownSha });
        const thumbnailSource = project.thumbnailCroppedData || project.thumbnailPreview;
        if (project.thumbnail && isLocalImage(thumbnailSource)) images.push({ path: project.thumbnail, source: thumbnailSource });
        const count = Math.max(1, Math.min(10, Number(project.gallery_count) || 1));
        project.gallery.slice(0, count).forEach((item) => {
          const source = item.croppedData || item.preview;
          if (item.image && isLocalImage(source)) images.push({ path: item.image, source });
        });
        if (project._publishedSlug && project._publishedSlug !== project.slug) {
          entries.push({ path: `content/_projects/${project._publishedSlug}.md`, mode: '100644', type: 'blob', sha: null });
        }
      }
      const uniqueImages = [...new Map(images.map((image) => [image.path, image])).values()];
      for (let index = 0; index < uniqueImages.length; index += 1) {
        el.saveStatus.textContent = `Uploading image ${index + 1} of ${uniqueImages.length}…`;
        const sha = await createBlob(await sourceBase64(uniqueImages[index].source), 'base64');
        entries.push({ path: uniqueImages[index].path.replace(/^\//, ''), mode: '100644', type: 'blob', sha });
      }
      el.saveStatus.textContent = 'Creating one GitHub commit…';
      const titles = projects.map((project) => project.title);
      const message = projects.length === 1
        ? `${projects[0].isNew ? 'Add' : 'Update'} project: ${titles[0]}`
        : `Update ${projects.length} projects: ${titles.join(', ')}`;
      await commitChanges(entries, message);

      projects.forEach((project) => {
        project.isNew = false;
        project._pending = false;
        project._publishedSlug = project.slug;
        project.thumbnailPreview = project.thumbnail;
        project.thumbnailOriginal = project.thumbnail;
        delete project.thumbnailCroppedData;
        project.gallery.forEach((item) => {
          item.preview = item.image; item.original = item.image;
          delete item.croppedData; delete item.fileName;
        });
        localStorage.removeItem(draftKey(project.slug));
      });
      state.loadedSlug = state.current.slug;
      state.projects.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const publishedSlugs = new Set(projects.map((project) => project.slug));
      const deleted = deletedProjectSlugs().filter((slug) => !publishedSlugs.has(slug));
      localStorage.setItem('bradylin-deleted-projects', JSON.stringify(deleted));
      renderProjectList(el.search.value);
      setDirty(false, `${projects.length} project${projects.length === 1 ? '' : 's'} published in one commit; GitHub Pages is rebuilding`);
    } catch (error) { publishingError(error); }
    finally { setPublishing(false); }
  }

  async function deleteCurrentProject() {
    const project = state.current;
    if (!project || (!project.slug && !project.title)) return;
    const expected = project.title || project.slug;
    const target = project.isNew ? 'this draft' : 'GitHub and the live site';
    const confirmation = window.prompt(`Type “${expected}” to delete this project from ${target}.`);
    if (confirmation !== expected) return;
    if (!project.isNew) {
      if (!githubConfig()) { openGithubSettings('Connect GitHub before deleting a published project.'); return; }
      try {
        setPublishing(true, 'Deleting project from GitHub…');
        const prefix = `assets/images/my-projects/${project.slug}/`;
        const tree = await githubApi(`/git/trees/${encodeURIComponent(githubConfig().branch)}?recursive=1`);
        const deletions = tree.tree
          .filter((entry) => entry.path === `content/_projects/${project.slug}.md` || entry.path.startsWith(prefix))
          .map((entry) => ({ path: entry.path, mode: '100644', type: 'blob', sha: null }));
        if (!deletions.length) throw new Error('GitHub could not find this project on the publishing branch.');
        await commitChanges(deletions, `Delete project: ${project.title}`);
      } catch (error) {
        publishingError(error);
        return;
      } finally { setPublishing(false); }
    }
    if (project.slug) {
      const deleted = deletedProjectSlugs();
      if (!deleted.includes(project.slug)) deleted.push(project.slug);
      localStorage.setItem('bradylin-deleted-projects', JSON.stringify(deleted));
      localStorage.removeItem(draftKey(project.slug));
      state.projects = state.projects.filter((item) => item.slug !== project.slug);
    }
    loadProject(state.projects[0] || blankProject());
    setDirty(false, project.isNew ? 'Draft removed' : 'Project deleted from GitHub; the site is rebuilding');
  }

  function deletedProjectSlugs() {
    try { return JSON.parse(localStorage.getItem('bradylin-deleted-projects') || '[]'); } catch (_) { return []; }
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
      if (item.original?.startsWith('blob:')) item.original = '';
      delete item.fileName;
    });
    if (safeProject.thumbnailPreview?.startsWith('blob:')) safeProject.thumbnailPreview = '';
    if (safeProject.thumbnailOriginal?.startsWith('blob:')) safeProject.thumbnailOriginal = '';
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
    const count = Math.max(1, Math.min(10, Number(project.gallery_count) || project.gallery.length));
    const gallery = project.gallery.slice(0, count).filter((item) => item.image);
    const lines = [
      '---', 'layout: project', `gallery_style: ${project.gallery_style}`, `gallery_count: ${count}`,
      `gallery_flip: ${Boolean(project.gallery_flip)}`, `title: ${yamlString(project.title)}`,
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
  function stripCaptionPrefix(value = '') {
    return String(value).replace(/^\s*(?:<strong>)?Fig\s+\d+:(?:<\/strong>)?\s*/i, '').trim();
  }
  function draftKey(slug) { return `bradylin-project-draft:${slug}`; }
  function pendingProjects() { return state.projects.filter((project) => project._pending); }
  function ensureCurrentInWorkspace() {
    if (!state.current) return;
    const index = state.projects.findIndex((project) => project._workspaceId === state.current._workspaceId);
    if (index >= 0) state.projects[index] = state.current;
    else state.projects.push(state.current);
  }
  function updatePendingStatus(message = '') {
    const count = pendingProjects().length;
    state.dirty = count > 0;
    el.saveStatus.textContent = message || (count ? `${count} unpublished project${count === 1 ? '' : 's'}` : 'No unpublished changes');
    el.publishProject.textContent = count > 1 ? `Publish ${count} projects` : 'Publish to GitHub';
  }
  function setDirty(dirty, message) {
    if (dirty && state.current) {
      state.current._pending = true;
      ensureCurrentInWorkspace();
    }
    updatePendingStatus(message);
  }
  function changed(message) {
    readForm();
    state.current._pending = true;
    ensureCurrentInWorkspace();
    updatePendingStatus(message || 'Unpublished changes');
    renderProjectList(el.search.value);
    renderThumbnail();
    renderPreview();
  }

  el.form.addEventListener('input', (event) => {
    if (event.target.name === 'title' && state.current.isNew && !el.form.elements.slug.dataset.edited) {
      el.form.elements.slug.value = slugify(event.target.value);
    }
    if (event.target.name === 'slug') el.form.elements.slug.dataset.edited = 'true';
    changed();
  });
  el.search.addEventListener('input', () => renderProjectList(el.search.value));
  el.flipInput.addEventListener('change', () => {
    state.current.gallery_flip = el.flipInput.checked;
    updateSelectedTemplate();
    changed('Layout orientation updated');
  });
  el.newProject.addEventListener('click', () => loadProject(blankProject()));
  el.saveDraft.addEventListener('click', saveDraft);
  el.exportProject.addEventListener('click', exportProject);
  el.publishProject.addEventListener('click', publishProject);
  el.githubSettings.addEventListener('click', () => openGithubSettings());
  el.githubForm.addEventListener('submit', connectGithub);
  el.addYoutube.addEventListener('click', addYoutube);
  el.thumbnailInput.addEventListener('change', uploadThumbnail);
  el.cropThumbnail.addEventListener('click', () => openCrop('thumbnail'));
  el.removeThumbnail.addEventListener('click', removeThumbnail);
  el.deleteProject.addEventListener('click', deleteCurrentProject);
  el.cropPreset.addEventListener('change', () => setCropPreset(el.cropPreset.value));
  [el.cropWidth, el.cropHeight].forEach((input) => input.addEventListener('input', () => {
    if (el.cropPreset.value === 'custom') {
      cropState.rect = largestCenteredRect(presetRatio('custom'));
      renderCropBox();
    }
  }));
  el.cropBox.addEventListener('pointerdown', beginCropPointer);
  el.cropBox.addEventListener('pointermove', moveCropPointer);
  el.cropBox.addEventListener('pointerup', endCropPointer);
  el.cropBox.addEventListener('pointercancel', endCropPointer);
  el.resetCrop.addEventListener('click', resetCropControls);
  el.applyCrop.addEventListener('click', applyCrop);
  el.preview.addEventListener('load', sizePreview);
  new ResizeObserver(sizePreview).observe(el.previewWrap);
  document.querySelectorAll('[data-format]').forEach((button) => button.addEventListener('click', () => formatText(button.dataset.format)));
  window.addEventListener('beforeunload', (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });

  init();
})();
